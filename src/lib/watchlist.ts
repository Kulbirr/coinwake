import { alertDefinitionUnit, alertThreshold } from "./alert-display";
import type { Alert, Coin } from "./api";

export interface WatchlistRow {
  coin: Coin;
  /** The nearest active price target the user has set on this coin, if any. */
  target: Alert | undefined;
  /** Percentage move still needed to reach that target. */
  distance: number | undefined;
  activeAlerts: number;
}

/**
 * Watchlist derivation (spec 15). Pure so both web and React Native clients can
 * render the same rows from the same feed.
 *
 * Coins are resolved through `getCoin`, not a market-list array: a watched coin
 * is often ranked below the loaded top list, so looking it up in that list alone
 * would silently drop it from the table. `getCoin` reads the store's full index —
 * market list, watched coins and live socket prices — so every starred coin
 * renders (spec 35).
 *
 * "Your target" only considers price alerts: a market-cap or percentage target
 * isn't a price the current price can be a percentage away from, so mixing them
 * into the same comparison would rank rows by numbers that mean different things.
 */
export function buildWatchlistRows(
  watchlist: string[],
  getCoin: (id: string) => Coin | undefined,
  alerts: Alert[],
): WatchlistRow[] {
  return watchlist
    .map((id) => getCoin(id))
    .filter((coin): coin is Coin => coin !== undefined)
    .map((coin) => {
      const active = alerts.filter((a) => a.coinId === coin.id && a.status === "ACTIVE");
      const priced = active.filter(
        (a) => alertDefinitionUnit(a) === "PRICE" && alertThreshold(a) !== null,
      );

      // The alert we expect to fire first: the smallest move away.
      const target = priced.reduce<Alert | undefined>((closest, alert) => {
        if (!closest) return alert;
        return Math.abs(gapPercent(coin.price, alert)) < Math.abs(gapPercent(coin.price, closest))
          ? alert
          : closest;
      }, undefined);

      return {
        coin,
        target,
        distance: target ? gapPercent(coin.price, target) : undefined,
        activeAlerts: active.length,
      };
    });
}

/** How far the current price is from an alert's target, as a percentage. */
function gapPercent(current: number, alert: Alert): number {
  const target = alertThreshold(alert);
  if (target === null || !current) return 0;
  return ((target - current) / current) * 100;
}
