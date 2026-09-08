import { Types } from "mongoose";

import { createLogger } from "../config/logger.js";
import { alertProgress, priceFromMarketCap, priceFromPercentMove } from "../core/calc.js";
import type {
  Alert,
  AlertProgress,
  Coin,
  NotificationKind,
  PortfolioMetric,
} from "../core/types.js";
import { AlertEventModel } from "../models/AlertEvent.js";
import { AlertModel, toAlert, type AlertDocument } from "../models/Alert.js";
import { HoldingModel } from "../models/Holding.js";
import { User } from "../models/User.js";
import { dispatchNotification } from "./notification/dispatch.js";
import type { NotificationPayload } from "./notification/NotificationProvider.js";
import { recordPeak, summarise } from "./portfolio.js";
import { hub } from "./realtime/hub.js";

const log = createLogger("alerts");

/**
 * Everything a PORTFOLIO alert can be measured against. Built once per user per
 * tick, and by the progress endpoint, so both read the same numbers.
 */
export interface PortfolioContext {
  value: number;
  profit: number;
  roi: number;
  /** Positive percentage below the all-time peak value. */
  drawdown: number;
}

/**
 * The single place a portfolio metric is turned into a number. Both the evaluator
 * and the progress endpoint go through here — when they each had their own
 * switch, DRAWDOWN silently reported ROI in one of them.
 */
export function portfolioMetricValue(
  metric: PortfolioMetric,
  context: PortfolioContext,
): number {
  switch (metric) {
    case "VALUE":
      return context.value;
    case "PROFIT":
      return context.profit;
    case "ROI":
      return context.roi;
    case "DRAWDOWN":
      return context.drawdown;
    default:
      return context.value;
  }
}

/** Positive percentage below the peak: a 20% drop is `20`, not `-20`. */
export function drawdownPercent(peak: number, value: number): number {
  if (peak <= 0) return 0;
  return ((peak - value) / peak) * 100;
}

/**
 * Resolves any alert kind to a single comparable number pair, so one evaluator
 * covers price, market cap, percentage moves and portfolio thresholds.
 * Returns null when the alert can't be evaluated yet (e.g. missing supply).
 */
export function resolveTarget(
  alert: Pick<
    Alert,
    | "kind"
    | "condition"
    | "targetPrice"
    | "targetMarketCap"
    | "targetPercent"
    | "baselinePrice"
    | "portfolioMetric"
    | "targetValue"
  >,
  context: { coin?: Coin | null; portfolio?: PortfolioContext },
): { current: number; target: number; baseline: number } | null {
  switch (alert.kind) {
    case "PRICE": {
      const coin = context.coin;
      if (!coin || alert.targetPrice === undefined) return null;
      return {
        current: coin.price,
        target: alert.targetPrice,
        baseline: alert.baselinePrice ?? coin.price,
      };
    }

    case "MARKET_CAP": {
      const coin = context.coin;
      if (!coin || alert.targetMarketCap === undefined) return null;
      // Compare caps directly when we have one; otherwise fall back to the price
      // the cap implies, which needs circulating supply.
      if (coin.marketCap > 0) {
        const baselinePrice = alert.baselinePrice ?? coin.price;
        const baselineCap = coin.circulatingSupply
          ? baselinePrice * coin.circulatingSupply
          : coin.marketCap;
        return { current: coin.marketCap, target: alert.targetMarketCap, baseline: baselineCap };
      }
      if (!coin.circulatingSupply) return null;
      return {
        current: coin.price,
        target: priceFromMarketCap(alert.targetMarketCap, coin.circulatingSupply),
        baseline: alert.baselinePrice ?? coin.price,
      };
    }

    case "PERCENT": {
      const coin = context.coin;
      if (!coin || alert.targetPercent === undefined) return null;
      // Percentage alerts are measured from the price when the alert was armed —
      // that's what "+10% from here" means to the person who set it.
      const baseline = alert.baselinePrice ?? coin.price;
      return {
        current: coin.price,
        target: priceFromPercentMove(baseline, alert.targetPercent),
        baseline,
      };
    }

    case "PORTFOLIO": {
      const p = context.portfolio;
      if (!p || alert.targetValue === undefined) return null;
      const current = portfolioMetricValue(alert.portfolioMetric ?? "VALUE", p);
      return { current, target: alert.targetValue, baseline: 0 };
    }

    default:
      return null;
  }
}

function crossed(current: number, target: number, condition: "ABOVE" | "BELOW"): boolean {
  return condition === "ABOVE" ? current >= target : current <= target;
}

export function computeProgress(
  alert: Alert,
  context: { coin?: Coin | null; portfolio?: PortfolioContext },
): AlertProgress | null {
  const resolved = resolveTarget(alert, context);
  if (!resolved) return null;

  const { percent, remaining, reached } = alertProgress(
    resolved.baseline,
    resolved.current,
    resolved.target,
    alert.condition,
  );

  return {
    alertId: alert.id,
    current: resolved.current,
    target: resolved.target,
    percent,
    remaining,
    reached,
  };
}

const KIND_TO_NOTIFICATION: Record<Alert["kind"], NotificationKind> = {
  PRICE: "PRICE_TARGET",
  MARKET_CAP: "MARKET_CAP_TARGET",
  PERCENT: "PERCENT_MOVE",
  PORTFOLIO: "PORTFOLIO_TARGET",
};

function formatUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (abs === 0) return "$0";
  return `$${value.toFixed(8).replace(/0+$/, "")}`;
}

function describe(
  alert: AlertDocument,
  coin: Coin | null,
  current: number,
  target: number,
): { title: string; body: string } {
  const label = coin ? `${coin.name} (${coin.symbol})` : "Your portfolio";
  const direction = alert.condition === "ABOVE" ? "reached" : "fell to";

  switch (alert.kind) {
    case "PRICE":
      return {
        title: `${coin?.symbol ?? "Price"} ${direction} ${formatUsd(target)}`,
        body: `${label} is now ${formatUsd(current)}.`,
      };
    case "MARKET_CAP":
      return {
        title: `${coin?.symbol ?? "Market cap"} ${direction} ${formatUsd(target)} market cap`,
        body: `${label} market cap is now ${formatUsd(current)}.`,
      };
    case "PERCENT": {
      const percent = alert.targetPercent ?? 0;
      return {
        title: `${coin?.symbol ?? "Price"} moved ${percent > 0 ? "+" : ""}${percent}%`,
        body: `${label} is now ${formatUsd(current)}.`,
      };
    }
    case "PORTFOLIO": {
      const metric = alert.portfolioMetric ?? "VALUE";
      const formatted = metric === "ROI" ? `${current.toFixed(2)}%` : formatUsd(current);
      const targetText = metric === "ROI" ? `${target.toFixed(2)}%` : formatUsd(target);
      return {
        title: `Portfolio ${metric.toLowerCase()} ${direction} ${targetText}`,
        body: `Your portfolio ${metric.toLowerCase()} is now ${formatted}.`,
      };
    }
    default:
      return { title: "Alert triggered", body: `${label} hit your target.` };
  }
}

/** Fires one alert: records history, notifies, and re-arms or retires it. */
async function trigger(input: {
  alert: AlertDocument;
  coin: Coin | null;
  current: number;
  target: number;
}): Promise<void> {
  const { alert, coin, current, target } = input;
  const now = new Date();
  const userId = alert.userId.toString();

  const { title, body } = describe(alert, coin, current, target);

  await AlertEventModel.create({
    userId: alert.userId,
    alertId: alert._id,
    ...(alert.coinId ? { coinId: alert.coinId } : {}),
    ...(alert.name ? { alertName: alert.name } : {}),
    kind: alert.kind,
    condition: alert.condition,
    target,
    actual: current,
    triggeredAt: now,
  });

  alert.triggerCount += 1;
  alert.triggeredAt = now;

  if (alert.repeat === "RECURRING") {
    // Stays armed, but muted for the cooldown window so a price hovering on the
    // target doesn't fire every tick (spec 9).
    alert.cooldownUntil = new Date(now.getTime() + alert.cooldownMinutes * 60_000);
    // Re-baseline percentage alerts so the next move is measured from here.
    if (alert.kind === "PERCENT") alert.baselinePrice = current;
  } else {
    alert.status = "TRIGGERED";
  }
  await alert.save();

  const settings = await User.findById(alert.userId).select("settings").lean();
  const prefs = settings?.settings.notifications;
  const kindEnabled =
    alert.kind === "PORTFOLIO" ? prefs?.portfolioAlerts !== false : prefs?.priceAlerts !== false;

  const payload: NotificationPayload = {
    kind: KIND_TO_NOTIFICATION[alert.kind],
    title,
    body,
    ...(alert.coinId ? { coinId: alert.coinId } : {}),
    alertId: alert.id as string,
    ...(alert.notify.alarm && settings?.settings.alarm.sound !== false ? { alarm: true } : {}),
    url: alert.coinId ? `/coin/${alert.coinId}` : "/portfolio",
  };

  // The socket message drives the full-screen alarm in any open tab (spec 11);
  // push is what reaches the user when nothing is open (spec 30).
  hub.sendToUser(userId, {
    type: "alert-triggered",
    payload: { alert: toAlert(alert), coin, alarm: Boolean(payload.alarm) },
  });

  if (kindEnabled) {
    await dispatchNotification({
      userId,
      payload,
      channels: {
        browser: alert.notify.browser && prefs?.browser !== false,
        push: alert.notify.push && prefs?.push === true,
        email: alert.notify.email && prefs?.email === true,
      },
    });
  }

  log.info(`Triggered ${alert.kind} alert ${alert.id as string} for user ${userId}: ${title}`);
}

/**
 * Evaluates every armed coin alert against a batch of fresh prices (spec 30).
 * Runs on the server on every poll tick, so alerts fire whether or not any
 * browser is open.
 */
export async function evaluateCoinAlerts(coins: Coin[]): Promise<number> {
  if (coins.length === 0) return 0;

  const byId = new Map(coins.map((c) => [c.id, c]));
  const now = new Date();

  const alerts = await AlertModel.find({
    status: "ACTIVE",
    kind: { $in: ["PRICE", "MARKET_CAP", "PERCENT"] },
    coinId: { $in: [...byId.keys()] },
    $or: [{ cooldownUntil: { $exists: false } }, { cooldownUntil: { $lte: now } }],
  });

  let fired = 0;

  for (const alert of alerts) {
    const coin = alert.coinId ? byId.get(alert.coinId) : undefined;
    if (!coin) continue;

    const resolved = resolveTarget(toAlert(alert), { coin });
    if (!resolved) continue;

    if (crossed(resolved.current, resolved.target, alert.condition)) {
      try {
        await trigger({ alert, coin, current: resolved.current, target: resolved.target });
        fired += 1;
      } catch (err) {
        // One bad alert must not stop the rest of the batch.
        log.error(`Failed to trigger alert ${alert.id as string}: ${(err as Error).message}`);
      }
    }
  }

  return fired;
}

/**
 * Evaluates portfolio alerts (spec 19). Separate from the coin pass because it
 * needs one portfolio valuation per user rather than per coin.
 */
export async function evaluatePortfolioAlerts(): Promise<number> {
  const now = new Date();

  const alerts = await AlertModel.find({
    status: "ACTIVE",
    kind: "PORTFOLIO",
    $or: [{ cooldownUntil: { $exists: false } }, { cooldownUntil: { $lte: now } }],
  });

  if (alerts.length === 0) return 0;

  const byUser = new Map<string, AlertDocument[]>();
  for (const alert of alerts) {
    const key = alert.userId.toString();
    const list = byUser.get(key) ?? [];
    list.push(alert);
    byUser.set(key, list);
  }

  let fired = 0;

  for (const [userId, userAlerts] of byUser) {
    try {
      const holdings = await HoldingModel.find({ userId: new Types.ObjectId(userId) });
      if (holdings.length === 0) continue;

      const summary = await summarise(holdings);
      const peak = recordPeak(userId, summary.value);

      const context: PortfolioContext = {
        value: summary.value,
        profit: summary.profit,
        roi: summary.roi,
        // Drawdown is measured against the highest value we've seen, so a
        // "drops 20%" alert is `DRAWDOWN ABOVE 20`.
        drawdown: drawdownPercent(peak, summary.value),
      };

      for (const alert of userAlerts) {
        const resolved = resolveTarget(toAlert(alert), { portfolio: context });
        if (!resolved) continue;

        if (crossed(resolved.current, resolved.target, alert.condition)) {
          await trigger({ alert, coin: null, current: resolved.current, target: resolved.target });
          fired += 1;
        }
      }
    } catch (err) {
      log.error(`Portfolio alert pass failed for ${userId}: ${(err as Error).message}`);
    }
  }

  return fired;
}
