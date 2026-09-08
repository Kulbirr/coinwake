import { apiFetch } from "./client";
import { clearSession, setSession } from "./session";
import type {
  Alert,
  AlertCondition,
  AlertHistoryEntry,
  AlertKind,
  AlertNotifyChannels,
  AlertProgress,
  AlertRepeat,
  AllocationSlice,
  AppNotification,
  CandlePoint,
  ChartRange,
  Coin,
  CoinSearchResult,
  Goal,
  Holding,
  MarketData,
  PortfolioMetric,
  PortfolioSummary,
  PriceQuote,
  PublicUser,
  ServerConfig,
  SupplyData,
  TokenBalance,
  TokenPair,
  UserSettings,
  WalletAccount,
  WalletChain,
  WalletTransaction,
} from "./types";

/**
 * Every endpoint the API exposes, one function each.
 *
 * Nothing above this file constructs a URL or reads a raw response, so the REST
 * surface can move without touching a screen (spec 2). Functions that write a
 * session do it here rather than leaving it to the caller, so there's no way to
 * sign in and forget to store the tokens.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

interface AuthResponse {
  user: PublicUser;
  tokens: TokenPair;
}

export const auth = {
  async register(input: { email: string; password: string; name?: string }): Promise<PublicUser> {
    const data = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: input,
      auth: false,
    });
    setSession(data.tokens);
    return data.user;
  },

  async login(input: { email: string; password: string }): Promise<PublicUser> {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
    setSession(data.tokens);
    return data.user;
  },

  /** Requires GOOGLE_CLIENT_ID on the server; check config().googleAuthEnabled. */
  async google(idToken: string): Promise<PublicUser> {
    const data = await apiFetch<AuthResponse>("/auth/google", {
      method: "POST",
      body: { idToken },
      auth: false,
    });
    setSession(data.tokens);
    return data.user;
  },

  /**
   * Step 1 of wallet sign-in. Spec 27: this proves ownership of an address and
   * nothing more — no seed phrase, no private key, no spending permission.
   */
  walletNonce(input: { chain: WalletChain; address: string }): Promise<{
    challenge: { nonce: string; message: string; expiresAt: number };
  }> {
    return apiFetch("/auth/wallet/nonce", { method: "POST", body: input, auth: false });
  },

  async walletVerify(input: {
    chain: WalletChain;
    address: string;
    nonce: string;
    signature: string;
    label?: string;
  }): Promise<{ user: PublicUser; wallet: WalletAccount }> {
    const data = await apiFetch<AuthResponse & { wallet: WalletAccount }>("/auth/wallet/verify", {
      method: "POST",
      body: input,
      auth: false,
    });
    setSession(data.tokens);
    return { user: data.user, wallet: data.wallet };
  },

  me(): Promise<{ user: PublicUser; settings: UserSettings }> {
    return apiFetch("/auth/me");
  },

  /** Ends every session for this user, then forgets the local one either way. */
  async logout(): Promise<void> {
    try {
      await apiFetch<void>("/auth/logout", { method: "POST" });
    } finally {
      clearSession();
    }
  },
};

// ─── Coins (public) ───────────────────────────────────────────────────────────

export const coins = {
  list(limit = 50): Promise<{ coins: Coin[] }> {
    return apiFetch("/coins", { query: { limit }, auth: false });
  },

  /** Identity only — results carry no price (spec: never imply a stale quote). */
  search(q: string, limit = 12): Promise<{ results: CoinSearchResult[] }> {
    return apiFetch("/coins/search", { query: { q, limit }, auth: false });
  },

  /** DexScreener Solana DEX tokens — separate from main search by design. */
  dexSearch(q: string, limit = 12): Promise<{ results: CoinSearchResult[] }> {
    return apiFetch("/dex/search", { query: { q, limit }, auth: false });
  },

  trending(limit = 6): Promise<{ coins: Coin[] }> {
    return apiFetch("/coins/trending", { query: { limit }, auth: false });
  },

  get(coinId: string): Promise<{ coin: Coin }> {
    return apiFetch(`/coins/${encodeURIComponent(coinId)}`, { auth: false });
  },

  price(coinId: string): Promise<{ price: PriceQuote }> {
    return apiFetch(`/coins/${encodeURIComponent(coinId)}/price`, { auth: false });
  },

  market(coinId: string): Promise<{ market: MarketData }> {
    return apiFetch(`/coins/${encodeURIComponent(coinId)}/market`, { auth: false });
  },

  supply(coinId: string): Promise<{ supply: SupplyData; circulatingSupplyAvailable: boolean }> {
    return apiFetch(`/coins/${encodeURIComponent(coinId)}/supply`, { auth: false });
  },

  chart(coinId: string, range: ChartRange): Promise<{ range: ChartRange; points: CandlePoint[] }> {
    return apiFetch(`/coins/${encodeURIComponent(coinId)}/chart`, {
      query: { range },
      auth: false,
    });
  },
};

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface HoldingInput {
  coinId: string;
  quantity: number;
  /** Either this or totalInvested; the server derives the other. */
  averageBuyPrice?: number;
  totalInvested?: number;
  purchaseDate?: string;
  exchange?: string;
  wallet?: string;
  notes?: string;
}

export const portfolio = {
  summary(): Promise<{ portfolio: PortfolioSummary; peakValue: number; disclaimer: string }> {
    return apiFetch("/portfolio");
  },

  holdings(): Promise<{ holdings: Holding[] }> {
    return apiFetch("/portfolio/holdings");
  },

  addHolding(input: HoldingInput): Promise<{ holding: Holding }> {
    return apiFetch("/portfolio/holdings", { method: "POST", body: input });
  },

  updateHolding(
    id: string,
    patch: Partial<Omit<HoldingInput, "coinId">>,
  ): Promise<{ holding: Holding }> {
    return apiFetch(`/portfolio/holdings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: patch,
    });
  },

  removeHolding(id: string): Promise<void> {
    return apiFetch(`/portfolio/holdings/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  allocation(): Promise<{
    allocation: AllocationSlice[];
    total: number;
    bestPerformer: { coinId: string; roi: number } | null;
    worstPerformer: { coinId: string; roi: number } | null;
  }> {
    return apiFetch("/portfolio/allocation");
  },
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

interface AlertBase {
  name?: string;
  condition: AlertCondition;
  repeat?: AlertRepeat;
  cooldownMinutes?: number;
  notify?: Partial<AlertNotifyChannels>;
  sound?: "default" | "gentle" | "urgent" | "retro" | "chill" | "loud";
}

export type AlertInput =
  | (AlertBase & { kind: "PRICE"; coinId: string; targetPrice: number })
  | (AlertBase & { kind: "MARKET_CAP"; coinId: string; targetMarketCap: number })
  | (AlertBase & { kind: "PERCENT"; coinId: string; targetPercent: number })
  | (AlertBase & { kind: "PORTFOLIO"; portfolioMetric: PortfolioMetric; targetValue: number });

export interface AlertPatch {
  name?: string;
  status?: "ACTIVE" | "DISABLED";
  targetPrice?: number;
  targetMarketCap?: number;
  targetPercent?: number;
  targetValue?: number;
  repeat?: AlertRepeat;
  cooldownMinutes?: number;
  notify?: Partial<AlertNotifyChannels>;
  sound?: "default" | "gentle" | "urgent" | "retro" | "chill" | "loud";
}

export type HistoryWindow = "today" | "7d" | "30d" | "all";

export const alerts = {
  list(): Promise<{ alerts: Alert[] }> {
    return apiFetch("/alerts");
  },

  /**
   * The server rejects a target that would fire immediately (INVALID_TARGET), so
   * callers should show the returned message rather than pre-guessing the rule.
   */
  create(input: AlertInput): Promise<{ alert: Alert }> {
    return apiFetch("/alerts", { method: "POST", body: input });
  },

  progress(): Promise<{ progress: AlertProgress[] }> {
    return apiFetch("/alerts/progress");
  },

  history(
    window: HistoryWindow = "all",
    limit = 100,
  ): Promise<{ window: HistoryWindow; history: AlertHistoryEntry[] }> {
    return apiFetch("/alerts/history", { query: { window, limit } });
  },

  update(id: string, patch: AlertPatch): Promise<{ alert: Alert }> {
    return apiFetch(`/alerts/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
  },

  remove(id: string): Promise<void> {
    return apiFetch(`/alerts/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

// ─── Watchlist ────────────────────────────────────────────────────────────────

/**
 * One saved watchlist row as the server returns it: the id the user starred, the
 * resolved coin (null when the provider can't price it right now — the row stays
 * on the list either way), and when it was added, for stable ordering.
 */
export interface WatchlistEntry {
  coinId: string;
  coin: Coin | null;
  addedAt: number;
}

export const watchlist = {
  /** Returns resolved coins alongside their ids, so a list renders in one request. */
  list(): Promise<{ watchlist: WatchlistEntry[] }> {
    return apiFetch("/watchlist");
  },

  /** Returns the resolved coin, so the caller can render it without a refetch. */
  add(coinId: string): Promise<{ coinId: string; coin: Coin | null }> {
    return apiFetch("/watchlist", { method: "POST", body: { coinId } });
  },

  remove(coinId: string): Promise<void> {
    return apiFetch(`/watchlist/${encodeURIComponent(coinId)}`, { method: "DELETE" });
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = {
  list(
    options: { unreadOnly?: boolean; limit?: number } = {},
  ): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    return apiFetch("/notifications", {
      query: {
        unreadOnly: options.unreadOnly ? "true" : "false",
        ...(options.limit === undefined ? {} : { limit: options.limit }),
      },
    });
  },

  markAllRead(): Promise<{ updated: number }> {
    return apiFetch("/notifications/read-all", { method: "POST" });
  },

  markRead(id: string): Promise<{ notification: AppNotification }> {
    return apiFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
  },

  remove(id: string): Promise<void> {
    return apiFetch(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

// ─── Goals ────────────────────────────────────────────────────────────────────

export const goals = {
  list(): Promise<{ goals: Goal[] }> {
    return apiFetch("/goals");
  },

  create(input: {
    coinId: string;
    targetValue: number;
    label?: string;
    quantity?: number;
    createAlert?: boolean;
  }): Promise<
    CalculatorMeta & {
      goal: Goal;
      plan: GoalPlan & { symbol: string; quantity: number; currentPrice: number };
    }
  > {
    return apiFetch("/goals", { method: "POST", body: input });
  },

  /** Idempotent: returns the existing alert with created:false if there is one. */
  attachAlert(id: string): Promise<{ alert: Alert; created: boolean }> {
    return apiFetch(`/goals/${encodeURIComponent(id)}/alert`, { method: "POST" });
  },

  remove(id: string): Promise<void> {
    return apiFetch(`/goals/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

// ─── Wallets (read-only) ──────────────────────────────────────────────────────

export const wallets = {
  list(): Promise<{ wallets: WalletAccount[] }> {
    return apiFetch("/wallets");
  },

  nonce(input: { chain: WalletChain; address: string }): Promise<{
    challenge: { nonce: string; message: string; expiresAt: number };
  }> {
    return apiFetch("/wallets/nonce", { method: "POST", body: input });
  },

  connect(input: {
    chain: WalletChain;
    address: string;
    nonce: string;
    signature: string;
    label?: string;
  }): Promise<{ wallet: WalletAccount }> {
    return apiFetch("/wallets", { method: "POST", body: input });
  },

  update(
    id: string,
    patch: { label?: string; includeInPortfolio?: boolean },
  ): Promise<{ wallet: WalletAccount }> {
    return apiFetch(`/wallets/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
  },

  remove(id: string): Promise<void> {
    return apiFetch(`/wallets/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  balances(id: string): Promise<{ walletId: string; balances: TokenBalance[] }> {
    return apiFetch(`/wallets/${encodeURIComponent(id)}/balances`);
  },

  transactions(id: string): Promise<{
    walletId: string;
    transactions: WalletTransaction[];
    /** Spec 7: false means we cannot derive a cost basis from this chain. */
    costBasisAvailable: boolean;
    note?: string;
  }> {
    return apiFetch(`/wallets/${encodeURIComponent(id)}/transactions`);
  },

  /** Pulls balances into the portfolio as WALLET-sourced holdings. */
  sync(id: string): Promise<{
    wallet: WalletAccount;
    holdings: Holding[];
    skipped?: number;
    skippedNote?: string;
    costBasisAvailable: boolean;
    costBasisNote?: string;
  }> {
    return apiFetch(`/wallets/${encodeURIComponent(id)}/sync`, { method: "POST" });
  },
};

// ─── Calculator ───────────────────────────────────────────────────────────────

/**
 * Spec 7/43: every calculator response carries a disclaimer, and anything the
 * server had to assume is labelled rather than presented as fact. Render these
 * notes verbatim — they are already written for users.
 */
export interface CalculatorMeta {
  disclaimer: string;
  /** True when circulating supply came from the caller, not the provider. */
  supplyEstimated?: boolean;
  supplyNote?: string;
  /** Present when there is no purchase price, so ROI and multiple are null. */
  costBasisNote?: string;
}

/** Mirrors ProfitResult in server/src/core/calc.ts. */
export interface ProfitResult {
  investment: number;
  currentValue: number;
  targetValue: number;
  profit: number;
  /** Null when nothing was invested — a return on zero is undefined, not 0. */
  roi: number | null;
  multiple: number | null;
  unrealizedProfit: number;
  unrealizedRoi: number | null;
}

/** Mirrors ScenarioResult in server/src/core/calc.ts. */
export interface ScenarioResult {
  id: string;
  marketCap: number;
  targetPrice: number;
  value: number;
  profit: number;
  roi: number | null;
  multiple: number | null;
}

/** Mirrors GoalPlan in server/src/core/calc.ts. */
export interface GoalPlan {
  targetValue: number;
  requiredPrice: number;
  /** Null when circulating supply is unknown — the server won't invent one. */
  requiredMarketCap: number | null;
  requiredMultiple: number;
  priceDistancePercent: number;
  marketCapDistancePercent: number | null;
  currentValue: number;
}

/**
 * Calculator request bodies.
 *
 * Named rather than inline because the hooks in queries.ts key their cache on the
 * body, so the input type is part of that layer's signature too.
 */
export interface ProfitCalcInput {
  coinId?: string;
  quantity: number;
  purchasePrice: number;
  /** Overrides the live quote. Required if no `coinId` is given. */
  currentPrice?: number;
  targetPrice: number;
}

export interface MarketCapCalcInput {
  coinId: string;
  targetMarketCap: number;
  quantity?: number;
  purchasePrice?: number;
  /** Overrides the live quote, repricing "now" as well as the target. */
  currentPrice?: number;
  /** Wins over the provider's figure, and marks the answer estimated. */
  circulatingSupply?: number;
}

export interface WhatIfCalcInput {
  coinId: string;
  quantity: number;
  purchasePrice?: number;
  from?: number;
  to?: number;
  steps?: number;
  circulatingSupply?: number;
}

export interface ScenarioCalcInput {
  coinId: string;
  quantity: number;
  purchasePrice?: number;
  marketCaps: number[];
  circulatingSupply?: number;
}

export interface GoalPlanInput {
  coinId: string;
  targetValue: number;
  quantity: number;
  circulatingSupply?: number;
}

export const calculator = {
  /** Spec 14. Pass currentPrice to skip the lookup, or coinId to have one fetched. */
  profit(input: ProfitCalcInput): Promise<
    CalculatorMeta & {
      result: ProfitResult & {
        currentPrice: number;
        distanceToTargetPercent: number;
        symbol?: string;
      };
    }
  > {
    return apiFetch("/calculator/profit", { method: "POST", body: input });
  },

  /** Spec 15 — Price = Market Cap / Circulating Supply. */
  marketCap(input: MarketCapCalcInput): Promise<
    CalculatorMeta & {
      supplyEstimated: boolean;
      result: {
        symbol: string;
        currentPrice: number;
        currentMarketCap: number;
        targetMarketCap: number;
        targetPrice: number;
        circulatingSupply: number;
        multiple: number;
        distanceToTargetPercent: number;
        /** Absent when quantity is 0 — there is no position to value. */
        profit?: ProfitResult;
      };
    }
  > {
    return apiFetch("/calculator/market-cap", { method: "POST", body: input });
  },

  /** A generated market-cap ladder; from/to/steps default to 1M → 1B in 8 steps. */
  whatIf(input: WhatIfCalcInput): Promise<
    CalculatorMeta & {
      symbol: string;
      currentPrice: number;
      currentMarketCap: number;
      supplyEstimated: boolean;
      scenarios: ScenarioResult[];
    }
  > {
    return apiFetch("/calculator/what-if", { method: "POST", body: input });
  },

  /** Spec 18 — the same table for market caps the caller chose. */
  scenarios(input: ScenarioCalcInput): Promise<
    CalculatorMeta & {
      symbol: string;
      currentPrice: number;
      supplyEstimated: boolean;
      scenarios: ScenarioResult[];
    }
  > {
    return apiFetch("/calculator/scenarios", { method: "POST", body: input });
  },

  /** Spec 17 — "I want my holdings to be worth $X". */
  goalPlan(input: GoalPlanInput): Promise<
    CalculatorMeta & {
      supplyEstimated: boolean;
      plan: GoalPlan & { symbol: string; currentPrice: number };
    }
  > {
    return apiFetch("/calculator/goal-plan", { method: "POST", body: input });
  },
};

// ─── Push ─────────────────────────────────────────────────────────────────────

export const push = {
  /** The only push route that doesn't need a session. */
  publicKey(): Promise<{ publicKey: string }> {
    return apiFetch("/push/public-key", { auth: false });
  },

  subscribe(subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }): Promise<{ subscribed: boolean; id: string }> {
    return apiFetch("/push/subscribe", { method: "POST", body: subscription });
  },

  unsubscribe(endpoint: string): Promise<void> {
    return apiFetch("/push/unsubscribe", { method: "POST", body: { endpoint } });
  },

  /** Proves push works end-to-end; 400s with a hint if this device isn't subscribed. */
  test(): Promise<{ notification: AppNotification; devices: number }> {
    return apiFetch("/push/test", { method: "POST" });
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = {
  get(): Promise<{ settings: UserSettings; user: PublicUser }> {
    return apiFetch("/settings");
  },

  update(patch: {
    notifications?: Partial<UserSettings["notifications"]>;
    alarm?: Partial<UserSettings["alarm"]>;
    appearance?: Partial<UserSettings["appearance"]>;
  }): Promise<{ settings: UserSettings }> {
    return apiFetch("/settings", { method: "PATCH", body: patch });
  },

  updateProfile(patch: { name?: string }): Promise<{ user: PublicUser }> {
    return apiFetch("/settings/profile", { method: "PATCH", body: patch });
  },

  /** Rotates tokens, because changing a password ends other sessions. */
  async changePassword(input: {
    currentPassword?: string;
    newPassword: string;
  }): Promise<PublicUser> {
    const data = await apiFetch<{ tokens: TokenPair; user: PublicUser }>("/settings/password", {
      method: "POST",
      body: input,
    });
    setSession(data.tokens);
    return data.user;
  },
};

// ─── Server info ──────────────────────────────────────────────────────────────

export function serverConfig(): Promise<ServerConfig> {
  return apiFetch("/config", { auth: false });
}

export interface HealthReport {
  status: "ok" | "degraded";
  /** Mongoose readyState; 1 is connected. */
  mongo: number;
  cache: string;
  /** Open WebSockets on this instance. */
  sockets: number;
  uptime: number;
}

/** Throws on "degraded" — the server answers 503 in that case, by design. */
export function health(): Promise<HealthReport> {
  return apiFetch("/healthz", { auth: false });
}

export type { AlertKind };
