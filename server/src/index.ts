import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env, isProd, pushEnabled } from "./config/env.js";
import { createLogger } from "./config/logger.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";
import { closeCache, initCache } from "./db/redis.js";
import { isDatabaseEmpty, seedDemoData } from "./db/seed.js";
import { startPriceService, stopPriceService } from "./services/priceService.js";
import { attachWebSocketServer } from "./services/websocket.js";

const log = createLogger("boot");

/** How long to let in-flight requests finish before forcing the process down. */
const SHUTDOWN_GRACE_MS = 10_000;

/**
 * The in-memory MongoDB dies with the process, so `npm run seed` can't reach it.
 * Seed it here instead, once, so a fresh clone has a demo account to sign into.
 */
async function seedEphemeralDatabase(): Promise<void> {
  if (isProd || env.MONGODB_URI) return;
  if (!(await isDatabaseEmpty())) return;

  const { email, password } = await seedDemoData();
  log.info(`Demo login: ${email} / ${password}`);
}

async function main(): Promise<void> {
  await connectMongo();
  await seedEphemeralDatabase();
  const cache = initCache();

  const app = createApp();
  const server = createServer(app);
  const wss = attachWebSocketServer(server);

  // The alert engine lives here, not in the browser: targets are monitored
  // whether or not anyone has the app open (spec 30).
  startPriceService();

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(env.PORT, () => resolve());
  });

  log.info(
    `CoinWake API listening on http://localhost:${env.PORT} ` +
      `(${env.NODE_ENV}, crypto=${env.CRYPTO_PROVIDER}, wallet=${env.WALLET_PROVIDER}, ` +
      `cache=${cache.kind}, push=${pushEnabled ? "on" : "off"})`,
  );

  if (!isProd && env.CRYPTO_PROVIDER === "mock") {
    log.warn("Serving simulated market data. Set CRYPTO_PROVIDER=coingecko for real prices.");
  }

  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info(`Received ${signal} — shutting down.`);

    // Hard deadline: a hung socket must not keep the container alive forever.
    const timeout = setTimeout(() => {
      log.warn("Shutdown timed out; exiting anyway.");
      process.exit(1);
    }, SHUTDOWN_GRACE_MS);
    timeout.unref();

    stopPriceService();

    for (const socket of wss.clients) socket.close(1001, "Server shutting down");
    await new Promise<void>((resolve) => wss.close(() => resolve()));
    await new Promise<void>((resolve) => server.close(() => resolve()));

    // Drain dependencies last so anything still finishing can reach them.
    await Promise.allSettled([disconnectMongo(), closeCache()]);

    clearTimeout(timeout);
    log.info("Goodbye.");
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  // A rejection that reaches here is a bug, but killing the alert engine over it
  // would be worse than logging it and staying up.
  process.on("unhandledRejection", (reason) => {
    log.error("Unhandled promise rejection", reason);
  });
  process.on("uncaughtException", (err) => {
    log.error("Uncaught exception — exiting", err);
    process.exit(1);
  });
}

main().catch((err: unknown) => {
  log.error("Failed to start", err);
  process.exit(1);
});
