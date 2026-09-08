import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

/** Spec 25 — an append-only log of every alert that fired. */
export interface AlertEventDoc {
  userId: Types.ObjectId;
  alertId: Types.ObjectId;
  coinId?: string;
  alertName?: string;
  kind: string;
  condition: "ABOVE" | "BELOW";
  target: number;
  /** The value that crossed the target. */
  actual: number;
  triggeredAt: Date;
}

const alertEventSchema = new Schema<AlertEventDoc>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  alertId: { type: Schema.Types.ObjectId, ref: "Alert", required: true },
  coinId: { type: String, trim: true },
  alertName: { type: String, trim: true },
  kind: { type: String, required: true },
  condition: { type: String, enum: ["ABOVE", "BELOW"], required: true },
  target: { type: Number, required: true },
  actual: { type: Number, required: true },
  triggeredAt: { type: Date, default: () => new Date() },
});

// Backs the Today / 7d / 30d / All history filters.
alertEventSchema.index({ userId: 1, triggeredAt: -1 });

export type AlertEventDocument = HydratedDocument<AlertEventDoc>;

export const AlertEventModel: Model<AlertEventDoc> = model<AlertEventDoc>(
  "AlertEvent",
  alertEventSchema,
);

export interface AlertHistoryEntry {
  id: string;
  alertId: string;
  coinId?: string;
  alertName?: string;
  kind: string;
  condition: "ABOVE" | "BELOW";
  target: number;
  actual: number;
  triggeredAt: number;
}

export function toAlertHistoryEntry(doc: AlertEventDocument): AlertHistoryEntry {
  return {
    id: doc.id as string,
    alertId: doc.alertId.toString(),
    ...(doc.coinId ? { coinId: doc.coinId } : {}),
    ...(doc.alertName ? { alertName: doc.alertName } : {}),
    kind: doc.kind,
    condition: doc.condition,
    target: doc.target,
    actual: doc.actual,
    triggeredAt: doc.triggeredAt.getTime(),
  };
}
