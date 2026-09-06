import { useCallback, useEffect, useMemo, useState } from "react";

import type { MarketCapCalcInput, ProfitCalcInput, ProfitResult, ScenarioCalcInput } from "./api";
import {
  errorHint,
  errorMessage,
  useCoin,
  useMarketCapCalculator,
  useProfitCalculator,
  useScenarioCalculator,
  useServerConfig,
} from "./api";
import type { Coin } from "./api";
import { marketCapFromPrice } from "./calc";
import { useStore } from "./store";

export type CalcMode = "PRICE" | "MARKET_CAP";

export interface CalculatorFields {
  coinId: string;
  mode: CalcMode;
  quantity: string;
  purchasePrice: string;
  /** Blank = follow the live feed. */
  currentPrice: string;
  targetPrice: string;
  targetMarketCap: string;
  /**
   * Optional circulating supply. Blank means "use whatever the provider reports";
   * a number wins over the provider's and marks the answer estimated (spec 15).
   */
  supplyOverride: string;
}

const DEFAULT_SCENARIO_CAPS = [1e6, 5e6, 1e7, 5e7, 1e8];

/** The server caps `marketCaps` at 24 entries, so the table can't grow past it. */
const MAX_SCENARIOS = 24;

const num = (value: string) => {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

/** A positive figure, or nothing — so a blank field is omitted, not sent as 0. */
const positive = (value: string) => {
  const parsed = num(value);
  return parsed > 0 ? parsed : undefined;
};

function makeFields(overrides: Partial<CalculatorFields>): CalculatorFields {
  return {
    coinId: "",
    mode: "PRICE",
    quantity: "",
    purchasePrice: "",
    currentPrice: "",
    targetPrice: "",
    targetMarketCap: "",
    supplyOverride: "",
    ...overrides,
  };
}

/** One request per pause in typing, not one per keystroke (spec 31). */
function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

/**
 * Everything the calculator screen displays, from the server's calculator API.
 *
 * The screen only renders what comes back: the numbers, the disclaimer, and the
 * estimate labels are all the server's words, so the calculator can never quietly
 * disagree with the engine that fires alerts (spec 7/30/43). Figures are optional
 * rather than zero-filled — an unanswered question reads "—", not "$0.00" — and
 * whether a market-cap target is even possible is the server's call, so a coin with
 * no reported supply comes back with an error that says what to type instead.
 */
export function useCalculator(initial: Partial<CalculatorFields> = {}) {
  const { coins } = useStore();
  const { data: config } = useServerConfig();
  const [fields, setFields] = useState<CalculatorFields>(() => makeFields(initial));
  const [scenarioCaps, setScenarioCaps] = useState<number[]>(() => [...DEFAULT_SCENARIO_CAPS]);

  const set = useCallback(
    <K extends keyof CalculatorFields>(key: K, value: CalculatorFields[K]) => {
      setFields((f) => ({ ...f, [key]: value }));
    },
    [],
  );

  // Prefer the store's live copy — the price socket keeps it fresh. But the store
  // only holds the loaded market list (the top ranks), so a lower-ranked coin is
  // never in it. Fall back to fetching that coin instead of treating it as
  // priceless, otherwise "Current price" sticks on the "auto" placeholder and the
  // whole calculation reads blank (spec 35).
  const cachedCoin = useMemo(
    () => coins.find((c) => c.id === fields.coinId),
    [coins, fields.coinId],
  );
  const remoteCoin = useCoin(cachedCoin ? undefined : fields.coinId.trim() || undefined);
  const coin: Coin | undefined = cachedCoin ?? remoteCoin.data;

  /** Pick a coin and reset the targets so another coin's numbers never linger. */
  const selectCoin = useCallback((next: Coin) => {
    setFields((f) => ({
      ...f,
      coinId: next.id,
      currentPrice: "",
      supplyOverride: "",
      targetPrice: String(Number((next.price * 3).toPrecision(6))),
      targetMarketCap: String(Math.round((next.marketCap || 0) * 5)),
    }));
  }, []);

  // Requests follow the settled form, so the numbers on screen always describe a
  // complete set of inputs rather than a half-typed one.
  const form = useDebounced(fields, 350);
  const coinId = form.coinId.trim();
  const quantity = num(form.quantity);
  const purchasePrice = num(form.purchasePrice);
  const priceOverride = positive(form.currentPrice);
  const supplyOverride = positive(form.supplyOverride);
  const typedTargetPrice = positive(form.targetPrice);
  const typedTargetCap = positive(form.targetMarketCap);

  const profitInput: ProfitCalcInput | undefined =
    coinId && form.mode === "PRICE" && quantity > 0 && typedTargetPrice !== undefined
      ? {
          coinId,
          quantity,
          purchasePrice,
          targetPrice: typedTargetPrice,
          ...(priceOverride === undefined ? {} : { currentPrice: priceOverride }),
        }
      : undefined;

  const capInput: MarketCapCalcInput | undefined =
    coinId && form.mode === "MARKET_CAP" && typedTargetCap !== undefined
      ? {
          coinId,
          targetMarketCap: typedTargetCap,
          quantity,
          purchasePrice,
          ...(priceOverride === undefined ? {} : { currentPrice: priceOverride }),
          ...(supplyOverride === undefined ? {} : { circulatingSupply: supplyOverride }),
        }
      : undefined;

  // Sorted here so reordering the ladder doesn't count as a different question.
  const ladderCaps = useMemo(() => [...scenarioCaps].sort((a, b) => a - b), [scenarioCaps]);

  const scenarioInput: ScenarioCalcInput | undefined =
    coinId && ladderCaps.length > 0
      ? {
          coinId,
          quantity,
          purchasePrice,
          marketCaps: ladderCaps,
          ...(supplyOverride === undefined ? {} : { circulatingSupply: supplyOverride }),
        }
      : undefined;

  const profitQuery = useProfitCalculator(profitInput);
  const capQuery = useMarketCapCalculator(capInput);
  const scenarioQuery = useScenarioCalculator(scenarioInput);

  const profit = profitQuery.data;
  const cap = capQuery.data;
  const ladder = scenarioQuery.data;

  const view = useMemo(() => {
    const byPrice = form.mode === "PRICE";
    const result: ProfitResult | undefined = byPrice ? profit?.result : cap?.result.profit;

    const currentPrice = byPrice
      ? (profit?.result.currentPrice ?? priceOverride ?? coin?.price)
      : (cap?.result.currentPrice ?? priceOverride ?? coin?.price);

    const targetPrice = byPrice ? typedTargetPrice : cap?.result.targetPrice;

    // The server's figure when it gave one; otherwise the same precedence it uses,
    // so the supply on screen is the one the next request will be answered with.
    const supply = cap?.result.circulatingSupply ?? supplyOverride ?? coin?.circulatingSupply;

    // In market-cap mode both caps are the server's. In price mode there is no
    // market-cap response to read, so the implied caps are local input hints.
    const currentMarketCap = byPrice
      ? currentPrice !== undefined && supply !== undefined
        ? marketCapFromPrice(currentPrice, supply)
        : undefined
      : cap?.result.currentMarketCap;

    const targetMarketCap = byPrice
      ? targetPrice !== undefined && supply !== undefined
        ? marketCapFromPrice(targetPrice, supply)
        : undefined
      : cap?.result.targetMarketCap;

    const active = byPrice ? profit : cap;

    return {
      result,
      currentPrice,
      targetPrice,
      supply,
      currentMarketCap,
      targetMarketCap,
      scenarios: ladder?.scenarios ?? [],
      /** True when a figure above rests on a supply the user typed (spec 7/15). */
      supplyEstimated: Boolean(cap?.supplyEstimated ?? ladder?.supplyEstimated),
      /** The server's wording for that, verbatim — never paraphrase an estimate. */
      supplyNote: cap?.supplyNote ?? ladder?.supplyNote,
      /** Why ROI and multiple are missing, in the server's words. */
      costBasisNote: active?.costBasisNote ?? ladder?.costBasisNote,
      disclaimer: active?.disclaimer ?? ladder?.disclaimer ?? config?.disclaimer,
    };
  }, [
    form.mode,
    profit,
    cap,
    ladder,
    coin,
    priceOverride,
    supplyOverride,
    typedTargetPrice,
    config?.disclaimer,
  ]);

  const addScenario = useCallback((marketCap: number) => {
    if (!Number.isFinite(marketCap) || marketCap <= 0) return;
    setScenarioCaps((list) =>
      list.includes(marketCap) || list.length >= MAX_SCENARIOS ? list : [...list, marketCap],
    );
  }, []);

  /**
   * By market cap, not by id: the server mints scenario ids per request, so the
   * value in the row is the only identity that survives the next response.
   */
  const removeScenario = useCallback((marketCap: number) => {
    setScenarioCaps((list) => list.filter((c) => c !== marketCap));
  }, []);

  /** The failing request's message and hint, already fit to show (spec 35). */
  const failure = profitQuery.error ?? capQuery.error ?? scenarioQuery.error;

  return {
    fields,
    set,
    coin,
    selectCoin,
    addScenario,
    removeScenario,
    scenarioFull: scenarioCaps.length >= MAX_SCENARIOS,
    pending: profitQuery.isFetching || capQuery.isFetching || scenarioQuery.isFetching,
    error: failure ? errorMessage(failure) : undefined,
    hint: failure ? errorHint(failure) : undefined,
    ...view,
  };
}

export type Calculator = ReturnType<typeof useCalculator>;
