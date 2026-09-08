import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import type { Coin } from "../core/types.js";
import { WatchlistModel } from "../models/Watchlist.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";
import { getCryptoProvider } from "../services/crypto/index.js";

const router: Router = Router();

router.use(requireAuth);

const addSchema = z.object({ coinId: z.string().trim().min(1) });

router.get(
  "/",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const items = await WatchlistModel.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: 1,
    });

    const provider = getCryptoProvider();
    const settled = await Promise.allSettled(items.map((i) => provider.getCoin(i.coinId)));

    // A coin the provider can't resolve still stays on the list — it's the
    // user's choice, not ours, and the row renders as unavailable.
    const coins = items.map((item, index) => {
      const result = settled[index];
      const coin: Coin | null =
        result?.status === "fulfilled" && result.value ? result.value : null;
      return { coinId: item.coinId, coin, addedAt: item.createdAt.getTime() };
    });

    res.json({ watchlist: coins });
  }),
);

router.post(
  "/",
  validate(addSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const { coinId } = req.body as z.infer<typeof addSchema>;

    const coin = await getCryptoProvider().getCoin(coinId);
    if (!coin) throw ApiError.coinNotFound(coinId);

    // Upsert keeps "add" idempotent — tapping the star twice isn't an error.
    const result = await WatchlistModel.updateOne(
      { userId: new Types.ObjectId(userId), coinId },
      { $setOnInsert: { userId: new Types.ObjectId(userId), coinId } },
      { upsert: true },
    );

    // 201 only when a row was actually created; the second tap gets 200, since
    // claiming to have created something twice is a lie a client may act on.
    res.status(result.upsertedCount > 0 ? 201 : 200).json({ coinId, coin });
  }),
);

router.delete(
  "/:coinId",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    await WatchlistModel.deleteOne({
      userId: new Types.ObjectId(userId),
      coinId: String(req.params["coinId"]),
    });
    // Idempotent: removing something already gone is a success, not a 404.
    res.status(204).end();
  }),
);

export default router;
