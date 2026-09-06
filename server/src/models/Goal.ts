import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

import type { Goal } from "../core/types.js";

export interface GoalDoc {
  userId: Types.ObjectId;
  coinId: string;
  targetValue: number;
  label?: string;
  /** Snapshot of the plan at creation time, recomputed on read. */
  requiredPrice: number;
  requiredMarketCap?: number;
  requiredMultiple: number;
  alertId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<GoalDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coinId: { type: String, required: true, trim: true },
    targetValue: { type: Number, required: true, min: 0 },
    label: { type: String, trim: true, maxlength: 120 },
    requiredPrice: { type: Number, required: true },
    requiredMarketCap: { type: Number },
    requiredMultiple: { type: Number, required: true },
    alertId: { type: Schema.Types.ObjectId, ref: "Alert" },
  },
  { timestamps: true },
);

export type GoalDocument = HydratedDocument<GoalDoc>;

export const GoalModel: Model<GoalDoc> = model<GoalDoc>("Goal", goalSchema);

export function toGoal(doc: GoalDocument): Goal {
  return {
    id: doc.id as string,
    coinId: doc.coinId,
    targetValue: doc.targetValue,
    ...(doc.label ? { label: doc.label } : {}),
    requiredPrice: doc.requiredPrice,
    requiredMarketCap: doc.requiredMarketCap ?? null,
    requiredMultiple: doc.requiredMultiple,
    createdAt: doc.createdAt.getTime(),
    ...(doc.alertId ? { alertId: doc.alertId.toString() } : {}),
  };
}
