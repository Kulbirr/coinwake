import type { CandlePoint, ChartRange, Coin } from "../../core/types.js";

export interface CoinSearchResult {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  /** Same identity colour a full `Coin` carries, so a search hit renders alike. */
  color: string;
  rank: number;
}

export interface MarketData {
  marketCap: number;
  fdv?: number;
  volume24h: number;
  change24h: number;
  ath?: number;
  atl?: number;
  liquidity?: number;
}

export interface SupplyData {
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number | null;
}

export interface PriceQuote {
  coinId: string;
  price: number;
  change24h: number;
  updatedAt: number;
}

/**
 * Every third-party market-data vendor sits behind this interface (spec 2/3), so
 * swapping CoinGecko for CoinMarketCap or an internal feed touches one file and
 * no route, service, or client. Implementations must never leak vendor-shaped
 * payloads or vendor errors upward — normalise to these types or throw an
 * ApiError-compatible failure.
 */
export interface CryptoDataProvider {
  /** Stable id for logs and cache keys. */
  readonly name: string;

  searchCoins(query: string, limit?: number): Promise<CoinSearchResult[]>;
  getCoin(coinId: string): Promise<Coin | undefined>;
  /**
   * Batched on purpose, and the most important method here: the price poller
   * refreshes every tracked coin on each tick, so this has to be one upstream
   * request rather than one per coin (spec 31/33). Unknown ids are omitted from
   * the result rather than returned as holes, so the array may be shorter than
   * the input and is not positionally aligned with it.
   */
  getCoins(coinIds: string[]): Promise<Coin[]>;
  /** Batched on purpose: the price poller asks for every watched coin at once. */
  getPrices(coinIds: string[]): Promise<PriceQuote[]>;
  getPrice(coinId: string): Promise<PriceQuote | undefined>;
  getMarketData(coinId: string): Promise<MarketData | undefined>;
  getHistoricalPrices(coinId: string, range: ChartRange): Promise<CandlePoint[]>;
  getSupply(coinId: string): Promise<SupplyData | undefined>;
  getTrendingCoins(limit?: number): Promise<Coin[]>;
  /** Top coins by market cap — the dashboard's default list. */
  listCoins(limit?: number): Promise<Coin[]>;
}

/** Number of points to render for each range, and the window they span. */
export const RANGE_SPEC: Record<ChartRange, { ms: number; points: number; days: string }> = {
  "1H": { ms: 60 * 60 * 1000, points: 60, days: "1" },
  "24H": { ms: 24 * 60 * 60 * 1000, points: 96, days: "1" },
  "7D": { ms: 7 * 24 * 60 * 60 * 1000, points: 84, days: "7" },
  "30D": { ms: 30 * 24 * 60 * 60 * 1000, points: 90, days: "30" },
  "3M": { ms: 90 * 24 * 60 * 60 * 1000, points: 90, days: "90" },
  "1Y": { ms: 365 * 24 * 60 * 60 * 1000, points: 120, days: "365" },
  ALL: { ms: 5 * 365 * 24 * 60 * 60 * 1000, points: 150, days: "max" },
};
