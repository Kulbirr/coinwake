import { Router } from "express";

import mongoose from "mongoose";

import { env, pushEnabled } from "../config/env.js";
import { getCache } from "../db/redis.js";
import { hub } from "../services/realtime/hub.js";
import alerts from "./alerts.js";
import auth from "./auth.js";
import calculator from "./calculator.js";
import coins from "./coins.js";
import dex from "./dex.js";
import goals from "./goals.js";
import notifications from "./notifications.js";
import portfolio from "./portfolio.js";
import push from "./push.js";
import settings from "./settings.js";
import wallets from "./wallets.js";
import watchlist from "./watchlist.js";

const router: Router = Router();

router.use("/auth", auth);
router.use("/coins", coins);
router.use("/dex", dex);
router.use("/portfolio", portfolio);
router.use("/alerts", alerts);
router.use("/watchlist", watchlist);
router.use("/notifications", notifications);
router.use("/goals", goals);
router.use("/wallets", wallets);
router.use("/calculator", calculator);
router.use("/push", push);
router.use("/settings", settings);

/** Tells the client what this deployment can actually do, so the UI can hide
 *  what isn't configured instead of failing when it's used (spec 35). */
router.get("/config", (_req, res) => {
  res.json({
    cryptoProvider: env.CRYPTO_PROVIDER,
    walletProvider: env.WALLET_PROVIDER,
    pushEnabled,
    googleAuthEnabled: Boolean(env.GOOGLE_CLIENT_ID),
    priceIntervalMs: env.PRICE_POLL_INTERVAL_MS,
    disclaimer:
      "CryptoWake calculations are estimates based on the data and assumptions provided. They are not financial advice.",
  });
});

router.get("/healthz", (_req, res) => {
  // 1 === connected. Report degraded rather than failing: reads still work from
  // cache, so a load balancer shouldn't pull the instance for a blip.
  const mongoUp = mongoose.connection.readyState === 1;
  res.status(mongoUp ? 200 : 503).json({
    status: mongoUp ? "ok" : "degraded",
    mongo: mongoose.connection.readyState,
    cache: getCache().kind,
    // Open WebSockets — a fan-out count that only ever grows points at a leak.
    sockets: hub.connectionCount,
    uptime: Math.round(process.uptime()),
  });
});

export default router;
