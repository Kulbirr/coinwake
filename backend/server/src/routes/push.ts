import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { env, pushEnabled } from "../config/env.js";
import { ApiError } from "../core/ApiError.js";
import { PushSubscriptionModel } from "../models/PushSubscription.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";
import { dispatchNotification } from "../services/notification/dispatch.js";

const router: Router = Router();

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

/**
 * The browser needs the public VAPID key to subscribe. Public by design — the
 * private key never leaves the server (spec 3).
 */
router.get("/public-key", (_req, res) => {
  if (!pushEnabled) throw ApiError.pushNotConfigured();
  res.json({ publicKey: env.VAPID_PUBLIC_KEY });
});

router.use(requireAuth);

router.post(
  "/subscribe",
  validate(subscribeSchema),
  handler(async (req, res) => {
    if (!pushEnabled) throw ApiError.pushNotConfigured();

    const userId = currentUserId(req);
    const { endpoint, keys } = req.body as z.infer<typeof subscribeSchema>;

    // Endpoints are globally unique, so re-subscribing on a shared device moves
    // the row to whoever is signed in now instead of failing on the unique index.
    const doc = await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      {
        $set: {
          userId: new Types.ObjectId(userId),
          keys,
          failureCount: 0,
          ...(req.get("user-agent") ? { userAgent: req.get("user-agent") } : {}),
        },
      },
      { upsert: true, new: true },
    );

    res.status(201).json({ subscribed: true, id: doc?.id as string });
  }),
);

router.post(
  "/unsubscribe",
  validate(unsubscribeSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const { endpoint } = req.body as z.infer<typeof unsubscribeSchema>;

    await PushSubscriptionModel.deleteOne({ endpoint, userId: new Types.ObjectId(userId) });
    res.status(204).end();
  }),
);

/** Lets the settings screen prove push works end-to-end before relying on it. */
router.post(
  "/test",
  handler(async (req, res) => {
    const userId = currentUserId(req);

    const count = await PushSubscriptionModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });
    if (count === 0) {
      throw ApiError.badRequest("This device isn't subscribed to push notifications yet.", {
        hint: "Allow notifications, then try again.",
      });
    }

    const notification = await dispatchNotification({
      userId,
      payload: {
        kind: "SYSTEM",
        title: "CoinWake is set up",
        body: "Push notifications are working. We'll wake you when a target is hit.",
        url: "/alerts",
      },
      channels: { browser: true, push: true, email: false },
    });

    res.json({ notification, devices: count });
  }),
);

export default router;
