import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

import type { Holding } from "../core/types.js";

export interface HoldingDoc {
  userId: Types.ObjectId;
  coinId: string;
  quantity: number;
  averageBuyPrice: number;
  purchaseDate: string;
  exchange?: string;
  wallet?: string;
  notes?: string;
  source: "MANUAL" | "WALLET";
  costBasisSource: "USER" | "TRANSACTIONS" | "UNAVAILABLE";
  /** Set for WALLET holdings so a resync can replace exactly the right rows. */
  walletId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const holdingSchema = new Schema<HoldingDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coinId: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    averageBuyPrice: { type: Number, required: true, min: 0 },
    // Stored as YYYY-MM-DD: a purchase date is a calendar day, not an instant,
    // so a Date would drag timezone bugs into every display.
    purchaseDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    exchange: { type: String, trim: true },
    wallet: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    source: { type: String, enum: ["MANUAL", "WALLET"], default: "MANUAL" },
    costBasisSource: {
      type: String,
      enum: ["USER", "TRANSACTIONS", "UNAVAILABLE"],
      default: "USER",
    },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
  },
  { timestamps: true },
);

holdingSchema.index({ userId: 1, coinId: 1 });

export type HoldingDocument = HydratedDocument<HoldingDoc>;

export const HoldingModel: Model<HoldingDoc> = model<HoldingDoc>("Holding", holdingSchema);

export function toHolding(doc: HoldingDocument): Holding {
  return {
    id: doc.id as string,
    coinId: doc.coinId,
    quantity: doc.quantity,
    averageBuyPrice: doc.averageBuyPrice,
    purchaseDate: doc.purchaseDate,
    ...(doc.exchange ? { exchange: doc.exchange } : {}),
    ...(doc.wallet ? { wallet: doc.wallet } : {}),
    ...(doc.notes ? { notes: doc.notes } : {}),
    source: doc.source,
    costBasisSource: doc.costBasisSource,
    createdAt: doc.createdAt.getTime(),
    updatedAt: doc.updatedAt.getTime(),
  };
}
