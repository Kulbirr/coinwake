/**
 * Spec 42 — the demo dataset: the seed coins on a watchlist, a small portfolio,
 * one alert of each kind, and a little history.
 *
 * Safe to re-run: only the demo user's own rows are replaced, nothing else is
 * touched. Callers must not run this in production.
 */
import bcrypt from "bcryptjs";

import { createLogger } from "../config/logger.js";
import { planGoal } from "../core/calc.js";
import { AlertModel } from "../models/Alert.js";
import { AlertEventModel } from "../models/AlertEvent.js";
import { GoalModel } from "../models/Goal.js";
import { HoldingModel } from "../models/Holding.js";
import { NotificationModel } from "../models/Notification.js";
import { User } from "../models/User.js";
import { WatchlistModel } from "../models/Watchlist.js";
import { SEED_COINS } from "../services/crypto/seedCoins.js";

const log = createLogger("seed");

export const DEMO_EMAIL = "demo@coinwake.app";
export const DEMO_PASSWORD = "coinwake-demo";

interface SeedHolding {
  coinId: string;
  quantity: number;
  averageBuyPrice: number;
  purchaseDate: string;
  exchange?: string;
  /** Set on one row on purpose, to exercise "Cost basis unavailable". */
  costBasisSource?: "USER" | "UNAVAILABLE";
}

const HOLDINGS: SeedHolding[] = [
  {
    coinId: "bitcoin",
    quantity: 0.35,
    averageBuyPrice: 42_000,
    purchaseDate: "2024-02-14",
    exchange: "Coinbase",
  },
  {
    coinId: "ethereum",
    quantity: 4.2,
    averageBuyPrice: 2_150,
    purchaseDate: "2024-03-08",
    exchange: "Kraken",
  },
  {
    coinId: "solana",
    quantity: 62,
    averageBuyPrice: 98.4,
    purchaseDate: "2024-05-21",
    exchange: "Binance",
  },
  {
    coinId: "bonk",
    quantity: 185_000_000,
    // No reliable basis for this one — the portfolio should say so rather than
    // invent a number (spec 7).
    averageBuyPrice: 0,
    purchaseDate: "2024-06-02",
    costBasisSource: "UNAVAILABLE",
  },
];

function priceOf(coinId: string): number {
  return SEED_COINS.find((c) => c.id === coinId)?.price ?? 0;
}

function supplyOf(coinId: string): number | undefined {
  return SEED_COINS.find((c) => c.id === coinId)?.circulatingSupply;
}

export interface SeedResult {
  email: string;
  password: string;
  coins: number;
  holdings: number;
  alerts: number;
}

export async function seedDemoData(): Promise<SeedResult> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.findOneAndUpdate(
    { email: DEMO_EMAIL },
    { $set: { name: "Demo", passwordHash }, $setOnInsert: { tokenVersion: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (!user) throw new Error("Could not create the demo user.");

  const userId = user._id;

  // Wipe only this user's rows so re-running is idempotent.
  await Promise.all([
    HoldingModel.deleteMany({ userId }),
    AlertModel.deleteMany({ userId }),
    AlertEventModel.deleteMany({ userId }),
    WatchlistModel.deleteMany({ userId }),
    NotificationModel.deleteMany({ userId }),
    GoalModel.deleteMany({ userId }),
  ]);

  await WatchlistModel.insertMany(SEED_COINS.map((coin) => ({ userId, coinId: coin.id })));

  await HoldingModel.insertMany(
    HOLDINGS.map((h) => ({
      userId,
      coinId: h.coinId,
      quantity: h.quantity,
      averageBuyPrice: h.averageBuyPrice,
      purchaseDate: h.purchaseDate,
      ...(h.exchange ? { exchange: h.exchange } : {}),
      source: "MANUAL" as const,
      costBasisSource: h.costBasisSource ?? ("USER" as const),
    })),
  );

  const btc = priceOf("bitcoin");
  const sol = priceOf("solana");
  const pepe = priceOf("pepe");

  // One of each alert kind (spec 9/10/19) so every code path has a live example.
  const alerts = await AlertModel.insertMany([
    {
      userId,
      kind: "PRICE",
      coinId: "bitcoin",
      name: "BTC six figures",
      condition: "ABOVE",
      targetPrice: 100_000,
      repeat: "ONCE",
      baselinePrice: btc,
      notify: { browser: true, alarm: true, push: true, email: false },
    },
    {
      userId,
      kind: "PRICE",
      coinId: "solana",
      name: "SOL dip buy",
      condition: "BELOW",
      targetPrice: Math.round(sol * 0.8),
      repeat: "ONCE",
      baselinePrice: sol,
      notify: { browser: true, alarm: false, push: true, email: false },
    },
    {
      userId,
      kind: "PERCENT",
      coinId: "solana",
      name: "SOL moves +10%",
      condition: "ABOVE",
      targetPercent: 10,
      repeat: "RECURRING",
      cooldownMinutes: 30,
      baselinePrice: sol,
      notify: { browser: true, alarm: true, push: true, email: false },
    },
    {
      userId,
      kind: "MARKET_CAP",
      coinId: "pepe",
      name: "PEPE hits $10B",
      condition: "ABOVE",
      targetMarketCap: 10_000_000_000,
      repeat: "ONCE",
      baselinePrice: pepe,
      notify: { browser: true, alarm: true, push: true, email: false },
    },
    {
      userId,
      kind: "PORTFOLIO",
      // Above the seeded portfolio's ~$50k, so it sits pending instead of
      // firing on the very first tick.
      name: "Portfolio at $75,000",
      condition: "ABOVE",
      portfolioMetric: "VALUE",
      targetValue: 75_000,
      repeat: "ONCE",
      notify: { browser: true, alarm: false, push: true, email: false },
    },
    {
      userId,
      // Drawdown is a positive percentage below the peak, so "drops 20%" is
      // DRAWDOWN ABOVE 20 (spec 19).
      kind: "PORTFOLIO",
      name: "Portfolio drops 20%",
      condition: "ABOVE",
      portfolioMetric: "DRAWDOWN",
      targetValue: 20,
      repeat: "RECURRING",
      cooldownMinutes: 120,
      notify: { browser: true, alarm: true, push: true, email: false },
    },
  ]);

  // A little history so the alert log and notification centre aren't empty.
  const first = alerts[0];
  if (first) {
    await AlertEventModel.create({
      userId,
      alertId: first._id,
      coinId: "bitcoin",
      alertName: "BTC crossed $65,000",
      kind: "PRICE",
      condition: "ABOVE",
      target: 65_000,
      actual: btc,
      triggeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    });
    await NotificationModel.create({
      userId,
      kind: "PRICE_TARGET",
      title: "Bitcoin crossed $65,000",
      body: `BTC is trading at $${btc.toLocaleString("en-US")}.`,
      coinId: "bitcoin",
      alertId: first._id,
      read: false,
    });
  }

  // Spec 17 — one worked goal, stored with the plan it was created from.
  const solHolding = HOLDINGS.find((h) => h.coinId === "solana");
  if (solHolding) {
    const goalTarget = 250_000;
    const solSupply = supplyOf("solana");
    const plan = planGoal({
      targetValue: goalTarget,
      quantity: solHolding.quantity,
      currentPrice: sol,
      ...(solSupply === undefined ? {} : { circulatingSupply: solSupply }),
    });
    await GoalModel.create({
      userId,
      coinId: "solana",
      targetValue: goalTarget,
      label: "SOL to a quarter million",
      requiredPrice: plan.requiredPrice,
      ...(plan.requiredMarketCap === null ? {} : { requiredMarketCap: plan.requiredMarketCap }),
      requiredMultiple: plan.requiredMultiple,
    });
  }

  log.info(
    `Seeded ${SEED_COINS.length} watchlist coins, ${HOLDINGS.length} holdings, ${alerts.length} alerts.`,
  );

  return {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    coins: SEED_COINS.length,
    holdings: HOLDINGS.length,
    alerts: alerts.length,
  };
}

/** True when the database has no users at all — i.e. a brand new install. */
export async function isDatabaseEmpty(): Promise<boolean> {
  return (await User.estimatedDocumentCount()) === 0;
}
