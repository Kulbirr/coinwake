import { env } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { cacheGetJson, cacheSetJson } from "../../db/redis.js";
import { ProviderHttpError, ProviderRateLimitError } from "../../core/http.js";
import type { CandlePoint, ChartRange, Coin } from "../../core/types.js";
import type {
  CoinSearchResult,
  CryptoDataProvider,
  MarketData,
  PriceQuote,
  SupplyData,
} from "./CryptoDataProvider.js";

const log = createLogger("crypto-cache");

/**
 * Wraps any CryptoDataProvider with the TTL policy from spec 34: metadata is
 * cached for a long time, prices for seconds, historical series in between.
 *
 * Spec 33/35: when the upstream is rate limited or down we fall back to the last
 * good value rather than failing the request, and mark it `stale` so the UI can
 * say "prices may be delayed" instead of showing an error.
 */
export class CachedCryptoProvider implements CryptoDataProvider {
  readonly name: string;

  /** Last known good values, kept in-process as a second line of defence behind
   *  the shared cache — survives a Redis outage, lost on restart. */
  private readonly lastGood = new Map<string, unknown>();

  constructor(private readonly inner: CryptoDataProvider) {
    this.name = `cached:${inner.name}`;
  }

  private key(parts: string): string {
    return `crypto:${this.inner.name}:${parts}`;
  }

  /**
   * Read-through cache with a stale fallback. `onStale` lets callers mark the
   * value (only Coin-shaped results carry a `stale` flag).
   */
  private async through<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
    onStale?: (value: T) => T,
  ): Promise<T> {
    const cached = await cacheGetJson<T>(key);
    if (cached !== null) return cached;

    try {
      const fresh = await load();
      // `undefined` means "no such coin" — don't serialise a miss into the cache.
      if (fresh !== undefined) {
        await cacheSetJson(key, fresh, ttlSeconds);
        this.lastGood.set(key, fresh);
      }
      return fresh;
    } catch (err) {
      const fallback = this.lastGood.get(key) as T | undefined;
      const transient = err instanceof ProviderRateLimitError || err instanceof ProviderHttpError;

      if (fallback !== undefined && transient) {
        log.warn(`${key}: serving stale data (${(err as Error).message})`);
        return onStale ? onStale(fallback) : fallback;
      }
      throw err;
    }
  }

  private static markStale<T extends { stale?: boolean }>(value: T): T {
    return { ...value, stale: true };
  }

  async searchCoins(query: string, limit = 12): Promise<CoinSearchResult[]> {
    const normalized = query.trim().toLowerCase();
    const results = await this.through(
      this.key(`search:${normalized}:${limit}`),
      env.CACHE_TTL_METADATA,
      () => this.inner.searchCoins(query, limit),
    );

    // If the result set is empty, re-write with a short TTL so a miss doesn't
    // pin an empty array for 24h. This preserves "search it a minute later".
    if (results.length === 0) {
      const shortKey = this.key(`search:${normalized}:${limit}:short`);
      await cacheSetJson(shortKey, results, 60); // 1 minute
    }

    return results;
  }

  async getCoin(coinId: string): Promise<Coin | undefined> {
    const [coin] = await this.getCoins([coinId]);
    return coin;
  }

  /**
   * Batched read-through for whole coin records: one upstream request covers
   * every cache miss, however many there are.
   *
   * A coin record mixes slow metadata with a fast-moving price, so it takes the
   * short market TTL; the poller refreshes it well inside that window.
   */
  async getCoins(coinIds: string[]): Promise<Coin[]> {
    if (coinIds.length === 0) return [];

    const hits: Coin[] = [];
    const missing: string[] = [];

    for (const id of coinIds) {
      const hit = await cacheGetJson<Coin>(this.key(`coin:${id}`));
      if (hit) hits.push(hit);
      else missing.push(id);
    }

    if (missing.length === 0) return hits;

    try {
      const fresh = await this.inner.getCoins(missing);
      await this.primeCoins(fresh);
      return [...hits, ...fresh];
    } catch (err) {
      const transient = err instanceof ProviderRateLimitError || err instanceof ProviderHttpError;
      const stale = missing
        .map((id) => this.lastGood.get(this.key(`coin:${id}`)) as Coin | undefined)
        .filter((c): c is Coin => c !== undefined)
        .map((c) => CachedCryptoProvider.markStale(c));

      if (transient && stale.length > 0) {
        log.warn(`coins: serving ${stale.length} stale record(s) (${(err as Error).message})`);
        return [...hits, ...stale];
      }
      // Partial data beats an error page when at least something was cached.
      if (hits.length > 0) return hits;
      throw err;
    }
  }

  async getPrices(coinIds: string[]): Promise<PriceQuote[]> {
    if (coinIds.length === 0) return [];

    const missing: string[] = [];
    const quotes: PriceQuote[] = [];

    for (const id of coinIds) {
      const hit = await cacheGetJson<PriceQuote>(this.key(`price:${id}`));
      if (hit) quotes.push(hit);
      else missing.push(id);
    }

    if (missing.length === 0) return quotes;

    try {
      const fresh = await this.inner.getPrices(missing);
      for (const quote of fresh) {
        const key = this.key(`price:${quote.coinId}`);
        await cacheSetJson(key, quote, env.CACHE_TTL_PRICE);
        this.lastGood.set(key, quote);
      }
      return [...quotes, ...fresh];
    } catch (err) {
      const stale = missing
        .map((id) => this.lastGood.get(this.key(`price:${id}`)) as PriceQuote | undefined)
        .filter((q): q is PriceQuote => q !== undefined);

      if (stale.length > 0) {
        log.warn(`prices: serving ${stale.length} stale quote(s) (${(err as Error).message})`);
        return [...quotes, ...stale];
      }
      // Partial data beats an error page when at least something was cached.
      if (quotes.length > 0) return quotes;
      throw err;
    }
  }

  async getPrice(coinId: string): Promise<PriceQuote | undefined> {
    const [quote] = await this.getPrices([coinId]);
    return quote;
  }

  async getMarketData(coinId: string): Promise<MarketData | undefined> {
    return this.through(this.key(`market:${coinId}`), env.CACHE_TTL_MARKET, () =>
      this.inner.getMarketData(coinId),
    );
  }

  async getSupply(coinId: string): Promise<SupplyData | undefined> {
    // Supply barely moves — this is the "metadata" bucket in spec 34.
    return this.through(this.key(`supply:${coinId}`), env.CACHE_TTL_METADATA, () =>
      this.inner.getSupply(coinId),
    );
  }

  async getHistoricalPrices(coinId: string, range: ChartRange): Promise<CandlePoint[]> {
    // Older windows change slowly, so they earn a longer TTL than intraday.
    const ttl = range === "1H" || range === "24H" ? env.CACHE_TTL_CHART : env.CACHE_TTL_CHART * 4;
    return this.through(this.key(`chart:${coinId}:${range}`), ttl, () =>
      this.inner.getHistoricalPrices(coinId, range),
    );
  }

  async getTrendingCoins(limit = 6): Promise<Coin[]> {
    return this.through(this.key(`trending:${limit}`), env.CACHE_TTL_MARKET, () =>
      this.inner.getTrendingCoins(limit),
    );
  }

  async listCoins(limit = 50): Promise<Coin[]> {
    return this.through(
      this.key(`list:${limit}`),
      env.CACHE_TTL_MARKET,
      () => this.inner.listCoins(limit),
      (coins) => coins.map((c) => CachedCryptoProvider.markStale(c)),
    );
  }

  /**
   * Fills the coin and price caches from a single upstream payload. Doing both
   * from one response is what removes the old invalidate-then-refetch dance: the
   * quote and the coin record can't disagree if they were never fetched apart.
   */
  private async primeCoins(coins: Coin[]): Promise<void> {
    for (const coin of coins) {
      const coinKey = this.key(`coin:${coin.id}`);
      await cacheSetJson(coinKey, coin, env.CACHE_TTL_MARKET);
      this.lastGood.set(coinKey, coin);

      const quote: PriceQuote = {
        coinId: coin.id,
        price: coin.price,
        change24h: coin.change24h,
        updatedAt: coin.updatedAt,
      };
      const priceKey = this.key(`price:${coin.id}`);
      await cacheSetJson(priceKey, quote, env.CACHE_TTL_PRICE);
      this.lastGood.set(priceKey, quote);
    }
  }

  /**
   * The price poller's entry point: fetch straight from the vendor and prime both
   * caches. It skips the cache read on purpose — making the cache fresh is the
   * job, so reading it first would just return last tick's prices.
   *
   * Unlike the user-facing getters this lets a rate-limit error propagate. The
   * poller is the one caller that has to know it was throttled so it can back off
   * (spec 33); everyone else keeps being served last-known-good values.
   */
  async refreshCoins(coinIds: string[]): Promise<Coin[]> {
    if (coinIds.length === 0) return [];
    const fresh = await this.inner.getCoins(coinIds);
    await this.primeCoins(fresh);
    return fresh;
  }
}
