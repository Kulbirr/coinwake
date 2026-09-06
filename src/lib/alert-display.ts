import type { Alert, AlertKind, Coin, PortfolioSummary } from "./api";
import { formatCompact, formatPercent, formatPrice } from "./format";

/**
 * How to describe an alert on screen, in one place.
 *
 * An alert's numbers mean different things per kind — dollars for a price, a
 * compact dollar figure for a market cap, a percentage for a move — and the alarm
 * overlay, the alert card and the watchlist all need the same answer. When each of
 * them decided for itself, a market-cap target rendered as "$1.20".
 *
 * Two units, deliberately kept apart:
 *
 * - the **definition** unit is what the user typed ("+10%"),
 * - the **progress** unit is what the server compares, and for a percentage alert
 *   that's a price, because `resolveTarget` turns "+10% from here" into the price
 *   that represents (server/src/services/alertEngine.ts).
 *
 * Conflating them printed a percentage in a dollar slot. Nothing here evaluates an
 * alert: whether a target was hit is the server's call (spec 30).
 */
export type AlertUnit = "PRICE" | "USD" | "PERCENT";

export const ALERT_KIND_LABEL: Record<AlertKind, string> = {
  PRICE: "Price Alert",
  MARKET_CAP: "Market Cap Alert",
  PERCENT: "Move Alert",
  PORTFOLIO: "Portfolio Alert",
};

/** The figure being watched, for labelling a row of numbers. */
export const ALERT_METRIC_LABEL: Record<AlertKind, string> = {
  PRICE: "Price",
  MARKET_CAP: "Market cap",
  PERCENT: "Move",
  PORTFOLIO: "Portfolio",
};

/** ROI and drawdown are percentages; value and profit are dollars. */
function portfolioUnit(alert: Alert): AlertUnit {
  return alert.portfolioMetric === "ROI" || alert.portfolioMetric === "DRAWDOWN"
    ? "PERCENT"
    : "USD";
}

/** The unit the user set the alert in. */
export function alertDefinitionUnit(alert: Alert): AlertUnit {
  switch (alert.kind) {
    case "MARKET_CAP":
      return "USD";
    case "PERCENT":
      return "PERCENT";
    case "PORTFOLIO":
      return portfolioUnit(alert);
    default:
      return "PRICE";
  }
}

/** The unit of the figures in an `AlertProgress` row from the server. */
export function alertProgressUnit(alert: Alert): AlertUnit {
  switch (alert.kind) {
    case "MARKET_CAP":
      return "USD";
    // The engine converts a percentage move into the price it implies, so the
    // progress row is denominated in price.
    case "PERCENT":
      return "PRICE";
    case "PORTFOLIO":
      return portfolioUnit(alert);
    default:
      return "PRICE";
  }
}

/** Formatters all render "—" for null, so an unknown figure stays unknown. */
export function formatAlertValue(unit: AlertUnit, value: number | null | undefined): string {
  if (unit === "PERCENT") return formatPercent(value);
  if (unit === "USD") return formatCompact(value);
  return formatPrice(value);
}

/** The threshold as the user set it. Null when the field was never recorded. */
export function alertThreshold(alert: Alert): number | null {
  switch (alert.kind) {
    case "MARKET_CAP":
      return alert.targetMarketCap ?? null;
    case "PERCENT":
      return alert.targetPercent ?? null;
    case "PORTFOLIO":
      return alert.targetValue ?? null;
    default:
      return alert.targetPrice ?? null;
  }
}

/**
 * The value the alert was armed at, in the definition unit.
 *
 * Null where there is nothing comparable to show: a percentage alert was armed at
 * 0% by definition, and a drawdown is measured from a peak only the server keeps.
 */
export function alertBaseline(alert: Alert, coin?: Coin | null): number | null {
  switch (alert.kind) {
    case "MARKET_CAP": {
      // Same conversion the engine uses: the armed price times circulating supply.
      const supply = coin?.circulatingSupply;
      if (alert.baselinePrice === undefined || !supply) return null;
      return alert.baselinePrice * supply;
    }
    case "PERCENT":
      return null;
    case "PORTFOLIO":
      return alert.baselineValue ?? null;
    default:
      return alert.baselinePrice ?? null;
  }
}

/**
 * What the watched figure reads right now, in the definition unit, from data this
 * client already holds.
 *
 * Null when the client can't know: a portfolio alert needs the summary, a coin
 * outside the loaded feed has no price, and a percentage move needs the price the
 * alert was armed at. Null is the honest answer — `GET /alerts/progress` is the
 * authority on live figures.
 */
export function alertCurrent(
  alert: Alert,
  coin: Coin | null,
  portfolio?: PortfolioSummary | null,
): number | null {
  switch (alert.kind) {
    case "MARKET_CAP":
      return coin?.marketCap ?? null;
    case "PERCENT": {
      // The move since the alert was armed — not the 24h change, which is a
      // different number the user didn't ask about.
      const baseline = alert.baselinePrice;
      if (!coin || baseline === undefined || baseline === 0) return null;
      return ((coin.price - baseline) / baseline) * 100;
    }
    case "PORTFOLIO": {
      if (!portfolio) return null;
      switch (alert.portfolioMetric) {
        case "PROFIT":
          return portfolio.profit;
        case "ROI":
          return portfolio.roi;
        case "DRAWDOWN":
          return null;
        default:
          return portfolio.value;
      }
    }
    default:
      return coin?.price ?? null;
  }
}

/** Heading for an alert: a coin symbol, "Portfolio", or the coin id we have. */
export function alertSubject(alert: Alert, coin: Coin | null): string {
  if (coin) return coin.symbol;
  if (alert.kind === "PORTFOLIO") return "Portfolio";
  return alert.coinId ?? "Alert";
}

/** The threshold formatted in the user's own terms: "$250", "-10%". */
export function alertThresholdLabel(alert: Alert): string {
  return formatAlertValue(alertDefinitionUnit(alert), alertThreshold(alert));
}

/** The whole condition in the user's own terms: "≥ $250", "≤ -10%". */
export function alertConditionLabel(alert: Alert): string {
  const arrow = alert.condition === "ABOVE" ? "≥" : "≤";
  return `${arrow} ${alertThresholdLabel(alert)}`;
}
