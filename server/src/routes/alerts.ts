import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { AlertEventModel, toAlertHistoryEntry } from "../models/AlertEvent.js";
import { AlertModel, toAlert } from "../models/Alert.js";
import { HoldingModel } from "../models/Holding.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";
import {
  computeProgress,
  drawdownPercent,
  type PortfolioContext,
} from "../services/alertEngine.js";
import { getCryptoProvider } from "../services/crypto/index.js";
import { getPeak, recordPeak, summarise } from "../services/portfolio.js";

const router: Router = Router();

router.use(requireAuth);

const notifySchema = z
  .object({
    browser: z.boolean().default(true),
    alarm: z.boolean().default(true),
    push: z.boolean().default(true),
    email: z.boolean().default(false),
  })
  .default({ browser: true, alarm: true, push: true, email: false });

const baseSchema = z.object({
  name: z.string().trim().max(120).optional(),
  condition: z.enum(["ABOVE", "BELOW"]),
  repeat: z.enum(["ONCE", "RECURRING"]).default("ONCE"),
  cooldownMinutes: z.number().int().min(0).max(1440).default(5),
  notify: notifySchema,
});

const createSchema = z.discriminatedUnion("kind", [
  baseSchema.extend({
    kind: z.literal("PRICE"),
    coinId: z.string().trim().min(1),
    targetPrice: z.number().positive("Enter a target above zero."),
  }),
  baseSchema.extend({
    kind: z.literal("MARKET_CAP"),
    coinId: z.string().trim().min(1),
    targetMarketCap: z.number().positive("Enter a market cap above zero."),
  }),
  baseSchema.extend({
    kind: z.literal("PERCENT"),
    coinId: z.string().trim().min(1),
    targetPercent: z
      .number()
      .refine((n) => n !== 0, "Choose a movement other than 0%.")
      .refine((n) => Math.abs(n) <= 1000, "That's beyond what we can track."),
  }),
  baseSchema.extend({
    kind: z.literal("PORTFOLIO"),
    portfolioMetric: z.enum(["VALUE", "PROFIT", "ROI", "DRAWDOWN"]),
    targetValue: z.number(),
  }),
]);

const updateSchema = z.object({
  name: z.string().trim().max(120).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  targetPrice: z.number().positive().optional(),
  targetMarketCap: z.number().positive().optional(),
  targetPercent: z.number().optional(),
  targetValue: z.number().optional(),
  repeat: z.enum(["ONCE", "RECURRING"]).optional(),
  cooldownMinutes: z.number().int().min(0).max(1440).optional(),
  notify: notifySchema.optional(),
});

const historyQuery = z.object({
  window: z.enum(["today", "7d", "30d", "all"]).default("all"),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

/** Portfolio context is only loaded when a PORTFOLIO alert actually needs it. */
async function portfolioContext(userId: string): Promise<PortfolioContext | undefined> {
  const holdings = await HoldingModel.find({ userId: new Types.ObjectId(userId) });
  if (holdings.length === 0) return undefined;
  const summary = await summarise(holdings);
  // Reading progress shouldn't move the peak the engine measures drawdown from,
  // so this only records it if nothing has yet — otherwise it reads what's there.
  const peak = getPeak(userId) ?? recordPeak(userId, summary.value);
  return {
    value: summary.value,
    profit: summary.profit,
    roi: summary.roi,
    drawdown: drawdownPercent(peak, summary.value),
  };
}

router.get(
  "/",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const docs = await AlertModel.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });
    res.json({ alerts: docs.map(toAlert) });
  }),
);

router.post(
  "/",
  validate(createSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const input = req.body as z.infer<typeof createSchema>;

    let baselinePrice: number | undefined;

    if (input.kind !== "PORTFOLIO") {
      const coin = await getCryptoProvider().getCoin(input.coinId);
      if (!coin) throw ApiError.coinNotFound(input.coinId);

      // Minimum liquidity gate for DEX tokens (sol: IDs) to avoid alerting on
      // wash-traded / illiquid pairs. $1k USD is a sensible floor for pump.fun.
      const MIN_LIQUIDITY_USD = 1_000;
      if (input.coinId.startsWith("sol:") && coin.liquidity !== undefined && coin.liquidity < MIN_LIQUIDITY_USD) {
        throw ApiError.invalidTarget(
          `Liquidity ($${coin.liquidity.toLocaleString()}) is below the ${MIN_LIQUIDITY_USD.toLocaleString()} USD minimum for alerts.`,
        );
      }

      // Baseline is captured at creation: progress and percentage alerts are both
      // measured from where the user was standing when they set it (spec 24).
      baselinePrice = coin.price;

      if (input.kind === "PRICE") {
        const wrongWay =
          (input.condition === "ABOVE" && input.targetPrice <= coin.price) ||
          (input.condition === "BELOW" && input.targetPrice >= coin.price);
        if (wrongWay) {
          throw ApiError.invalidTarget(
            input.condition === "ABOVE"
              ? "That target is already below the current price — it would fire immediately."
              : "That target is already above the current price — it would fire immediately.",
          );
        }
      }

      if (input.kind === "MARKET_CAP" && !coin.circulatingSupply && coin.marketCap === 0) {
        throw ApiError.missingSupply(input.coinId);
      }
    }

    const doc = await AlertModel.create({
      userId: new Types.ObjectId(userId),
      ...input,
      ...(baselinePrice === undefined ? {} : { baselinePrice }),
      status: "ACTIVE",
    });

    res.status(201).json({ alert: toAlert(doc) });
  }),
);

router.get(
  "/progress",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const docs = await AlertModel.find({
      userId: new Types.ObjectId(userId),
      status: { $ne: "DISABLED" },
    });

    if (docs.length === 0) {
      res.json({ progress: [] });
      return;
    }

    const coinIds = [...new Set(docs.map((d) => d.coinId).filter((id): id is string => Boolean(id)))];
    const provider = getCryptoProvider();
    const coins = new Map(
      (await Promise.all(coinIds.map((id) => provider.getCoin(id).catch(() => undefined))))
        .filter((c) => c !== undefined)
        .map((c) => [c.id, c]),
    );

    const needsPortfolio = docs.some((d) => d.kind === "PORTFOLIO");
    const portfolio = needsPortfolio ? await portfolioContext(userId) : undefined;

    const progress = docs
      .map((doc) =>
        computeProgress(toAlert(doc), {
          coin: doc.coinId ? (coins.get(doc.coinId) ?? null) : null,
          ...(portfolio === undefined ? {} : { portfolio }),
        }),
      )
      .filter((p) => p !== null);

    res.json({ progress });
  }),
);

router.get(
  "/history",
  validate(historyQuery, "query"),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const { window, limit } = req.query as unknown as z.infer<typeof historyQuery>;

    const since = windowStart(window);
    const docs = await AlertEventModel.find({
      userId: new Types.ObjectId(userId),
      ...(since ? { triggeredAt: { $gte: since } } : {}),
    })
      .sort({ triggeredAt: -1 })
      .limit(limit);

    res.json({ window, history: docs.map(toAlertHistoryEntry) });
  }),
);

router.patch(
  "/:id",
  validate(updateSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const patch = req.body as z.infer<typeof updateSchema>;

    // Scoped by userId as well as id — never trust the id alone (spec 36).
    const doc = await AlertModel.findOne({
      _id: String(req.params["id"]),
      userId: new Types.ObjectId(userId),
    });
    if (!doc) throw ApiError.notFound("We couldn't find that alert.");

    Object.assign(doc, patch);

    // Re-arming clears the previous trigger's cooldown, and re-baselines so
    // "+10%" means +10% from now rather than from whenever it was created.
    if (patch.status === "ACTIVE") {
      doc.cooldownUntil = undefined;
      if (doc.coinId) {
        const coin = await getCryptoProvider().getCoin(doc.coinId);
        if (coin) doc.baselinePrice = coin.price;
      }
    }

    await doc.save();
    res.json({ alert: toAlert(doc) });
  }),
);

router.delete(
  "/:id",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const result = await AlertModel.deleteOne({
      _id: String(req.params["id"]),
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) throw ApiError.notFound("We couldn't find that alert.");
    res.status(204).end();
  }),
);

function windowStart(window: "today" | "7d" | "30d" | "all"): Date | null {
  const now = new Date();
  switch (window) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
    default:
      return null;
  }
}

export default router;
