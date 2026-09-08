import type { CandlePoint, ChartRange, Coin } from "../../core/types.js";
import type {
  CoinSearchResult,
  CryptoDataProvider,
  MarketData,
  PriceQuote,
  SupplyData,
} from "./CryptoDataProvider.js";

/**
 * Composite provider that routes requests by coin ID prefix:
 * - "sol:..." → DexScreenerProvider
 * - bare slug (no colon) → CoinGeckoProvider (or whatever the primary is)
 *
 * This preserves the batching contract the price poller depends on: getCoins
 * and getPrices partition the id list, fan out to both providers in parallel,
 * and concatenate results. Unknown IDs are simply omitted (the interface
 * already allows the result array to be shorter than the input).
 */
export class CompositeCryptoProvider implements CryptoDataProvider {
  readonly name = "composite";

  constructor(
    private readonly primary: CryptoDataProvider,
    private readonly dexScreener: CryptoDataProvider,
  ) {}

  private splitIds(coinIds: string[]): { primary: string[]; dex: string[] } {
    const primary: string[] = [];
    const dex: string[] = [];
    for (const id of coinIds) {
      if (id.startsWith("sol:")) dex.push(id);
      else primary.push(id);
    }
    return { primary, dex };
  }

  async searchCoins(query: string, limit = 12): Promise<CoinSearchResult[]> {
    // Search is intentionally primary-only. The WEB3 tab will call
    // /api/dex/search directly for DexScreener results.
    return this.primary.searchCoins(query, limit);
  }

  async getCoin(coinId: string): Promise<Coin | undefined> {
    if (coinId.startsWith("sol:")) return this.dexScreener.getCoin(coinId);
    return this.primary.getCoin(coinId);
  }

  async getCoins(coinIds: string[]): Promise<Coin[]> {
    const { primary, dex } = this.splitIds(coinIds);
    const [primaryCoins, dexCoins] = await Promise.all([
      primary.length ? this.primary.getCoins(primary) : Promise.resolve([]),
      dex.length ? this.dexScreener.getCoins(dex) : Promise.resolve([]),
    ]);
    return [...primaryCoins, ...dexCoins];
  }

  async getPrices(coinIds: string[]): Promise<PriceQuote[]> {
    const { primary, dex } = this.splitIds(coinIds);
    const [primaryQuotes, dexQuotes] = await Promise.all([
      primary.length ? this.primary.getPrices(primary) : Promise.resolve([]),
      dex.length ? this.dexScreener.getPrices(dex) : Promise.resolve([]),
    ]);
    return [...primaryQuotes, ...dexQuotes];
  }

  async getPrice(coinId: string): Promise<PriceQuote | undefined> {
    if (coinId.startsWith("sol:")) return this.dexScreener.getPrice(coinId);
    return this.primary.getPrice(coinId);
  }

  async getMarketData(coinId: string): Promise<MarketData | undefined> {
    if (coinId.startsWith("sol:")) return this.dexScreener.getMarketData(coinId);
    return this.primary.getMarketData(coinId);
  }

  async getSupply(coinId: string): Promise<SupplyData | undefined> {
    if (coinId.startsWith("sol:")) return this.dexScreener.getSupply(coinId);
    return this.primary.getSupply(coinId);
  }

  async getHistoricalPrices(
    coinId: string,
    range: ChartRange,
  ): Promise<CandlePoint[]> {
    if (coinId.startsWith("sol:")) return this.dexScreener.getHistoricalPrices(coinId, range);
    return this.primary.getHistoricalPrices(coinId, range);
  }

  async getTrendingCoins(limit = 6): Promise<Coin[]> {
    // Combine trending from both sources
    const [primaryTrending, dexTrending] = await Promise.all([
      this.primary.getTrendingCoins(limit),
      this.dexScreener.getTrendingCoins(limit),
    ]);
    return [...primaryTrending, ...dexTrending].slice(0, limit);
  }

  async listCoins(limit = 50): Promise<Coin[]> {
    // Primary list + top DEX tokens
    const [primaryList, dexList] = await Promise.all([
      this.primary.listCoins(limit),
      this.dexScreener.listCoins(Math.min(10, limit)),
    ]);
    return [...primaryList, ...dexList].slice(0, limit);
  }
}