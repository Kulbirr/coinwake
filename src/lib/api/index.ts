/**
 * The frontend's data layer. Import from here, not from the files inside.
 *
 * Keeping the entry point narrow is what lets the transport change — a different
 * base URL, cookies instead of bearer tokens, a React Native fetch — without any
 * screen noticing (spec 2).
 */

export { ApiClientError, apiBaseUrl, apiFetch, errorHint, errorMessage, socketUrl } from "./client";
export type { ApiErrorBody, RequestOptions } from "./client";

export { clearSession, getAccessToken, isSignedIn, onSessionChange, setSession } from "./session";

export { realtime } from "./socket";
export type { SocketStatus } from "./socket";

export {
  queryError,
  queryKeys,
  useAlertHistory,
  useAlertProgress,
  useAllocation,
  useChart,
  useCoin,
  useCoinSearch,
  useDexSearch,
  useGoalPlanner,
  useMarketCapCalculator,
  usePortfolioSummary,
  useProfitCalculator,
  useScenarioCalculator,
  useServerConfig,
  useSettings,
  useSupply,
  useTrending,
  useWhatIfCalculator,
} from "./queries";

export {
  alerts,
  auth,
  calculator,
  coins,
  goals,
  health,
  notifications,
  portfolio,
  push,
  serverConfig,
  settings,
  wallets,
  watchlist,
} from "./endpoints";
export type {
  AlertInput,
  AlertPatch,
  CalculatorMeta,
  GoalPlan,
  GoalPlanInput,
  HealthReport,
  HistoryWindow,
  HoldingInput,
  MarketCapCalcInput,
  ProfitCalcInput,
  ProfitResult,
  ScenarioCalcInput,
  ScenarioResult,
  WhatIfCalcInput,
  WatchlistEntry,
} from "./endpoints";

export * from "./types";
