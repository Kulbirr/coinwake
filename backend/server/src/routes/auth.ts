import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { ApiError } from "../core/ApiError.js";
import { WalletModel, toWalletAccount } from "../models/Wallet.js";
import { User, toPublicUser } from "../models/User.js";
import { currentUserId, loadUser, requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { handler, validate } from "../middleware/validate.js";
import { issueTokens, verifyRefreshToken } from "../services/tokens.js";
import { createChallenge, verifyChallenge } from "../services/wallet/index.js";

const router: Router = Router();

const BCRYPT_ROUNDS = 12;

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  name: z.string().trim().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

const googleSchema = z.object({ idToken: z.string().min(1) });

const nonceSchema = z.object({
  chain: z.enum(["solana", "ethereum"]),
  address: z.string().trim().min(26).max(64),
});

const walletVerifySchema = nonceSchema.extend({
  nonce: z.string().min(8),
  signature: z.string().min(1),
  label: z.string().trim().max(60).optional(),
});

// Credential endpoints are the ones worth brute-forcing, so they get their own
// tight bucket keyed by IP rather than by user.
const authLimiter = rateLimit({ bucket: "auth", max: 20, windowSeconds: 300 });

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  handler(async (req, res) => {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>;
    const normalised = email.toLowerCase();

    const existing = await User.findOne({ email: normalised });
    if (existing) {
      throw ApiError.conflict("An account with that email already exists.", {
        hint: "Try signing in instead.",
      });
    }

    const user = await User.create({
      email: normalised,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      name: name ?? normalised.split("@")[0] ?? normalised,
    });

    res.status(201).json({ user: toPublicUser(user), tokens: issueTokens(user) });
  }),
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  handler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    // passwordHash is select:false, so ask for it explicitly.
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    // Same message either way — don't reveal which accounts exist.
    const invalid = ApiError.unauthorized("That email or password isn't right.");
    if (!user?.passwordHash) throw invalid;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw invalid;

    const hasWallet = (await WalletModel.countDocuments({ userId: user._id })) > 0;
    res.json({ user: toPublicUser(user, { hasWallet }), tokens: issueTokens(user) });
  }),
);

router.post(
  "/refresh",
  validate(refreshSchema),
  handler(async (req, res) => {
    const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
    const claims = verifyRefreshToken(refreshToken);

    const user = await User.findById(claims.sub);
    if (!user) throw ApiError.unauthorized("Please sign in again.");

    // A bumped tokenVersion means "sign out everywhere" happened after this
    // token was issued.
    if (user.tokenVersion !== claims.v) {
      throw ApiError.unauthorized("Your session was ended. Please sign in again.");
    }

    res.json({ tokens: issueTokens(user) });
  }),
);

interface GoogleTokenInfo {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
}

router.post(
  "/google",
  authLimiter,
  validate(googleSchema),
  handler(async (req, res) => {
    if (!env.GOOGLE_CLIENT_ID) {
      throw ApiError.badRequest("Google sign-in isn't configured on this server.", {
        hint: "Use email and password, or set GOOGLE_CLIENT_ID.",
      });
    }

    const { idToken } = req.body as z.infer<typeof googleSchema>;

    // Google's tokeninfo endpoint verifies the signature for us, which avoids
    // pulling in a JWKS client for a single provider.
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!response.ok) throw ApiError.unauthorized("That Google sign-in didn't work.");

    const info = (await response.json()) as GoogleTokenInfo;
    const verified = info.email_verified === true || info.email_verified === "true";

    if (info.aud !== env.GOOGLE_CLIENT_ID || !info.sub || !info.email || !verified) {
      throw ApiError.unauthorized("That Google sign-in didn't work.");
    }

    const email = info.email.toLowerCase();
    let user = await User.findOne({ $or: [{ googleId: info.sub }, { email }] });

    if (!user) {
      user = await User.create({
        email,
        googleId: info.sub,
        name: info.name ?? email.split("@")[0] ?? email,
      });
    } else if (!user.googleId) {
      // Link Google to the existing email account rather than creating a second one.
      user.googleId = info.sub;
      await user.save();
    }

    const hasWallet = (await WalletModel.countDocuments({ userId: user._id })) > 0;
    res.json({ user: toPublicUser(user, { hasWallet }), tokens: issueTokens(user) });
  }),
);

/**
 * Step 1 of wallet sign-in: hand out a message to sign.
 *
 * Spec 27 — this proves ownership and nothing else. We never ask for a seed
 * phrase or private key, and the signature grants no permission to move funds.
 */
router.post(
  "/wallet/nonce",
  authLimiter,
  validate(nonceSchema),
  handler(async (req, res) => {
    const { chain, address } = req.body as z.infer<typeof nonceSchema>;
    const domain = req.get("origin") ?? req.get("host") ?? "coinwake.app";
    res.json({ challenge: await createChallenge(chain, address, domain) });
  }),
);

/** Step 2: verify the signature, then sign in or link the wallet. */
router.post(
  "/wallet/verify",
  authLimiter,
  validate(walletVerifySchema),
  handler(async (req, res) => {
    const { chain, address, nonce, signature, label } = req.body as z.infer<
      typeof walletVerifySchema
    >;

    await verifyChallenge({ chain, address, nonce, signature });

    const existing = await WalletModel.findOne({ chain, address });

    let user = existing ? await User.findById(existing.userId) : null;
    if (!user) {
      user = await User.create({
        email: null,
        name: `${address.slice(0, 4)}…${address.slice(-4)}`,
      });
    }

    const wallet =
      existing ??
      (await WalletModel.create({
        userId: user._id,
        chain,
        address,
        verified: true,
        ...(label ? { label } : {}),
      }));

    if (!wallet.verified) {
      wallet.verified = true;
      await wallet.save();
    }

    res.json({
      user: toPublicUser(user, { hasWallet: true }),
      wallet: toWalletAccount(wallet),
      tokens: issueTokens(user),
    });
  }),
);

router.get(
  "/me",
  requireAuth,
  loadUser,
  handler(async (req, res) => {
    const user = req.user;
    if (!user) throw ApiError.unauthorized();
    const hasWallet = (await WalletModel.countDocuments({ userId: user._id })) > 0;
    res.json({ user: toPublicUser(user, { hasWallet }), settings: user.settings });
  }),
);

/**
 * Signs out everywhere by bumping tokenVersion, which invalidates every
 * outstanding refresh token. Access tokens are short-lived and expire on their own.
 */
router.post(
  "/logout",
  requireAuth,
  handler(async (req, res) => {
    await User.findByIdAndUpdate(currentUserId(req), { $inc: { tokenVersion: 1 } });
    res.status(204).end();
  }),
);

export default router;
