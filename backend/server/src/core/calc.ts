/**
 * Pure calculation layer. Mirrors the frontend's `src/lib/calc.ts` so the client
 * can compute optimistically while the server stays authoritative for anything
 * that drives an alert.
 *
 * Nothing here predicts a price. Every function answers "if X, then Y" using
 * numbers the user supplied (spec 43).
 */

export interface ProfitInputs {
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  targetPrice: number;
}

export interface ProfitResult {
  investment: number;
  currentValue: number;
  targetValue: number;
  /** Target value minus what was invested. */
  profit: number;
  /**
   * Null when nothing was invested: a return on zero is undefined, and reporting
   * `0` would read as "flat" next to a large profit figure (spec 7/35).
   */
  roi: number | null;
  multiple: number | null;
  /** Where the position stands right now, before hitting the target. */
  unrealizedProfit: number;
  unrealizedRoi: number | null;
}

export function calcProfit({
  quantity,
  purchasePrice,
  currentPrice,
  targetPrice,
}: ProfitInputs): ProfitResult {
  const investment = quantity * purchasePrice;
  const currentValue = quantity * currentPrice;
  const targetValue = quantity * targetPrice;
  const profit = targetValue - investment;
  const unrealizedProfit = currentValue - investment;
  return {
    investment,
    currentValue,
    targetValue,
    profit,
    roi: investment > 0 ? (profit / investment) * 100 : null,
    multiple: investment > 0 ? targetValue / investment : null,
    unrealizedProfit,
    unrealizedRoi: investment > 0 ? (unrealizedProfit / investment) * 100 : null,
  };
}

/** Target Price = Target Market Cap / Circulating Supply (spec 15). */
export function priceFromMarketCap(marketCap: number, circulatingSupply: number): number {
  if (!circulatingSupply || !Number.isFinite(circulatingSupply)) return 0;
  return marketCap / circulatingSupply;
}

export function marketCapFromPrice(price: number, circulatingSupply: number): number {
  return price * (circulatingSupply || 0);
}

/**
 * Fully diluted valuation uses max supply when the project has a hard cap and
 * total supply otherwise. Returns null rather than guessing when neither exists.
 */
export function fullyDilutedValuation(
  price: number,
  supply: { maxSupply?: number | null; totalSupply?: number },
): number | null {
  const denominator = supply.maxSupply ?? supply.totalSupply;
  if (!denominator || !Number.isFinite(denominator)) return null;
  return price * denominator;
}

/** Absolute price a "+10%" style alert resolves to. */
export function priceFromPercentMove(baselinePrice: number, percent: number): number {
  return baselinePrice * (1 + percent / 100);
}

export interface ScenarioInput {
  id: string;
  marketCap: number;
}

export interface ScenarioResult extends ScenarioInput {
  targetPrice: number;
  value: number;
  profit: number;
  /** Null when nothing was invested — see `ProfitResult.roi`. */
  roi: number | null;
  multiple: number | null;
}

/** Spec 18 — the scenario table, sorted ascending by market cap. */
export function buildScenarios(
  scenarios: ScenarioInput[],
  opts: { circulatingSupply: number; quantity: number; purchasePrice: number },
): ScenarioResult[] {
  const investment = opts.quantity * opts.purchasePrice;
  return scenarios
    .slice()
    .sort((a, b) => a.marketCap - b.marketCap)
    .map((s) => {
      const targetPrice = priceFromMarketCap(s.marketCap, opts.circulatingSupply);
      const value = targetPrice * opts.quantity;
      const profit = value - investment;
      return {
        ...s,
        targetPrice,
        value,
        profit,
        roi: investment > 0 ? (profit / investment) * 100 : null,
        multiple: investment > 0 ? value / investment : null,
      };
    });
}

/**
 * Spec 24 — how far an alert has travelled from where it was armed toward its
 * target. Measured from the baseline rather than from zero, so "80% of the way
 * there" means what a user expects.
 */
export function alertProgress(
  baseline: number,
  current: number,
  target: number,
  condition: "ABOVE" | "BELOW",
): { percent: number; remaining: number; reached: boolean } {
  const reached = condition === "ABOVE" ? current >= target : current <= target;
  const remaining = Math.abs(target - current);
  if (reached) return { percent: 100, remaining: 0, reached: true };

  const span = target - baseline;
  if (span === 0) return { percent: 100, remaining: 0, reached: true };

  const travelled = current - baseline;
  const percent = Math.max(0, Math.min(100, (travelled / span) * 100));
  return { percent, remaining, reached: false };
}

/** Signed percentage gap from current to target. */
export function distanceToTarget(current: number, target: number): number {
  if (!current) return 0;
  return ((target - current) / current) * 100;
}

export interface GoalPlan {
  targetValue: number;
  requiredPrice: number;
  /** Null when circulating supply is unknown — we refuse to invent one. */
  requiredMarketCap: number | null;
  requiredMultiple: number;
  priceDistancePercent: number;
  marketCapDistancePercent: number | null;
  currentValue: number;
}

/**
 * Spec 17 — "I want my holdings to be worth $X". Works backwards from the goal
 * to the price (and market cap) that would produce it.
 */
export function planGoal(opts: {
  targetValue: number;
  quantity: number;
  currentPrice: number;
  circulatingSupply?: number;
}): GoalPlan {
  const { targetValue, quantity, currentPrice, circulatingSupply } = opts;
  const currentValue = quantity * currentPrice;
  const requiredPrice = quantity > 0 ? targetValue / quantity : 0;
  const requiredMarketCap =
    circulatingSupply && Number.isFinite(circulatingSupply)
      ? requiredPrice * circulatingSupply
      : null;
  const currentMarketCap =
    circulatingSupply && Number.isFinite(circulatingSupply)
      ? currentPrice * circulatingSupply
      : null;

  return {
    targetValue,
    requiredPrice,
    requiredMarketCap,
    requiredMultiple: currentValue > 0 ? targetValue / currentValue : 0,
    priceDistancePercent: distanceToTarget(currentPrice, requiredPrice),
    marketCapDistancePercent:
      currentMarketCap && requiredMarketCap
        ? distanceToTarget(currentMarketCap, requiredMarketCap)
        : null,
    currentValue,
  };
}

/** Evenly spaced market-cap steps for the what-if slider (spec 16). */
export function scenarioLadder(from: number, to: number, steps = 8): number[] {
  if (steps < 2 || from <= 0 || to <= from) return [from, to].filter((n) => n > 0);
  // Logarithmic spacing — market caps span orders of magnitude, so linear steps
  // would bunch every interesting value at the low end.
  const ratio = Math.log(to / from) / (steps - 1);
  return Array.from({ length: steps }, (_, i) => from * Math.exp(ratio * i));
}
