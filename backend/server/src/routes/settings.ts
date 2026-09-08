import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { User, toPublicUser } from "../models/User.js";
import { WalletModel } from "../models/Wallet.js";
import { loadUser, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";
import { issueTokens } from "../services/tokens.js";

const router: Router = Router();

router.use(requireAuth, loadUser);

const settingsSchema = z.object({
  notifications: z
    .object({
      priceAlerts: z.boolean().optional(),
      portfolioAlerts: z.boolean().optional(),
      push: z.boolean().optional(),
      browser: z.boolean().optional(),
      email: z.boolean().optional(),
    })
    .optional(),
  alarm: z
    .object({
      sound: z.boolean().optional(),
      volume: z.number().min(0).max(1).optional(),
    })
    .optional(),
  appearance: z
    .object({
      theme: z.enum(["dark", "light", "system"]).optional(),
    })
    .optional(),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8, "Use at least 8 characters."),
});

/** Spec 37 — the settings screen. */
router.get(
  "/",
  handler(async (req, res) => {
    const user = req.user;
    if (!user) throw ApiError.unauthorized();
    const hasWallet = (await WalletModel.countDocuments({ userId: user._id })) > 0;
    res.json({ settings: user.settings, user: toPublicUser(user, { hasWallet }) });
  }),
);

router.patch(
  "/",
  validate(settingsSchema),
  handler(async (req, res) => {
    const user = req.user;
    if (!user) throw ApiError.unauthorized();

    const patch = req.body as z.infer<typeof settingsSchema>;

    // Merge field by field: a PATCH of one toggle must not wipe the rest.
    if (patch.notifications) Object.assign(user.settings.notifications, patch.notifications);
    if (patch.alarm) Object.assign(user.settings.alarm, patch.alarm);
    if (patch.appearance) Object.assign(user.settings.appearance, patch.appearance);

    user.markModified("settings");
    await user.save();

    res.json({ settings: user.settings });
  }),
);

router.patch(
  "/profile",
  validate(profileSchema),
  handler(async (req, res) => {
    const user = req.user;
    if (!user) throw ApiError.unauthorized();

    const { name } = req.body as z.infer<typeof profileSchema>;
    if (name !== undefined) user.name = name;
    await user.save();

    res.json({ user: toPublicUser(user) });
  }),
);

/**
 * Sets or changes the account password. Bumping tokenVersion signs every other
 * device out, which is the point of changing a password.
 */
router.post(
  "/password",
  validate(passwordSchema),
  handler(async (req, res) => {
    const current = req.user;
    if (!current) throw ApiError.unauthorized();

    const { currentPassword, newPassword } = req.body as z.infer<typeof passwordSchema>;

    const user = await User.findById(current._id).select("+passwordHash");
    if (!user) throw ApiError.unauthorized();

    if (user.passwordHash) {
      if (!currentPassword) throw ApiError.badRequest("Enter your current password.");
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) throw ApiError.badRequest("That current password isn't right.");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.tokenVersion += 1;
    await user.save();

    // Hand back a fresh pair so the caller isn't logged out by its own change.
    res.json({ tokens: issueTokens(user), user: toPublicUser(user) });
  }),
);

export default router;
