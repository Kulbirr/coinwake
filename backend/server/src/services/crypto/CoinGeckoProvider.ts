import { env } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { fetchJson } from "../../core/http.js";
import type { CandlePoint, ChartRange, Coin } from "../../core/types.js";
import {
  RANGE_SPEC,
  type CoinSearchResult,
  type CryptoDataProvider,
  type MarketData,
  type PriceQuote,
  type SupplyData,
} from "./CryptoDataProvider.js";

const log = createLogger("coingecko");

/** Brand colours for the coins we seed; anything else gets a derived hue. */
const BRAND_COLORS: Record<string, string> = {
  bitcoin: "#f7931a",
  ethereum: "#627eea",
  solana: "#14f195",
  binancecoin: "#f3ba2f",
  ripple: "#23292f",
  dogecoin: "#c2a633",
  pepe: "#3d8130",
  bonk: "#f5a524",
};

function colorFor(coinId: string): string {
  const known = BRAND_COLORS[coinId];
  if (known) return known;
  let h = 0;
  for (let i = 0; i < coinId.length; i++) h = (h * 31 + coinId.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 55%)`;
}

interface CgMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  atl: number | null;
  last_updated: string | null;
  /** Only present when the request asked for `sparkline=true`. */
  sparkline_in_7d?: { price?: Array<number | null> | null } | null;
}

/**
 * How many points an inline sparkline keeps.
 *
 * CoinGecko ships 168 hourly prices per coin; at 50 coins that is 8,400 floats
 * on every market payload for a 90px-wide trend line. Roughly six-hourly is all
 * the shape a sparkline can render.
 */
const SPARKLINE_POINTS = 28;

/**
 * Downsample the vendor's 7-day series, keeping the newest point.
 *
 * Returns undefined rather than a short array when there is nothing to draw —
 * `Sparkline` renders a flat rule for that, instead of inventing a trend.
 */
function toSparkline(raw: Array<number | null> | null | undefined): number[] | undefined {
  const prices = (raw ?? []).filter((p): p is number => typeof p === "number" && isFinite(p));
  if (prices.length < 2) return undefined;

  const stride = Math.max(1, Math.ceil(prices.length / SPARKLINE_POINTS));
  const out: number[] = [];
  for (let i = 0; i < prices.length; i += stride) out.push(prices[i] as number);

  const last = prices[prices.length - 1] as number;
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

interface CgSearchResponse {
  coins?: Array<{
    id: string;
    symbol: string;
    name: string;
    large?: string;
    thumb?: string;
    market_cap_rank: number | null;
  }>;
}

interface CgTrendingResponse {
  coins?: Array<{ item: { id: string } }>;
}

type CgSimplePrice = Record<string, { usd?: number; usd_24h_change?: number; last_updated_at?: number }>;

interface CgMarketChart {
  prices?: Array<[number, number]>;
}

/**
 * Live market data from CoinGecko. All vendor field names, URL shapes and quirks
 * stop here — callers only ever see our own types (spec 2/3). The API key comes
 * from the environment and never leaves the server (spec 3).
 */
export class CoinGeckoProvider implements CryptoDataProvider {
  readonly name = "coingecko";

  /** `/coins/markets` serves at most 250 rows per page. */
  private static readonly MAX_IDS_PER_CALL = 250;

  private readonly base: string;

  constructor() {
    this.base = env.COINGECKO_BASE_URL.replace(/\/$/, "");
    if (!env.COINGECKO_API_KEY) {
      log.warn("No COINGECKO_API_KEY set — using the public tier, which rate limits aggressively.");
    }
  }

  private headers(): Record<string, string> {
    if (!env.COINGECKO_API_KEY) return {};
    // Demo and Pro keys use different header names; the host tells us which.
    const header = this.base.includes("pro-api") ? "x-cg-pro-api-key" : "x-cg-demo-api-key";
    return { [header]: env.COINGECKO_API_KEY };
  }

  private get<T>(path: string): Promise<T> {
    return fetchJson<T>(`${this.base}${path}`, { headers: this.headers() });
  }

  private toCoin(m: CgMarket): Coin {
    const price = m.current_price ?? 0;
    return {
      id: m.id,
            symbol: m.symbol.toUpperCase(),
            name: m.name,
            logo: m.image,
            color: colorFor(m.id),
            price,
            change24h: m.price_change_percentage_24h ?? 0,
            marketCap: m.market_cap ?? 0,
            volume24h: m.total_volume ?? 0,
            rank: m.market_cap_rank ?? 0,
            updatedAt: m.last_updated ? Date.parse(m.last_updated) : Date.now(),
      ...(m.fully_diluted_valuation === null ? {} : { fdv: m.fully_diluted_valuation }),
      ...(m.circulating_supply === null ? {} : { circulatingSupply: m.circulating_supply }),
      ...(m.total_supply === null ? {} : { totalSupply: m.total_supply }),
      // maxSupply is meaningfully nullable: null means "uncapped", not "unknown".
      maxSupply: m.max_supply,
      ...(m.ath === null ? {} : { ath: m.ath }),
      ...(m.atl === null ? {} : { atl: m.atl }),
      ...(() => {
        const spark = toSparkline(m.sparkline_in_7d?.price);
        return spark === undefined ? {} : { sparkline7d: spark };
      })(),
    };
  }

  private async markets(params: string): Promise<CgMarket[]> {
    const rows = await this.get<CgMarket[]>(`/coins/markets?vs_currency=usd&${params}`);
    return Array.isArray(rows) ? rows : [];
  }

  async searchCoins(query: string, limit = 12): Promise<CoinSearchResult[]> {
    const q = query.trim();
    if (!q) return (await this.listCoins(limit)).map((c) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      logo: c.logo,
      color: c.color,
      rank: c.rank,
    }));

    const res = await this.get<CgSearchResponse>(`/search?query=${encodeURIComponent(q)}`);
    return (res.coins ?? []).slice(0, limit).map((c) => ({
          id: c.id,
          symbol: c.symbol.toUpperCase(),
          name: c.name,
          logo: c.large ?? c.thumb ?? "",
          color: colorFor(c.id),
          rank: c.market_cap_rank ?? 0,
        }));
  }

  async getCoin(coinId: string): Promise<Coin | undefined> {
    const [coin] = await this.getCoins([coinId]);
    return coin;
  }

  /**
   * Every tracked coin in one request. `/coins/markets` already returns the price
   * alongside the market cap, FDV, supply, ATH/ATL and the 7-day sparkline, so the
   * poller needs no second call per coin — which is the difference between 3
   * requests a minute and 180 (spec 33).
   *
   * `sparkline=true` on every markets call, not just the ones a trend line is
   * drawn from: these records land in the shared coin cache, so a path that left
   * the field out would blank the sparklines an earlier path had filled.
   *
   * `per_page` has to be set explicitly: it defaults to 100, so a longer id list
   * would silently come back truncated.
   */
  async getCoins(coinIds: string[]): Promise<Coin[]> {
    if (coinIds.length === 0) return [];

    const coins: Coin[] = [];
    for (let i = 0; i < coinIds.length; i += CoinGeckoProvider.MAX_IDS_PER_CALL) {
      const chunk = coinIds.slice(i, i + CoinGeckoProvider.MAX_IDS_PER_CALL);
      const ids = chunk.map((id) => encodeURIComponent(id)).join(",");
      const rows = await this.markets(`ids=${ids}&per_page=${chunk.length}&page=1&sparkline=true`);
      for (const row of rows) coins.push(this.toCoin(row));
    }
    return coins;
  }

  async getPrices(coinIds: string[]): Promise<PriceQuote[]> {
    if (coinIds.length === 0) return [];
    const ids = coinIds.map((id) => encodeURIComponent(id)).join(",");
    const res = await this.get<CgSimplePrice>(
      `/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
    );

    const quotes: PriceQuote[] = [];
    for (const [coinId, value] of Object.entries(res)) {
      if (value?.usd === undefined) continue;
      quotes.push({
        coinId,
        price: value.usd,
        change24h: value.usd_24h_change ?? 0,
        updatedAt: value.last_updated_at ? value.last_updated_at * 1000 : Date.now(),
      });
    }
    return quotes;
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
      ...(coin.ath === undefined ? {} : { ath: coin.ath }),
      ...(coin.atl === undefined ? {} : { atl: coin.atl }),
    };
  }

  async getSupply(coinId: string): Promise<SupplyData | undefined> {
    const coin = await this.getCoin(coinId);
    if (!coin) return undefined;
    return {
      ...(coin.circulatingSupply === undefined ? {} : { circulatingSupply: coin.circulatingSupply }),
      ...(coin.totalSupply === undefined ? {} : { totalSupply: coin.totalSupply }),
      ...(coin.maxSupply === undefined ? {} : { maxSupply: coin.maxSupply }),
    };
  }

  async getHistoricalPrices(coinId: string, range: ChartRange): Promise<CandlePoint[]> {
    const { days, points, ms } = RANGE_SPEC[range];
    const res = await this.get<CgMarketChart>(
      `/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`,
    );

    let raw = res.prices ?? [];
    // The free tier ignores narrow windows and always returns a full day, so trim
    // client-side for 1H rather than shipping 24 hours labelled as one.
    if (range === "1H") {
      const cutoff = Date.now() - ms;
      const trimmed = raw.filter(([t]) => t >= cutoff);
      if (trimmed.length >= 2) raw = trimmed;
    }

    // Downsample evenly so a 365-day response doesn't ship 8,760 points.
    const stride = Math.max(1, Math.floor(raw.length / points));
    const series: CandlePoint[] = [];
    for (let i = 0; i < raw.length; i += stride) {
      const point = raw[i];
      if (point) series.push({ t: point[0], price: point[1] });
    }

    const last = raw[raw.length - 1];
    const tail = series[series.length - 1];
    if (last && tail && tail.t !== last[0]) series.push({ t: last[0], price: last[1] });

    return series;
  }

  async getTrendingCoins(limit = 6): Promise<Coin[]> {
    const res = await this.get<CgTrendingResponse>("/search/trending");
    const ids = (res.coins ?? []).slice(0, limit).map((c) => c.item.id);
    if (ids.length === 0) return [];
    const rows = await this.markets(
      `ids=${ids.map((id) => encodeURIComponent(id)).join(",")}&sparkline=true`,
    );
    return rows.map((r) => this.toCoin(r));
  }

  async listCoins(limit = 50): Promise<Coin[]> {
    const rows = await this.markets(
      `order=market_cap_desc&per_page=${Math.min(250, limit)}&page=1&sparkline=true`,
    );
    return rows.map((r) => this.toCoin(r));
  }
}
