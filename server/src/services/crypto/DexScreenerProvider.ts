import { createLogger } from "../../config/logger.js";
import { fetchJson } from "../../core/http.js";
import type { CandlePoint, ChartRange, Coin } from "../../core/types.js";
import {
  type CoinSearchResult,
  type CryptoDataProvider,
  type MarketData,
  type PriceQuote,
  type SupplyData,
} from "./CryptoDataProvider.js";

const log = createLogger("dexscreener");

/** DexScreener pair response shape (subset we actually use). */
interface DsPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative: string;
  priceUsd: string;
  txns: Record<string, { buys: number; sells: number }>;
  volume: Record<string, number>;
  priceChange: Record<string, number>;
  liquidity?: { usd: number; base: number; quote: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: Array<{ url: string; label: string }>;
    socials?: Array<{ url: string; type: string }>;
  };
}

/** DexScreener token-pairs endpoint returns a raw array of pairs. */
type DsTokenPairsResponse = DsPair[];

interface DsSearchResponse {
  pairs?: DsPair[];
}

/**
 * Solana token data from DexScreener.
 * Implements CryptoDataProvider so it can sit behind CachedCryptoProvider
 * and be swapped into the composite without any route changes.
 *
 * ID scheme: "sol:{baseTokenAddress}" — stable, chain-scoped, and never
 * collides with CoinGecko slugs (which are bare words like "bitcoin").
 */
export class DexScreenerProvider implements CryptoDataProvider {
  readonly name = "dexscreener";

  private readonly base = "https://api.dexscreener.com";

  private get<T>(path: string): Promise<T> {
    return fetchJson<T>(`${this.base}${path}`);
  }

  /**
   * Pick the canonical pair for a token: the highest-liquidity pool where the
   * token is the *base* (not quote). A token appears in both roles and the
   * price means the inverse thing in the quote position.
   */
  private pickCanonicalPair(pairs: DsPair[], baseMint: string): DsPair | undefined {
    const basePairs = pairs
      .filter((p) => p.baseToken.address.toLowerCase() === baseMint.toLowerCase())
      .filter((p) => (p.liquidity?.usd ?? 0) > 0)
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
    return basePairs[0];
  }

  /** Build our Coin type from the canonical DexScreener pair. */
  private toCoin(pair: DsPair): Coin {
    const price = Number(pair.priceUsd) || 0;
    const baseMint = pair.baseToken.address;
    const id = `sol:${baseMint}`;

    return {
      id,
      symbol: pair.baseToken.symbol.trim().toUpperCase(),
      name: pair.baseToken.name.trim(),
      logo: pair.info?.imageUrl ?? "",
      color: this.colorFor(baseMint),
      price,
      change24h: pair.priceChange.h24 ?? 0,
      marketCap: pair.marketCap ?? pair.fdv ?? 0,
      fdv: pair.fdv,
      volume24h: pair.volume.h24 ?? 0,
      liquidity: pair.liquidity?.usd,
      rank: 0, // DEX tokens have no CEX rank; 0 hides the badge
      updatedAt: Date.now(),
      // Supply / ATH / ATL / sparkline not available from DexScreener
    };
  }

  /** Deterministic hue from mint so the same token always renders the same colour. */
  private colorFor(mint: string): string {
    let h = 0;
    for (let i = 0; i < mint.length; i++) h = (h * 31 + mint.charCodeAt(i)) % 360;
    return `hsl(${h} 70% 55%)`;
  }

  /** Search endpoint — returns CoinSearchResult[] for the WEB3 tab. */
  async searchCoins(query: string, limit = 12): Promise<CoinSearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const res = await this.get<DsSearchResponse>(
        `/latest/dex/search?q=${encodeURIComponent(q)}`,
      );
      const pairs = res.pairs ?? [];

      // Filter to Solana pairs where the query matches base token symbol/name/address
      const lowerQ = q.toLowerCase();
      const solanaPairs = pairs
        .filter((p) => p.chainId === "solana")
        .filter((p) => {
          const sym = p.baseToken.symbol.toLowerCase();
          const name = p.baseToken.name.toLowerCase();
          const addr = p.baseToken.address.toLowerCase();
          return sym.includes(lowerQ) || name.includes(lowerQ) || addr === lowerQ;
        })
        .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));

      // Deduplicate by base mint, keep highest-liquidity pair
      const seen = new Set<string>();
      const results: CoinSearchResult[] = [];
      for (const pair of solanaPairs) {
        const mint = pair.baseToken.address.toLowerCase();
        if (seen.has(mint)) continue;
        seen.add(mint);

        const canonical = this.pickCanonicalPair(pairs, mint);
        if (!canonical) continue;

        const coin = this.toCoin(canonical);
        results.push({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          logo: coin.logo,
          color: coin.color,
          rank: coin.rank,
        });

        if (results.length >= limit) break;
      }

      return results;
    } catch (err) {
      log.warn(`searchCoins failed for "${q}": ${(err as Error).message}`);
      return [];
    }
  }

  /** Resolve a single coin by our sol:mint id. */
  async getCoin(coinId: string): Promise<Coin | undefined> {
    const [coin] = await this.getCoins([coinId]);
    return coin;
  }

  /**
   * Batched fetch — one upstream request per ~30 mints (DexScreener accepts
   * comma-separated mints). The poller calls this every tick for every
   * tracked coin, so batching is essential (spec 31/33).
   */
  async getCoins(coinIds: string[]): Promise<Coin[]> {
    if (coinIds.length === 0) return [];

    const mints = coinIds
      .filter((id) => id.startsWith("sol:"))
      .map((id) => id.slice(4));
    if (mints.length === 0) return [];

    const coins: Coin[] = [];
    // DexScreener handles ~30 mints per request; chunk to stay safe
    const CHUNK_SIZE = 30;
    for (let i = 0; i < mints.length; i += CHUNK_SIZE) {
      const chunk = mints.slice(i, i + CHUNK_SIZE);
      try {
        const pairs = await this.get<DsTokenPairsResponse>(
          `/token-pairs/v1/solana/${chunk.join(",")}`,
        );
        const pairsArr = Array.isArray(pairs) ? pairs : [];

        // Group pairs by base mint
        const byMint = new Map<string, DsPair[]>();
        for (const pair of pairsArr) {
          const mint = pair.baseToken.address.toLowerCase();
          const arr = byMint.get(mint) ?? [];
          arr.push(pair);
          byMint.set(mint, arr);
        }

        for (const mint of chunk) {
          const mintPairs = byMint.get(mint.toLowerCase()) ?? [];
          const canonical = this.pickCanonicalPair(mintPairs, mint);
          if (canonical) coins.push(this.toCoin(canonical));
        }
      } catch (err) {
        log.warn(
          `getCoins chunk failed (${chunk.length} mints): ${(err as Error).message}`,
        );
      }
    }

    return coins;
  }

  /** Batched prices — reuses getCoins since price rides along on the same payload. */
  async getPrices(coinIds: string[]): Promise<PriceQuote[]> {
    const coins = await this.getCoins(coinIds);
    return coins.map((c) => ({
      coinId: c.id,
      price: c.price,
      change24h: c.change24h,
      updatedAt: c.updatedAt,
    }));
  }

  async getPrice(coinId: string): Promise<PriceQuote | undefined> {
    const [quote] = await this.getPrices([coinId]);
    return quote;
  }

  async getMarketData(coinId: string): Promise<MarketData | undefined> {
    const coin = await this.getCoin(coinId);
    if (!coin) return undefined;
    return {
      marketCap: coin.marketCap,
      volume24h: coin.volume24h,
      change24h: coin.change24h,
      ...(coin.fdv === undefined ? {} : { fdv: coin.fdv }),
      liquidity: coin.liquidity,
    };
  }

  async getSupply(_coinId: string): Promise<SupplyData | undefined> {
    // DexScreener doesn't expose supply data
    return undefined;
  }

  async getHistoricalPrices(
    _coinId: string,
    _range: ChartRange,
  ): Promise<CandlePoint[]> {
    // DexScreener doesn't expose historical candles via public API
    return [];
  }

  async getTrendingCoins(limit = 6): Promise<Coin[]> {
    // Use token profiles as a proxy for "trending" on Solana
    try {
      const res = await this.get<Array<{ tokenAddress: string; chainId: string }>>(
        `/token-profiles/latest/v1`,
      );
      const solanaMints = (res ?? [])
        .filter((t) => t.chainId === "solana")
        .slice(0, limit)
        .map((t) => t.tokenAddress);
      if (solanaMints.length === 0) return [];
      return this.getCoins(solanaMints.map((m) => `sol:${m}`));
    } catch (err) {
      log.warn(`getTrendingCoins failed: ${(err as Error).message}`);
      return [];
    }
  }

  async listCoins(limit = 50): Promise<Coin[]> {
    // Fallback: use trending as the default list
    return this.getTrendingCoins(limit);
  }
}