import { env } from "../config/env.js";
import { createLogger } from "../config/logger.js";
import { ProviderRateLimitError } from "../core/http.js";
import { AlertModel } from "../models/Alert.js";
import { WatchlistModel } from "../models/Watchlist.js";
import { evaluateCoinAlerts, evaluatePortfolioAlerts } from "./alertEngine.js";
import { getCryptoProvider, getMockProvider } from "./crypto/index.js";
import { SEED_COIN_IDS } from "./crypto/seedCoins.js";
import { buildPortfolio } from "./portfolio.js";
import { hub } from "./realtime/hub.js";

const log = createLogger("prices");

/** Hard cap on coins polled per tick, so one user can't blow the rate limit. */
const MAX_TRACKED_COINS = 60;

let timer: NodeJS.Timeout | null = null;
let running = false;
/** Set when the provider rate limits us; we skip ticks until it passes. */
let backoffUntil = 0;

/**
 * Everything the server needs to watch: every coin under an active alert, every
 * watchlisted coin, plus the seed set so a cold install still shows a market.
 */
async function trackedCoinIds(): Promise<string[]> {
  const [alertCoins, watchCoins] = await Promise.all([
    AlertModel.distinct("coinId", { status: "ACTIVE", coinId: { $ne: null } }),
    WatchlistModel.distinct("coinId"),
  ]);

  const ids = new Set<string>(SEED_COIN_IDS);
  for (const id of [...alertCoins, ...watchCoins]) {
    if (typeof id === "string" && id) ids.add(id);
  }

  return [...ids].slice(0, MAX_TRACKED_COINS);
}

/**
 * Sends each connected user their own portfolio at the new prices (spec 20/31),
 * so a browser showing a live total never re-fetches it itself.
 *
 * Only users with an open socket are computed — that's what the hub's identity
 * index is for. A user with no holdings is skipped rather than sent zeroes, and
 * one failing portfolio doesn't cost the others theirs. Peak values are left
 * alone here: drawdown is the alert engine's measurement, and a read shouldn't
 * move it.
 */
async function pushPortfolios(): Promise<void> {
  const userIds = hub.connectedUserIds();
  if (userIds.length === 0) return;

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const summary = await buildPortfolio(userId);
        if (summary.rows.length === 0) return;
        hub.sendToUser(userId, { type: "portfolio", payload: summary });
      } catch (err) {
        log.debug(`Skipped a portfolio push for ${userId}: ${(err as Error).message}`);
      }
    }),
  );
}

/**
 * One poll cycle: refresh prices once for the whole server, push them to every
 * subscriber, then run the alert engine (spec 30/31). No browser ever polls the
 * upstream vendor itself.
 */
export async function tick(): Promise<void> {
  if (running) {
    log.debug("Skipping tick — the previous one is still running.");
    return;
  }
  if (Date.now() < backoffUntil) return;

  running = true;
  try {
    // The mock provider advances its simulated market first, so prices actually
    // move in development and alerts have something to cross.
    getMockProvider()?.tick();

    const provider = getCryptoProvider();
    const ids = await trackedCoinIds();
    if (ids.length === 0) return;

    // One upstream request for the whole tracked set. Coin records carry the
    // price, so there is no second fetch per coin and no cache to invalidate —
    // both caches are primed from this single payload (spec 31/33).
    const coins = await provider.refreshCoins(ids);
    if (coins.length === 0) return;

    hub.broadcastPrices(coins);

    const fired = await evaluateCoinAlerts(coins);
    const portfolioFired = await evaluatePortfolioAlerts();

    // After the alerts, so a triggered alarm isn't queued behind portfolio maths.
    await pushPortfolios();

    if (fired + portfolioFired > 0) {
      log.info(`Tick fired ${fired} coin alert(s) and ${portfolioFired} portfolio alert(s).`);
    }
  } catch (err) {
    if (err instanceof ProviderRateLimitError) {
      backoffUntil = Date.now() + err.retryAfterSeconds * 1000;
      log.warn(`Rate limited — pausing price polling for ${err.retryAfterSeconds}s.`);
    } else {
      log.error(`Price tick failed: ${(err as Error).message}`);
    }
  } finally {
    running = false;
  }
}

export function startPriceService(): void {
  if (timer) return;

  log.info(`Polling prices every ${env.PRICE_POLL_INTERVAL_MS}ms.`);
  // Kick once at boot so the cache is warm before the first request.
  void tick();
  timer = setInterval(() => void tick(), env.PRICE_POLL_INTERVAL_MS);
}

export function stopPriceService(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}
