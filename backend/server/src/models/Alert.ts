import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

import type {
  Alert,
  AlertCondition,
  AlertKind,
  AlertRepeat,
  AlertStatus,
  PortfolioMetric,
} from "../core/types.js";

export interface AlertDoc {
  userId: Types.ObjectId;
  kind: AlertKind;
  coinId?: string;
  name?: string;
  condition: AlertCondition;
  targetPrice?: number;
  targetMarketCap?: number;
  targetPercent?: number;
  portfolioMetric?: PortfolioMetric;
  targetValue?: number;
  repeat: AlertRepeat;
  cooldownMinutes: number;
  notify: { browser: boolean; alarm: boolean; push: boolean; email: boolean };
  status: AlertStatus;
  triggeredAt?: Date;
  triggerCount: number;
  /** Suppresses re-firing until this instant (spec 9 cooldown). */
  cooldownUntil?: Date;
  baselinePrice?: number;
  baselineValue?: number;
  sound?: string;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<AlertDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: {
      type: String,
      enum: ["PRICE", "MARKET_CAP", "PERCENT", "PORTFOLIO"],
      required: true,
    },
    // Absent for PORTFOLIO alerts, which watch the whole account.
    coinId: { type: String, trim: true },
    name: { type: String, trim: true, maxlength: 120 },
    condition: { type: String, enum: ["ABOVE", "BELOW"], required: true },
    targetPrice: { type: Number, min: 0 },
    targetMarketCap: { type: Number, min: 0 },
    targetPercent: { type: Number },
    portfolioMetric: { type: String, enum: ["VALUE", "PROFIT", "ROI", "DRAWDOWN"] },
    targetValue: { type: Number },
    repeat: { type: String, enum: ["ONCE", "RECURRING"], default: "ONCE" },
    cooldownMinutes: { type: Number, default: 5, min: 0, max: 60 * 24 },
    notify: {
      browser: { type: Boolean, default: true },
      alarm: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "TRIGGERED", "DISABLED"],
      default: "ACTIVE",
      index: true,
    },
    triggeredAt: { type: Date },
    triggerCount: { type: Number, default: 0 },
    cooldownUntil: { type: Date },
    baselinePrice: { type: Number },
    baselineValue: { type: Number },
    sound: { type: String, enum: ["default", "gentle", "urgent", "retro", "chill", "loud"], default: "default" },
  },
  { timestamps: true },
);

// The alert engine's hot query: every armed alert, grouped by the coin it watches.
alertSchema.index({ status: 1, coinId: 1 });
alertSchema.index({ userId: 1, status: 1 });

export type AlertDocument = HydratedDocument<AlertDoc>;

export const AlertModel: Model<AlertDoc> = model<AlertDoc>("Alert", alertSchema);

export function toAlert(doc: AlertDocument): Alert {
  return {
    id: doc.id as string,
    kind: doc.kind,
    ...(doc.coinId ? { coinId: doc.coinId } : {}),
    ...(doc.name ? { name: doc.name } : {}),
    condition: doc.condition,
    ...(doc.targetPrice !== undefined ? { targetPrice: doc.targetPrice } : {}),
    ...(doc.targetMarketCap !== undefined ? { targetMarketCap: doc.targetMarketCap } : {}),
    ...(doc.targetPercent !== undefined ? { targetPercent: doc.targetPercent } : {}),
    ...(doc.portfolioMetric ? { portfolioMetric: doc.portfolioMetric } : {}),
    ...(doc.targetValue !== undefined ? { targetValue: doc.targetValue } : {}),
    repeat: doc.repeat,
    cooldownMinutes: doc.cooldownMinutes,
    notify: doc.notify,
    status: doc.status,
    createdAt: doc.createdAt.getTime(),
    updatedAt: doc.updatedAt.getTime(),
    ...(doc.triggeredAt ? { triggeredAt: doc.triggeredAt.getTime() } : {}),
    triggerCount: doc.triggerCount,
    ...(doc.baselinePrice !== undefined ? { baselinePrice: doc.baselinePrice } : {}),
    ...(doc.baselineValue !== undefined ? { baselineValue: doc.baselineValue } : {}),
    ...(doc.sound ? { sound: doc.sound } : { sound: "default" }),
  };
}
