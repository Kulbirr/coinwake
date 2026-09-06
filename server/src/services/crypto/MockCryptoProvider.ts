import type { CandlePoint, ChartRange, Coin } from "../../core/types.js";
import {
  RANGE_SPEC,
  type CoinSearchResult,
  type CryptoDataProvider,
  type MarketData,
  type PriceQuote,
  type SupplyData,
} from "./CryptoDataProvider.js";
import { SEED_COINS, type SeedCoin } from "./seedCoins.js";

/** Deterministic hash so a coin's chart looks the same on every request. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 — small, seedable, good enough for fake market noise. */
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface LiveCoin extends SeedCoin {
  updatedAt: number;
  /** Price at process start, so change24h can drift with the walk. */
  openPrice: number;
}

/**
 * In-memory market simulator (spec 42). It is a real CryptoDataProvider, so
 * every route, the price poller, the alert engine and the WebSocket fan-out run
 * against the same code paths they will use with a live vendor. Prices move on
 * each poll tick, which is what makes alerts actually fire in development.
 */
export class MockCryptoProvider implements CryptoDataProvider {
  readonly name = "mock";

  private readonly coins = new Map<string, LiveCoin>();

  constructor(seeds: SeedCoin[] = SEED_COINS) {
    for (const seed of seeds) {
      this.coins.set(seed.id, { ...seed, updatedAt: Date.now(), openPrice: seed.price });
    }
  }

  /** Advances every price one step. Called by the price service on each tick. */
  tick(): void {
    const now = Date.now();
    for (const coin of this.coins.values()) {
      // Per-tick move is a fraction of daily volatility, with a slight mean
      // reversion toward the seeded price so nothing drifts to zero overnight.
      const drift = (coin.openPrice - coin.price) / coin.openPrice / 40;
      const shock = (Math.random() - 0.5) * coin.volatility * 0.35;
      const next = coin.price * (1 + drift + shock);

      coin.price = Math.max(next, coin.openPrice * 0.05);
      coin.change24h = ((coin.price - coin.openPrice) / coin.openPrice) * 100 + coin.change24h * 0.9;
      if (coin.circulatingSupply) coin.marketCap = coin.price * coin.circulatingSupply;
      if (coin.price > (coin.ath ?? 0)) coin.ath = coin.price;
      if (coin.atl !== undefined && coin.price < coin.atl) coin.atl = coin.price;
      coin.updatedAt = now;
    }
  }

  private toCoin(live: LiveCoin): Coin {
    const { volatility: _volatility, openPrice: _openPrice, ...rest } = live;
    return { ...rest, price: round(live.price), change24h: round(live.change24h, 2) };
  }

  private require(coinId: string): LiveCoin | undefined {
    return this.coins.get(coinId.toLowerCase());
  }

  async searchCoins(query: string, limit = 12): Promise<CoinSearchResult[]> {
    const q = query.trim().toLowerCase();
    const all = [...this.coins.values()];
    const matches = q
      ? all.filter(
          (c) =>
            c.id.includes(q) || c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
        )
      : all;

    return matches
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        logo: c.logo,
        color: c.color,
        rank: c.rank,
      }));
  }

  async getCoin(coinId: string): Promise<Coin | undefined> {
    const [coin] = await this.getCoins([coinId]);
    return coin;
  }

  async getCoins(coinIds: string[]): Promise<Coin[]> {
    const coins: Coin[] = [];
    for (const id of coinIds) {
      const live = this.require(id);
      // Unknown ids are skipped, matching the live provider — the caller can't
      // assume the result lines up with what it asked for.
      if (live) coins.push(this.toCoin(live));
    }
    return coins;
  }

  async getPrices(coinIds: string[]): Promise<PriceQuote[]> {
    const quotes: PriceQuote[] = [];
    for (const id of coinIds) {
      const live = this.require(id);
      if (!live) continue;
      quotes.push({
        coinId: live.id,
        price: round(live.price),
        change24h: round(live.change24h, 2),
        updatedAt: live.updatedAt,
      });
    }
    return quotes;
  }

  async getPrice(coinId: string): Promise<PriceQuote | undefined> {
    const [quote] = await this.getPrices([coinId]);
    return quote;
  }

  async getMarketData(coinId: string): Promise<MarketData | undefined> {
    const live = this.require(coinId);
    if (!live) return undefined;
    return {
      marketCap: round(live.marketCap),
      volume24h: live.volume24h,
      change24h: round(live.change24h, 2),
      ...(live.fdv === undefined ? {} : { fdv: live.fdv }),
      ...(live.ath === undefined ? {} : { ath: live.ath }),
      ...(live.atl === undefined ? {} : { atl: live.atl }),
      ...(live.liquidity === undefined ? {} : { liquidity: live.liquidity }),
    };
  }

  async getSupply(coinId: string): Promise<SupplyData | undefined> {
    const live = this.require(coinId);
    if (!live) return undefined;
    return {
      ...(live.circulatingSupply === undefined ? {} : { circulatingSupply: live.circulatingSupply }),
      ...(live.totalSupply === undefined ? {} : { totalSupply: live.totalSupply }),
      ...(live.maxSupply === undefined ? {} : { maxSupply: live.maxSupply }),
    };
  }

  async getHistoricalPrices(coinId: string, range: ChartRange): Promise<CandlePoint[]> {
    const live = this.require(coinId);
    if (!live) return [];

    const { ms, points } = RANGE_SPEC[range];
    const rand = seededRandom(hash(`${live.id}:${range}`));
    const step = ms / (points - 1);
    const now = Date.now();

    // Walk backwards from the current price so the chart always ends at "now",
    // then reverse — otherwise the last candle disagrees with the ticker.
    const series: CandlePoint[] = [];
    let price = live.price;
    const stepVol = live.volatility * Math.sqrt(step / (24 * 60 * 60 * 1000));

    for (let i = 0; i < points; i++) {
      series.push({ t: Math.round(now - i * step), price: round(price) });
      price = Math.max(price * (1 + (rand() - 0.5) * stepVol * 2), live.openPrice * 0.02);
    }

    return series.reverse();
  }

  async getTrendingCoins(limit = 6): Promise<Coin[]> {
    return [...this.coins.values()]
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, limit)
      .map((c) => this.toCoin(c));
  }

  async listCoins(limit = 50): Promise<Coin[]> {
    return [...this.coins.values()]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit)
      .map((c) => this.toCoin(c));
  }
}

/** Keeps sub-cent prices meaningful — BONK needs more decimals than BTC. */
function round(value: number, decimals?: number): number {
  if (decimals !== undefined) return Number(value.toFixed(decimals));
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const places = Math.min(12, Math.max(2, 6 - magnitude));
  return Number(value.toFixed(places));
}
