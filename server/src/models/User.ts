import { Schema, model, type HydratedDocument, type Model } from "mongoose";

import type { PublicUser } from "../core/types.js";

export interface UserSettings {
  notifications: {
    priceAlerts: boolean;
    portfolioAlerts: boolean;
    push: boolean;
    browser: boolean;
    email: boolean;
  };
  alarm: {
    sound: boolean;
    /** 0-1. */
    volume: number;
  };
  appearance: {
    theme: "dark" | "light" | "system";
  };
}

export interface UserDoc {
  email: string | null;
  /** Absent for wallet-only and Google-only accounts. */
  passwordHash?: string;
  name: string;
  googleId?: string;
  settings: UserSettings;
  /** Bumped on password change / sign-out-everywhere to invalidate refresh tokens. */
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<UserSettings>(
  {
    notifications: {
      priceAlerts: { type: Boolean, default: true },
      portfolioAlerts: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      browser: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
    alarm: {
      sound: { type: Boolean, default: true },
      volume: { type: Number, default: 0.4, min: 0, max: 1 },
    },
    appearance: {
      theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    },
  },
  { _id: false },
);

const userSchema = new Schema<UserDoc>(
  {
    // Sparse unique: wallet-only accounts have no email, and Mongo would
    // otherwise reject the second null.
    email: { type: String, default: null, lowercase: true, trim: true, sparse: true, unique: true },
    passwordHash: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    googleId: { type: String, sparse: true, unique: true },
    settings: { type: settingsSchema, default: () => ({}) },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type UserDocument = HydratedDocument<UserDoc>;

export const User: Model<UserDoc> = model<UserDoc>("User", userSchema);

export function toPublicUser(
  doc: UserDocument,
  opts: { hasWallet?: boolean } = {},
): PublicUser {
  const providers: PublicUser["authProviders"] = [];
  if (doc.passwordHash) providers.push("password");
  if (doc.googleId) providers.push("google");
  if (opts.hasWallet) providers.push("wallet");

  return {
    id: doc.id as string,
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt.getTime(),
    hasPassword: Boolean(doc.passwordHash),
    authProviders: providers,
  };
}
