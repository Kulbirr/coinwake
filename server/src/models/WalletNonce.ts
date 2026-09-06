import { Schema, model, type HydratedDocument, type Model } from "mongoose";

/**
 * Short-lived nonce for wallet sign-in. The user signs this exact string with
 * their wallet; we verify the signature and throw the nonce away. Single-use, so
 * a captured signature can't be replayed.
 */
export interface WalletNonceDoc {
  chain: "solana" | "ethereum";
  address: string;
  nonce: string;
  message: string;
  expiresAt: Date;
  createdAt: Date;
}

const walletNonceSchema = new Schema<WalletNonceDoc>(
  {
    chain: { type: String, enum: ["solana", "ethereum"], required: true },
    address: { type: String, required: true, trim: true },
    nonce: { type: String, required: true },
    message: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Mongo reaps expired challenges for us.
walletNonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
walletNonceSchema.index({ chain: 1, address: 1 });

export type WalletNonceDocument = HydratedDocument<WalletNonceDoc>;

export const WalletNonceModel: Model<WalletNonceDoc> = model<WalletNonceDoc>(
  "WalletNonce",
  walletNonceSchema,
);
