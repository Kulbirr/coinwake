import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { HoldingModel, toHolding } from "../models/Holding.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";
import { getCryptoProvider } from "../services/crypto/index.js";
import { buildPortfolio, getPeak } from "../services/portfolio.js";

const router: Router = Router();

router.use(requireAuth);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const createSchema = z.object({
  coinId: z.string().trim().min(1),
  quantity: z.number().positive("Enter an amount above zero."),
  averageBuyPrice: z.number().min(0).optional(),
  /** Alternative to averageBuyPrice — spec 6 lets users enter either. */
  totalInvested: z.number().min(0).optional(),
  purchaseDate: z.string().regex(ISO_DATE, "Use the format YYYY-MM-DD.").optional(),
  exchange: z.string().trim().max(80).optional(),
  wallet: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
});

const updateSchema = createSchema.partial().omit({ coinId: true });

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Spec 6/7 — a user may give an average buy price, a total invested, or neither.
 * "Neither" is recorded as UNAVAILABLE rather than zero, so the UI can say
 * "Cost basis unavailable" instead of showing a fabricated ROI.
 */
function resolveCostBasis(input: {
  quantity: number;
  averageBuyPrice?: number;
  totalInvested?: number;
}): { averageBuyPrice: number; costBasisSource: "USER" | "UNAVAILABLE" } {
  if (input.averageBuyPrice !== undefined) {
    return { averageBuyPrice: input.averageBuyPrice, costBasisSource: "USER" };
  }
  if (input.totalInvested !== undefined && input.quantity > 0) {
    return { averageBuyPrice: input.totalInvested / input.quantity, costBasisSource: "USER" };
  }
  return { averageBuyPrice: 0, costBasisSource: "UNAVAILABLE" };
}

router.get(
  "/",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const summary = await buildPortfolio(userId);

    res.json({
      portfolio: summary,
      peakValue: getPeak(userId) ?? summary.value,
      // Spec 43 — every derived number on this screen is an estimate.
      disclaimer:
        "CryptoWake calculations are estimates based on the data and assumptions provided. They are not financial advice.",
    });
  }),
);

router.get(
  "/holdings",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const docs = await HoldingModel.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });
    res.json({ holdings: docs.map(toHolding) });
  }),
);

router.post(
  "/holdings",
  validate(createSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const input = req.body as z.infer<typeof createSchema>;

    const coin = await getCryptoProvider().getCoin(input.coinId);
    if (!coin) throw ApiError.coinNotFound(input.coinId);

    const { averageBuyPrice, costBasisSource } = resolveCostBasis(input);

    const doc = await HoldingModel.create({
      userId: new Types.ObjectId(userId),
      coinId: input.coinId,
      quantity: input.quantity,
      averageBuyPrice,
      costBasisSource,
      source: "MANUAL",
      purchaseDate: input.purchaseDate ?? today(),
      ...(input.exchange ? { exchange: input.exchange } : {}),
      ...(input.wallet ? { wallet: input.wallet } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    });

    res.status(201).json({ holding: toHolding(doc) });
  }),
);

router.patch(
  "/holdings/:id",
  validate(updateSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const patch = req.body as z.infer<typeof updateSchema>;

    const doc = await HoldingModel.findOne({
      _id: String(req.params["id"]),
      userId: new Types.ObjectId(userId),
    });
    if (!doc) throw ApiError.notFound("We couldn't find that holding.");

    if (doc.source === "WALLET" && patch.quantity !== undefined) {
      throw ApiError.badRequest("Wallet balances are read from the chain and can't be edited.", {
        hint: "You can still set a cost basis for this position.",
      });
    }

    if (patch.quantity !== undefined) doc.quantity = patch.quantity;
    if (patch.purchaseDate !== undefined) doc.purchaseDate = patch.purchaseDate;
    if (patch.exchange !== undefined) doc.exchange = patch.exchange;
    if (patch.wallet !== undefined) doc.wallet = patch.wallet;
    if (patch.notes !== undefined) doc.notes = patch.notes;

    // Supplying a cost basis upgrades a wallet-derived row from
    // "unavailable" to a user-stated figure (spec 7).
    if (patch.averageBuyPrice !== undefined || patch.totalInvested !== undefined) {
      const resolved = resolveCostBasis({
        quantity: patch.quantity ?? doc.quantity,
        ...(patch.averageBuyPrice === undefined ? {} : { averageBuyPrice: patch.averageBuyPrice }),
        ...(patch.totalInvested === undefined ? {} : { totalInvested: patch.totalInvested }),
      });
      doc.averageBuyPrice = resolved.averageBuyPrice;
      doc.costBasisSource = resolved.costBasisSource;
    }

    await doc.save();
    res.json({ holding: toHolding(doc) });
  }),
);

router.delete(
  "/holdings/:id",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const result = await HoldingModel.deleteOne({
      _id: String(req.params["id"]),
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) throw ApiError.notFound("We couldn't find that holding.");
    res.status(204).end();
  }),
);

/** Spec 20 — allocation breakdown for the pie/bar chart. */
router.get(
  "/allocation",
  handler(async (req, res) => {
    const summary = await buildPortfolio(currentUserId(req));

    const allocation = summary.rows
      .filter((row) => row.value > 0)
      .map((row) => ({
        coinId: row.holding.coinId,
        symbol: row.coin?.symbol ?? row.holding.coinId.toUpperCase(),
        color: row.coin?.color ?? "#64748b",
        value: row.value,
        percent: row.allocation,
      }))
      .sort((a, b) => b.value - a.value);

    res.json({
      allocation,
      total: summary.value,
      bestPerformer: summary.bestPerformer,
      worstPerformer: summary.worstPerformer,
    });
  }),
);

export default router;
