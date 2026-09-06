import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

/**
 * A browser Web Push endpoint. Spec 12/29: these let the alert engine reach a
 * user whose tab is closed, which is the whole reason alerts run server-side.
 */
export interface PushSubscriptionDoc {
  userId: Types.ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
  /** Cleared on success; after repeated 404/410 responses we delete the row. */
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<PushSubscriptionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, trim: true, maxlength: 300 },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type PushSubscriptionDocument = HydratedDocument<PushSubscriptionDoc>;

export const PushSubscriptionModel: Model<PushSubscriptionDoc> = model<PushSubscriptionDoc>(
  "PushSubscription",
  pushSubscriptionSchema,
);
