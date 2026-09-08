import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

import type { Notification, NotificationKind } from "../core/types.js";

export interface NotificationDoc {
  userId: Types.ObjectId;
  kind: NotificationKind;
  title: string;
  body: string;
  coinId?: string;
  alertId?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: {
      type: String,
      enum: [
        "PRICE_TARGET",
        "MARKET_CAP_TARGET",
        "PORTFOLIO_TARGET",
        "PERCENT_MOVE",
        "ALERT_TRIGGERED",
        "SYSTEM",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    coinId: { type: String, trim: true },
    alertId: { type: Schema.Types.ObjectId, ref: "Alert" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export type NotificationDocument = HydratedDocument<NotificationDoc>;

export const NotificationModel: Model<NotificationDoc> = model<NotificationDoc>(
  "Notification",
  notificationSchema,
);

export function toNotification(doc: NotificationDocument): Notification {
  return {
    id: doc.id as string,
    kind: doc.kind,
    title: doc.title,
    body: doc.body,
    ...(doc.coinId ? { coinId: doc.coinId } : {}),
    ...(doc.alertId ? { alertId: doc.alertId.toString() } : {}),
    read: doc.read,
    createdAt: doc.createdAt.getTime(),
  };
}
