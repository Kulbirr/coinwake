import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

import type { WalletAccount, WalletChain } from "../core/types.js";

/**
 * A connected wallet is an address plus a signature proving the user controls it.
 * We store nothing else: no seed phrase, no private key, no session key, and no
 * spend approval (spec 27). Everything downstream is read-only RPC.
 */
export interface WalletDoc {
  userId: Types.ObjectId;
  chain: WalletChain;
  address: string;
  label?: string;
  includeInPortfolio: boolean;
  /** True once a signMessage challenge has been verified. */
  verified: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<WalletDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    chain: { type: String, enum: ["solana", "ethereum"], required: true },
    address: { type: String, required: true, trim: true },
    label: { type: String, trim: true, maxlength: 60 },
    includeInPortfolio: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true },
);

walletSchema.index({ userId: 1, chain: 1, address: 1 }, { unique: true });

export type WalletDocument = HydratedDocument<WalletDoc>;

export const WalletModel: Model<WalletDoc> = model<WalletDoc>("Wallet", walletSchema);

export function toWalletAccount(doc: WalletDocument): WalletAccount {
  return {
    id: doc.id as string,
    chain: doc.chain,
    address: doc.address,
    ...(doc.label ? { label: doc.label } : {}),
    includeInPortfolio: doc.includeInPortfolio,
    verified: doc.verified,
    ...(doc.lastSyncedAt ? { lastSyncedAt: doc.lastSyncedAt.getTime() } : {}),
    createdAt: doc.createdAt.getTime(),
  };
}
