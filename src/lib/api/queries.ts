import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { ApiClientError, errorHint } from "./client";
import {
  alerts as alertsApi,
  calculator as calculatorApi,
  coins as coinsApi,
  notifications as notificationsApi,
  portfolio as portfolioApi,
  serverConfig,
  settings as settingsApi,
  watchlist as watchlistApi,
} from "./endpoints";
import type {
  GoalPlanInput,
  HistoryWindow,
  MarketCapCalcInput,
  ProfitCalcInput,
  ScenarioCalcInput,
  WhatIfCalcInput,
} from "./endpoints";
import { isSignedIn } from "./session";
import type { ChartRange } from "./types";

/**
 * Query keys and the read hooks built on them.
 *
 * Every cache key in the app is named here so an invalidation can't miss a screen
 * (and so two components asking for the same thing share one request — spec 31).
 * The shared entities the whole app reads — coins, alerts, holdings, watchlist,
 * notifications — are consumed through `useStore`; these hooks cover the rest.
 */
export const queryKeys = {
  config: ["config"] as const,
  coins: ["coins"] as const,
  coin: (coinId: string) => ["coin", coinId] as const,
  coinSearch: (query: string) => ["coin-search", query] as const,
  chart: (coinId: string, range: ChartRange) => ["chart", coinId, range] as const,
  trending: (limit: number) => ["trending", limit] as const,
  supply: (coinId: string) => ["supply", coinId] as const,
  alerts: ["alerts"] as const,
  alertProgress: ["alert-progress"] as const,
  alertHistory: (window: HistoryWindow) => ["alert-history", window] as const,
  holdings: ["holdings"] as const,
  portfolio: ["portfolio"] as const,
  allocation: ["allocation"] as const,
  watchlist: ["watchlist"] as const,
  notifications: ["notifications"] as const,
  settings: ["settings"] as const,
  // Calculator results are keyed on the whole request body — React Query hashes it
  // deterministically, so two screens asking the same question share one answer.
  calcProfit: (input: ProfitCalcInput | undefined) => ["calc-profit", input] as const,
  calcMarketCap: (input: MarketCapCalcInput | undefined) => ["calc-market-cap", input] as const,
  calcScenarios: (input: ScenarioCalcInput | undefined) => ["calc-scenarios", input] as const,
  calcWhatIf: (input: WhatIfCalcInput | undefined) => ["calc-what-if", input] as const,
  calcGoalPlan: (input: GoalPlanInput | undefined) => ["calc-goal-plan", input] as const,
};

/**
 * Charts move much slower than prices and the server caches them, so a long
 * stale window keeps a table of sparklines from re-requesting on every render.
 */
const CHART_STALE_MS = 5 * 60_000;

/** What this deployment supports, so the UI can hide what isn't configured. */
export function useServerConfig() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: () => serverConfig(),
    staleTime: Infinity,
    retry: 1,
  });
}

export function useChart(coinId: string | undefined, range: ChartRange) {
  return useQuery({
    queryKey: queryKeys.chart(coinId ?? "", range),
    queryFn: () => coinsApi.chart(coinId as string, range).then((r) => r.points),
    enabled: Boolean(coinId),
    staleTime: CHART_STALE_MS,
    gcTime: 30 * 60_000,
    // A chart miss is usually the provider rate limiting us, and three more
    // attempts is the wrong answer to that — it is the same load again (spec 31).
    retry: 1,
  });
}

/**
 * Server-side coin search, for coins outside the loaded market list.
 *
 * Results carry no price — the server returns identity only — so a caller must
 * fetch the coin before showing a quote.
 */
export function useCoinSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: queryKeys.coinSearch(trimmed.toLowerCase()),
    queryFn: () => coinsApi.search(trimmed).then((r) => r.results),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });
}

/**
 * DexScreener Solana DEX search — separate from main search by design.
 * For pump.fun and other Solana DEX tokens not on CoinGecko.
 */
export function useDexSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["dex-search", trimmed.toLowerCase()] as const,
    queryFn: () => coinsApi.dexSearch(trimmed).then((r) => r.results),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });
}

export function useCoin(coinId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.coin(coinId ?? ""),
    queryFn: () => coinsApi.get(coinId as string).then((r) => r.coin),
    enabled: Boolean(coinId),
    staleTime: 30_000,
  });
}

export function useTrending(limit = 6) {
  return useQuery({
    queryKey: queryKeys.trending(limit),
    queryFn: () => coinsApi.trending(limit).then((r) => r.coins),
    staleTime: 5 * 60_000,
  });
}

/** Circulating supply plus whether the provider actually had it (spec 15). */
export function useSupply(coinId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.supply(coinId ?? ""),
    queryFn: () => coinsApi.supply(coinId as string),
    enabled: Boolean(coinId),
    staleTime: 10 * 60_000,
  });
}

/** How far each active alert has travelled from its baseline (spec 24). */
export function useAlertProgress() {
  return useQuery({
    queryKey: queryKeys.alertProgress,
    queryFn: () => alertsApi.progress().then((r) => r.progress),
    enabled: isSignedIn(),
    staleTime: 15_000,
  });
}

export function useAlertHistory(window: HistoryWindow = "all") {
  return useQuery({
    queryKey: queryKeys.alertHistory(window),
    queryFn: () => alertsApi.history(window).then((r) => r.history),
    enabled: isSignedIn(),
    staleTime: 60_000,
  });
}

/**
 * The server-computed portfolio: profit, ROI and the honesty flags the UI has to
 * respect (`costBasisEstimated`, `note`) rather than recompute (spec 7).
 */
export function usePortfolioSummary() {
  return useQuery({
    queryKey: queryKeys.portfolio,
    queryFn: () => portfolioApi.summary(),
    enabled: isSignedIn(),
    staleTime: 20_000,
  });
}

export function useAllocation() {
  return useQuery({
    queryKey: queryKeys.allocation,
    queryFn: () => portfolioApi.allocation(),
    enabled: isSignedIn(),
    staleTime: 30_000,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsApi.get(),
    enabled: isSignedIn(),
    staleTime: 5 * 60_000,
  });
}

/** Everything a screen needs to explain a failure without leaking internals. */
export function queryError(error: unknown): { message: string; hint?: string } | null {
  if (!error) return null;
  const hint = errorHint(error);
  return {
    message: error instanceof ApiClientError ? error.message : "We couldn't load that just now.",
    ...(hint ? { hint } : {}),
  };
}

// ─── Calculator (spec 14-18) ──────────────────────────────────────────────────

/**
 * The calculators run server-side so the numbers, the estimate flags and the
 * disclaimer all come from one implementation (spec 7/43).
 *
 * They are queries despite the POST: a result is a pure function of the request
 * body, so it caches and dedupes exactly like a GET — the body is a body only
 * because it is too big for a query string. Pass `undefined` while the form is
 * still incomplete and the request stays parked; keep the last answer on screen
 * while the next one is in flight, so typing doesn't strobe the numbers.
 *
 * `retry: false` because every failure here is a 4xx the user has to act on — a
 * missing supply, an out-of-range target — and repeating the call cannot fix it.
 */
const calcOptions = {
  placeholderData: keepPreviousData,
  staleTime: 60_000,
  retry: false,
} as const;

export function useProfitCalculator(input: ProfitCalcInput | undefined) {
  return useQuery({
    queryKey: queryKeys.calcProfit(input),
    queryFn: () => calculatorApi.profit(input as ProfitCalcInput),
    enabled: input !== undefined,
    ...calcOptions,
  });
}

export function useMarketCapCalculator(input: MarketCapCalcInput | undefined) {
  return useQuery({
    queryKey: queryKeys.calcMarketCap(input),
    queryFn: () => calculatorApi.marketCap(input as MarketCapCalcInput),
    enabled: input !== undefined,
    ...calcOptions,
  });
}

export function useScenarioCalculator(input: ScenarioCalcInput | undefined) {
  return useQuery({
    queryKey: queryKeys.calcScenarios(input),
    queryFn: () => calculatorApi.scenarios(input as ScenarioCalcInput),
    enabled: input !== undefined,
    ...calcOptions,
  });
}

export function useWhatIfCalculator(input: WhatIfCalcInput | undefined) {
  return useQuery({
    queryKey: queryKeys.calcWhatIf(input),
    queryFn: () => calculatorApi.whatIf(input as WhatIfCalcInput),
    enabled: input !== undefined,
    ...calcOptions,
  });
}

export function useGoalPlanner(input: GoalPlanInput | undefined) {
  return useQuery({
    queryKey: queryKeys.calcGoalPlan(input),
    queryFn: () => calculatorApi.goalPlan(input as GoalPlanInput),
    enabled: input !== undefined,
    ...calcOptions,
  });
}

// Re-exported so a screen never has to reach past this layer for a write.
export { alertsApi, coinsApi, notificationsApi, portfolioApi, settingsApi, watchlistApi };
