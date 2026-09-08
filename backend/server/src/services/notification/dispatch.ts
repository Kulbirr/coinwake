import { Types } from "mongoose";

import { createLogger } from "../../config/logger.js";
import type { Notification } from "../../core/types.js";
import { NotificationModel, toNotification } from "../../models/Notification.js";
import { PushSubscriptionModel } from "../../models/PushSubscription.js";
import { User } from "../../models/User.js";
import { hub } from "../realtime/hub.js";
import { getNotificationProvider } from "./index.js";
import type { NotificationPayload, PushTarget } from "./NotificationProvider.js";

const log = createLogger("notify");

/** After this many consecutive failures we stop trying an endpoint. */
const MAX_PUSH_FAILURES = 3;

export interface DispatchChannels {
  browser: boolean;
  push: boolean;
  email: boolean;
}

/**
 * Persists a notification and fans it out over every enabled channel (spec 13).
 * The notification centre is the source of truth — delivery can fail, but the
 * record must always exist so nothing is silently lost.
 */
export async function dispatchNotification(input: {
  userId: string;
  payload: NotificationPayload;
  channels: DispatchChannels;
}): Promise<Notification> {
  const { userId, payload, channels } = input;

  const doc = await NotificationModel.create({
    userId: new Types.ObjectId(userId),
    kind: payload.kind,
    title: payload.title,
    body: payload.body,
    ...(payload.coinId ? { coinId: payload.coinId } : {}),
    ...(payload.alertId && Types.ObjectId.isValid(payload.alertId)
      ? { alertId: new Types.ObjectId(payload.alertId) }
      : {}),
  });

  const notification = toNotification(doc);

  // Always land it in the notification centre of any open tab.
  hub.sendToUser(userId, { type: "notification", payload: notification });

  const provider = getNotificationProvider();

  if (channels.browser) {
    await provider.sendBrowserNotification(userId, payload).catch((err: unknown) => {
      log.warn(`Browser notification failed: ${(err as Error).message}`);
    });
  }

  if (channels.push && provider.pushConfigured) {
    await deliverPush(userId, payload).catch((err: unknown) => {
      log.warn(`Push delivery failed: ${(err as Error).message}`);
    });
  }

  if (channels.email) {
    const user = await User.findById(userId).select("email").lean();
    if (user?.email) {
      await provider.sendEmail(user.email, payload).catch((err: unknown) => {
        log.warn(`Email delivery failed: ${(err as Error).message}`);
      });
    }
  }

  return notification;
}

async function deliverPush(userId: string, payload: NotificationPayload): Promise<void> {
  const subscriptions = await PushSubscriptionModel.find({
    userId: new Types.ObjectId(userId),
    failureCount: { $lt: MAX_PUSH_FAILURES },
  }).lean();

  if (subscriptions.length === 0) return;

  const targets: PushTarget[] = subscriptions.map((s) => ({
    endpoint: s.endpoint,
    keys: s.keys,
  }));

  const result = await getNotificationProvider().sendPush(targets, payload);

  // A gone endpoint will never come back — delete rather than count failures.
  if (result.expired.length > 0) {
    await PushSubscriptionModel.deleteMany({ endpoint: { $in: result.expired } });
    log.info(`Pruned ${result.expired.length} expired push subscription(s).`);
  }

  if (result.failed > 0) {
    await PushSubscriptionModel.updateMany(
      { userId: new Types.ObjectId(userId), endpoint: { $nin: result.expired } },
      { $inc: { failureCount: 1 } },
    );
  } else if (result.sent > 0) {
    await PushSubscriptionModel.updateMany(
      { userId: new Types.ObjectId(userId), failureCount: { $gt: 0 } },
      { $set: { failureCount: 0 } },
    );
  }
}
