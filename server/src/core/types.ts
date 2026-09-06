/**
 * Wire format shared with the frontend. These are the shapes the REST API
 * returns; Mongoose documents are mapped onto them at the route boundary so the
 * database schema can change without breaking clients.
 */

export type ChartRange = "1H" | "24H" | "7D" | "30D" | "3M" | "1Y" | "ALL";

export const CHART_RANGES: readonly ChartRange[] = [
  "1H",
  "24H",
  "7D",
  "30D",
  "3M",
  "1Y",
  "ALL",
] as const;

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  color: string;
  price: number;
  change24h: number;
  marketCap: number;
  /** Fully diluted valuation = price x (max ?? total) supply. */
  fdv?: number;
  volume24h: number;
  liquidity?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number | null;
  ath?: number;
  atl?: number;
  rank: number;
  updatedAt: number;
  /**
   * Coarse 7-day price series for inline sparklines, oldest first.
   *
   * Rides along on the markets request the poller already makes, so a screen of
   * trend lines costs no upstream calls at all — the alternative is one
   * `market_chart` fetch per row, which is what spec 31 forbids. Downsampled and
   * timestamp-free: it is a shape, not a series to measure against. Absent when
   * the provider didn't return one.
   */
  sparkline7d?: number[];
  /** True when the value came from cache after a provider failure (spec 33/35). */
  stale?: boolean;
}

export interface CandlePoint {
  t: number;
  price: number;
}

/** Price alerts fire on an absolute price; market-cap and percentage alerts are
 *  normalised to a price target by the alert engine so one evaluator covers all. */
export type AlertKind = "PRICE" | "MARKET_CAP" | "PERCENT" | "PORTFOLIO";
export type AlertCondition = "ABOVE" | "BELOW";
export type AlertStatus = "ACTIVE" | "TRIGGERED" | "DISABLED";
export type AlertRepeat = "ONCE" | "RECURRING";

/** What a PORTFOLIO alert watches. */
export type PortfolioMetric = "VALUE" | "PROFIT" | "ROI" | "DRAWDOWN";

export interface AlertNotifyChannels {
  browser: boolean;
  alarm: boolean;
  push: boolean;
  email: boolean;
}

export interface Alert {
  id: string;
  kind: AlertKind;
  /** Absent for PORTFOLIO alerts. */
  coinId?: string;
  name?: string;
  condition: AlertCondition;
  /** Resolved price target the engine compares against (PRICE/MARKET_CAP/PERCENT). */
  targetPrice?: number;
  targetMarketCap?: number;
  /** For PERCENT alerts: +10 means "up 10% from the baseline". */
  targetPercent?: number;
  /** For PORTFOLIO alerts. */
  portfolioMetric?: PortfolioMetric;
  targetValue?: number;
  repeat: AlertRepeat;
  cooldownMinutes: number;
  notify: AlertNotifyChannels;
  status: AlertStatus;
  createdAt: number;
  updatedAt: number;
  triggeredAt?: number;
  triggerCount: number;
  /** Snapshot when the alert was armed — the denominator for progress. */
  baselinePrice?: number;
  baselineValue?: number;
}

export interface AlertProgress {
  alertId: string;
  current: number;
  target: number;
  /** 0-100, clamped. */
  percent: number;
  remaining: number;
  reached: boolean;
}

export interface Holding {
  id: string;
  coinId: string;
  quantity: number;
  averageBuyPrice: number;
  /** ISO date (YYYY-MM-DD). */
  purchaseDate: string;
  exchange?: string;
  wallet?: string;
  notes?: string;
  /** WALLET holdings are derived from an on-chain balance and are not editable. */
  source: "MANUAL" | "WALLET";
  /** Spec 7: an estimated cost basis must never be presented as exact. */
  costBasisSource: "USER" | "TRANSACTIONS" | "UNAVAILABLE";
  createdAt: number;
  updatedAt: number;
}

export interface PortfolioRow {
  holding: Holding;
  coin: Coin | null;
  value: number;
  invested: number;
  profit: number;
  roi: number;
  /** Share of total portfolio value, 0-100. */
  allocation: number;
  costBasisEstimated: boolean;
  /** Plain-English label when profit can't be computed honestly (spec 7). */
  note?: string;
}

export interface PortfolioSummary {
  value: number;
  invested: number;
  profit: number;
  roi: number;
  /** Null when nothing is held. */
  bestPerformer: { coinId: string; roi: number } | null;
  worstPerformer: { coinId: string; roi: number } | null;
  /** True when at least one row has no reliable cost basis. */
  hasEstimatedCostBasis: boolean;
  rows: PortfolioRow[];
}

export type NotificationKind =
  | "PRICE_TARGET"
  | "MARKET_CAP_TARGET"
  | "PORTFOLIO_TARGET"
  | "PERCENT_MOVE"
  | "ALERT_TRIGGERED"
  | "SYSTEM";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  coinId?: string;
  alertId?: string;
  read: boolean;
  createdAt: number;
}

export interface Goal {
  id: string;
  coinId: string;
  /** "I want my holdings to be worth..." */
  targetValue: number;
  label?: string;
  requiredPrice: number;
  requiredMarketCap: number | null;
  requiredMultiple: number;
  createdAt: number;
  alertId?: string;
}

export type WalletChain = "solana" | "ethereum";

export interface WalletAccount {
  id: string;
  chain: WalletChain;
  address: string;
  label?: string;
  /** Whether this wallet's balances roll into the combined portfolio. */
  includeInPortfolio: boolean;
  verified: boolean;
  lastSyncedAt?: number;
  createdAt: number;
}

export interface TokenBalance {
  /** Our coin id when we can resolve it, otherwise null. */
  coinId: string | null;
  symbol: string;
  name: string;
  quantity: number;
  /** Contract/mint address, absent for the chain's native asset. */
  contract?: string;
  decimals: number;
}

export interface WalletTransaction {
  hash: string;
  timestamp: number;
  direction: "IN" | "OUT" | "UNKNOWN";
  symbol: string;
  quantity: number;
  /** USD price at the time of the transfer, when the provider can supply it. */
  priceUsd?: number;
}

export interface PublicUser {
  id: string;
  email: string | null;
  name: string;
  createdAt: number;
  hasPassword: boolean;
  authProviders: Array<"password" | "google" | "wallet">;
}
