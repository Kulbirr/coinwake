import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { planGoal } from "../core/calc.js";
import { AlertModel, toAlert } from "../models/Alert.js";
import { GoalModel, toGoal } from "../models/Goal.js";
import { HoldingModel } from "../models/Holding.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";
import { getCryptoProvider } from "../services/crypto/index.js";

const router: Router = Router();

router.use(requireAuth);

const createSchema = z.object({
  coinId: z.string().trim().min(1),
  targetValue: z.number().positive("Enter a target value above zero."),
  label: z.string().trim().max(120).optional(),
  /** Falls back to the user's actual holding when omitted. */
  quantity: z.number().positive().optional(),
  /** Spec 17 — optionally arm a price alert at the required price. */
  createAlert: z.boolean().default(false),
});

/** Sums the user's quantity for a coin across manual and wallet rows. */
async function heldQuantity(userId: string, coinId: string): Promise<number> {
  const holdings = await HoldingModel.find({ userId: new Types.ObjectId(userId), coinId });
  return holdings.reduce((sum, h) => sum + h.quantity, 0);
}

router.get(
  "/",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const docs = await GoalModel.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });

    // The stored plan is a snapshot; recompute against live prices so distance
    // and multiple are current every time the page loads.
    const provider = getCryptoProvider();
    const goals = await Promise.all(
      docs.map(async (doc) => {
        const [coin, quantity] = await Promise.all([
          provider.getCoin(doc.coinId).catch(() => undefined),
          heldQuantity(userId, doc.coinId),
        ]);

        const base = toGoal(doc);
        if (!coin || quantity <= 0) return { ...base, live: null };

        const plan = planGoal({
          targetValue: doc.targetValue,
          quantity,
          currentPrice: coin.price,
          ...(coin.circulatingSupply === undefined
            ? {}
            : { circulatingSupply: coin.circulatingSupply }),
        });

        return { ...base, live: { ...plan, quantity, currentPrice: coin.price } };
      }),
    );

    res.json({ goals });
  }),
);

router.post(
  "/",
  validate(createSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const input = req.body as z.infer<typeof createSchema>;

    const coin = await getCryptoProvider().getCoin(input.coinId);
    if (!coin) throw ApiError.coinNotFound(input.coinId);

    const quantity = input.quantity ?? (await heldQuantity(userId, input.coinId));
    if (quantity <= 0) {
      throw ApiError.insufficientData(
        "Add a holding for this coin first, or enter how much you hold.",
        "A goal needs a quantity to work backwards from.",
      );
    }

    const plan = planGoal({
      targetValue: input.targetValue,
      quantity,
      currentPrice: coin.price,
      ...(coin.circulatingSupply === undefined
        ? {}
        : { circulatingSupply: coin.circulatingSupply }),
    });

    let alertId: Types.ObjectId | undefined;
    if (input.createAlert) {
      const alert = await AlertModel.create({
        userId: new Types.ObjectId(userId),
        kind: "PRICE",
        coinId: input.coinId,
        name: input.label ?? `Goal: ${coin.symbol} at ${plan.requiredPrice.toPrecision(4)}`,
        // A goal below the current price is already met, so watch for a fall back.
        condition: plan.requiredPrice >= coin.price ? "ABOVE" : "BELOW",
        targetPrice: plan.requiredPrice,
        baselinePrice: coin.price,
        repeat: "ONCE",
        status: "ACTIVE",
      });
      alertId = alert._id;
    }

    const doc = await GoalModel.create({
      userId: new Types.ObjectId(userId),
      coinId: input.coinId,
      targetValue: input.targetValue,
      ...(input.label ? { label: input.label } : {}),
      requiredPrice: plan.requiredPrice,
      ...(plan.requiredMarketCap === null ? {} : { requiredMarketCap: plan.requiredMarketCap }),
      requiredMultiple: plan.requiredMultiple,
      ...(alertId ? { alertId } : {}),
    });

    res.status(201).json({
      goal: toGoal(doc),
      plan: { ...plan, quantity, currentPrice: coin.price, symbol: coin.symbol },
      ...(plan.requiredMarketCap === null
        ? { supplyNote: "Estimated — circulating supply unavailable." }
        : {}),
      disclaimer:
        "CryptoWake calculations are estimates based on the data and assumptions provided. They are not financial advice.",
    });
  }),
);

/** Arms a price alert for an existing goal. */
router.post(
  "/:id/alert",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const goal = await GoalModel.findOne({
      _id: String(req.params["id"]),
      userId: new Types.ObjectId(userId),
    });
    if (!goal) throw ApiError.notFound("We couldn't find that goal.");

    if (goal.alertId) {
      const existing = await AlertModel.findById(goal.alertId);
      if (existing) {
        res.json({ alert: toAlert(existing), created: false });
        return;
      }
    }

    const coin = await getCryptoProvider().getCoin(goal.coinId);
    if (!coin) throw ApiError.coinNotFound(goal.coinId);

    const alert = await AlertModel.create({
      userId: new Types.ObjectId(userId),
      kind: "PRICE",
      coinId: goal.coinId,
      name: goal.label ?? `Goal: ${coin.symbol}`,
      condition: goal.requiredPrice >= coin.price ? "ABOVE" : "BELOW",
      targetPrice: goal.requiredPrice,
      baselinePrice: coin.price,
      repeat: "ONCE",
      status: "ACTIVE",
    });

    goal.alertId = alert._id;
    await goal.save();

    res.status(201).json({ alert: toAlert(alert), created: true });
  }),
);

router.delete(
  "/:id",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const goal = await GoalModel.findOneAndDelete({
      _id: String(req.params["id"]),
      userId: new Types.ObjectId(userId),
    });
    if (!goal) throw ApiError.notFound("We couldn't find that goal.");

    // The alert was created by the goal, so it goes with it.
    if (goal.alertId) await AlertModel.deleteOne({ _id: goal.alertId, userId: goal.userId });

    res.status(204).end();
  }),
);

export default router;
