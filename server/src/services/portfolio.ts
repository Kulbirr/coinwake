import { Types } from "mongoose";

import type { Coin, PortfolioRow, PortfolioSummary } from "../core/types.js";
import { HoldingModel, toHolding, type HoldingDocument } from "../models/Holding.js";
import { getCryptoProvider } from "./crypto/index.js";

/**
 * Builds the portfolio view (spec 5/6/20). Manual and wallet-derived holdings
 * live in the same collection and are merged here; a row whose cost basis we
 * couldn't establish is flagged rather than assumed (spec 7).
 */
export async function buildPortfolio(userId: string): Promise<PortfolioSummary> {
  const docs = await HoldingModel.find({ userId: new Types.ObjectId(userId) }).sort({
    createdAt: 1,
  });

  return summarise(docs);
}

export async function summarise(docs: HoldingDocument[]): Promise<PortfolioSummary> {
  if (docs.length === 0) return emptySummary();

  const coinIds = [...new Set(docs.map((d) => d.coinId))];
  const coins = await loadCoins(coinIds);

  let value = 0;
  let invested = 0;
  let hasEstimatedCostBasis = false;

  const partial = docs.map((doc) => {
    const holding = toHolding(doc);
    const coin = coins.get(doc.coinId) ?? null;
    const rowValue = coin ? holding.quantity * coin.price : 0;
    // An unavailable cost basis contributes nothing to "invested" — counting it
    // as zero would silently inflate ROI, so the flag below labels the total.
    const costBasisEstimated = holding.costBasisSource !== "USER";
    const rowInvested =
      holding.costBasisSource === "UNAVAILABLE" ? 0 : holding.quantity * holding.averageBuyPrice;

    if (costBasisEstimated) hasEstimatedCostBasis = true;
    value += rowValue;
    invested += rowInvested;

    const profit = rowValue - rowInvested;
    return {
      holding,
      coin,
      value: rowValue,
      invested: rowInvested,
      profit,
      roi: rowInvested > 0 ? (profit / rowInvested) * 100 : 0,
      costBasisEstimated,
      ...noteFor(holding.costBasisSource, coin === null),
    };
  });

  const rows: PortfolioRow[] = partial.map((row) => ({
    ...row,
    allocation: value > 0 ? (row.value / value) * 100 : 0,
  }));

  const profit = value - invested;

  // Best/worst are meaningless for rows with no real cost basis, so they're
  // ranked only over positions we can actually measure.
  const measurable = rows.filter((r) => r.invested > 0);
  const sorted = [...measurable].sort((a, b) => b.roi - a.roi);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return {
    value,
    invested,
    profit,
    roi: invested > 0 ? (profit / invested) * 100 : 0,
    bestPerformer: best ? { coinId: best.holding.coinId, roi: best.roi } : null,
    worstPerformer:
      worst && measurable.length > 1 ? { coinId: worst.holding.coinId, roi: worst.roi } : null,
    hasEstimatedCostBasis,
    rows,
  };
}

/**
 * Spec 7/35 — says out loud why a row's profit figure is missing or approximate,
 * so the UI never has to infer it from a zero.
 */
function noteFor(
  source: "USER" | "TRANSACTIONS" | "UNAVAILABLE",
  priceMissing: boolean,
): { note?: string } {
  if (priceMissing) return { note: "Price unavailable right now." };
  if (source === "UNAVAILABLE") {
    return { note: "Cost basis unavailable — add your average buy price to track profit." };
  }
  if (source === "TRANSACTIONS") {
    return { note: "Cost basis estimated from on-chain transfers." };
  }
  return {};
}

/**
 * Resolves coins for a set of ids. A single missing or failing coin leaves its
 * row with `coin: null` (rendered as "price unavailable") instead of failing the
 * whole portfolio request.
 */
async function loadCoins(coinIds: string[]): Promise<Map<string, Coin>> {
  const provider = getCryptoProvider();
  const map = new Map<string, Coin>();

  const results = await Promise.allSettled(coinIds.map((id) => provider.getCoin(id)));
  results.forEach((result, index) => {
    const id = coinIds[index];
    if (id === undefined) return;
    if (result.status === "fulfilled" && result.value) map.set(id, result.value);
  });

  return map;
}

function emptySummary(): PortfolioSummary {
  return {
    value: 0,
    invested: 0,
    profit: 0,
    roi: 0,
    bestPerformer: null,
    worstPerformer: null,
    hasEstimatedCostBasis: false,
    rows: [],
  };
}

/** Peak portfolio value per user, used by DRAWDOWN alerts (spec 19). */
const peakValues = new Map<string, number>();

export function recordPeak(userId: string, value: number): number {
  const peak = Math.max(peakValues.get(userId) ?? 0, value);
  peakValues.set(userId, peak);
  return peak;
}

export function getPeak(userId: string): number | undefined {
  return peakValues.get(userId);
}
