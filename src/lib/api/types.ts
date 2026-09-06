/**
 * The API's wire format, mirrored from server/src/core/types.ts.
 *
 * These are hand-kept in sync with the server rather than generated, so treat the
 * server file as the source of truth: if a field disagrees, the server wins. They
 * live here so no UI component has to know a URL or a JSON shape (spec 2), which
 * is also what lets a React Native client reuse this layer unchanged.
 */

export type ChartRange = "1H" | "24H" | "7D" | "30D" | "3M" | "1Y" | "ALL";

export const CHART_RANGES: readonly ChartRange[] = ["1H", "24H", "7D", "30D", "3M", "1Y", "ALL"];

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
   * Comes free with the market list, so a screen of trend lines costs no extra
   * requests. Downsampled and timestamp-free — a shape, not a series to measure
   * against; use the chart API for anything a user reads a number off of.
   */
  sparkline7d?: number[];
  /** True when the value came from cache after a provider failure (spec 33/35). */
  stale?: boolean;
}

/** Search returns identity only — no price. Never render it as a quote. */
export interface CoinSearchResult {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  /** The same identity colour a full `Coin` carries, so hits render alike. */
  color: string;
  rank: number;
}

export interface CandlePoint {
  t: number;
  price: number;
}

export interface PriceQuote {
  coinId: string;
  price: number;
  change24h: number;
  updatedAt: number;
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

export type AlertKind = "PRICE" | "MARKET_CAP" | "PERCENT" | "PORTFOLIO";
export type AlertCondition = "ABOVE" | "BELOW";
export type AlertStatus = "ACTIVE" | "TRIGGERED" | "DISABLED";
export type AlertRepeat = "ONCE" | "RECURRING";
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
  targetPrice?: number;
  targetMarketCap?: number;
  targetPercent?: number;
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
  /** Custom alarm sound. */
  sound?: string;
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

export interface AlertHistoryEntry {
  id: string;
  alertId: string;
  coinId?: string;
  alertName?: string;
  kind: AlertKind;
  condition: AlertCondition;
  /** The threshold that was crossed, and the value that crossed it. */
  target: number;
  actual: number;
  triggeredAt: number;
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
  bestPerformer: { coinId: string; roi: number } | null;
  worstPerformer: { coinId: string; roi: number } | null;
  hasEstimatedCostBasis: boolean;
  rows: PortfolioRow[];
}

export interface AllocationSlice {
  coinId: string;
  symbol: string;
  color: string;
  value: number;
  percent: number;
}

export type NotificationKind =
  | "PRICE_TARGET"
  | "MARKET_CAP_TARGET"
  | "PORTFOLIO_TARGET"
  | "PERCENT_MOVE"
  | "ALERT_TRIGGERED"
  | "SYSTEM";

export interface AppNotification {
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
  includeInPortfolio: boolean;
  verified: boolean;
  lastSyncedAt?: number;
  createdAt: number;
}

export interface TokenBalance {
  coinId: string | null;
  symbol: string;
  name: string;
  quantity: number;
  contract?: string;
  decimals: number;
}

export interface WalletTransaction {
  hash: string;
  timestamp: number;
  direction: "IN" | "OUT" | "UNKNOWN";
  symbol: string;
  quantity: number;
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

export interface UserSettings {
  notifications: {
    priceAlerts: boolean;
    portfolioAlerts: boolean;
    push: boolean;
    browser: boolean;
    email: boolean;
  };
  alarm: {
    sound: boolean;
    /** 0-1. */
    volume: number;
  };
  appearance: {
    theme: "dark" | "light" | "system";
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface ServerConfig {
  cryptoProvider: string;
  walletProvider: string;
  pushEnabled: boolean;
  googleAuthEnabled: boolean;
  priceIntervalMs: number;
  disclaimer: string;
}

/** The payload the alert engine hands to every delivery channel. */
export interface NotificationPayload {
  kind: NotificationKind;
  title: string;
  body: string;
  coinId?: string;
  alertId?: string;
  alarm?: boolean;
  url?: string;
}

/** Realtime frames, mirrored from server/src/services/realtime/hub.ts. */
export type ServerMessage =
  | { type: "hello"; payload: { authenticated: boolean; serverTime: number } }
  | { type: "prices"; payload: { coins: Coin[] } }
  | { type: "notification"; payload: AppNotification }
  | { type: "browser-notification"; payload: NotificationPayload }
  | { type: "alert-triggered"; payload: { alert: Alert; coin: Coin | null; alarm: boolean } }
  | { type: "portfolio"; payload: PortfolioSummary }
  | { type: "pong"; payload: { t: number } };
