import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { NotificationModel, toNotification } from "../models/Notification.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";

const router: Router = Router();

router.use(requireAuth);

const listQuery = z.object({
  unreadOnly: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** Spec 13 — the notification centre. */
router.get(
  "/",
  validate(listQuery, "query"),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const { unreadOnly, limit } = req.query as unknown as z.infer<typeof listQuery>;

    const filter = {
      userId: new Types.ObjectId(userId),
      ...(unreadOnly ? { read: false } : {}),
    };

    const [docs, unreadCount] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).limit(limit),
      NotificationModel.countDocuments({ userId: new Types.ObjectId(userId), read: false }),
    ]);

    res.json({ notifications: docs.map(toNotification), unreadCount });
  }),
);

router.post(
  "/read-all",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const result = await NotificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { $set: { read: true } },
    );
    res.json({ updated: result.modifiedCount });
  }),
);

router.post(
  "/:id/read",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: String(req.params["id"]), userId: new Types.ObjectId(userId) },
      { $set: { read: true } },
      { new: true },
    );
    if (!doc) throw ApiError.notFound("We couldn't find that notification.");
    res.json({ notification: toNotification(doc) });
  }),
);

router.delete(
  "/:id",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    await NotificationModel.deleteOne({
      _id: String(req.params["id"]),
      userId: new Types.ObjectId(userId),
    });
    res.status(204).end();
  }),
);

export default router;
