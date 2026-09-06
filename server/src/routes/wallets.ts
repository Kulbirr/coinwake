import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { createLogger } from "../config/logger.js";
import type { TokenBalance } from "../core/types.js";
import { HoldingModel, toHolding } from "../models/Holding.js";
import { WalletModel, toWalletAccount } from "../models/Wallet.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { handler, validate } from "../middleware/validate.js";
import { createChallenge, getWalletProvider, verifyChallenge } from "../services/wallet/index.js";

const log = createLogger("wallets");

const router: Router = Router();

router.use(requireAuth);

const connectSchema = z.object({
  chain: z.enum(["solana", "ethereum"]),
  address: z.string().trim().min(26).max(64),
  nonce: z.string().min(8),
  signature: z.string().min(1),
  label: z.string().trim().max(60).optional(),
});

const nonceSchema = z.object({
  chain: z.enum(["solana", "ethereum"]),
  address: z.string().trim().min(26).max(64),
});

const updateSchema = z.object({
  label: z.string().trim().max(60).optional(),
  includeInPortfolio: z.boolean().optional(),
});

router.get(
  "/",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const wallets = await WalletModel.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: 1,
    });
    res.json({ wallets: wallets.map(toWalletAccount) });
  }),
);

/** Step 1 of linking a wallet to an already-signed-in account. */
router.post(
  "/nonce",
  validate(nonceSchema),
  handler(async (req, res) => {
    const { chain, address } = req.body as z.infer<typeof nonceSchema>;
    const domain = req.get("origin") ?? req.get("host") ?? "coinwake.app";
    res.json({ challenge: await createChallenge(chain, address, domain) });
  }),
);

/**
 * Step 2: verify and attach. Spec 27 — the signature proves ownership only.
 * We store the address and nothing else; no key material ever reaches this server.
 */
router.post(
  "/",
  validate(connectSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const { chain, address, nonce, signature, label } = req.body as z.infer<typeof connectSchema>;

    const claimedElsewhere = await WalletModel.findOne({
      chain,
      address,
      userId: { $ne: new Types.ObjectId(userId) },
    });
    if (claimedElsewhere) {
      throw ApiError.conflict("That wallet is already connected to another account.");
    }

    await verifyChallenge({ chain, address, nonce, signature });

    const wallet = await WalletModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), chain, address },
      {
        $set: { verified: true, ...(label ? { label } : {}) },
        $setOnInsert: { includeInPortfolio: true },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (!wallet) throw ApiError.internal("We couldn't save that wallet.");
    res.status(201).json({ wallet: toWalletAccount(wallet) });
  }),
);

router.patch(
  "/:id",
  validate(updateSchema),
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const patch = req.body as z.infer<typeof updateSchema>;

    const wallet = await WalletModel.findOneAndUpdate(
      { _id: String(req.params["id"]), userId: new Types.ObjectId(userId) },
      { $set: patch },
      { new: true },
    );
    if (!wallet) throw ApiError.notFound("We couldn't find that wallet.");

    res.json({ wallet: toWalletAccount(wallet) });
  }),
);

/** Disconnect: removes the address and any holdings it produced. */
router.delete(
  "/:id",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const walletId = String(req.params["id"]);

    const wallet = await WalletModel.findOneAndDelete({
      _id: walletId,
      userId: new Types.ObjectId(userId),
    });
    if (!wallet) throw ApiError.notFound("We couldn't find that wallet.");

    await HoldingModel.deleteMany({
      userId: new Types.ObjectId(userId),
      walletId: wallet._id,
      source: "WALLET",
    });

    res.status(204).end();
  }),
);

router.get(
  "/:id/balances",
  handler(async (req, res) => {
    const wallet = await findWallet(String(req.params["id"]), currentUserId(req));
    const balances = await getWalletProvider().getBalances(wallet.chain, wallet.address);
    res.json({ walletId: wallet.id as string, balances });
  }),
);

router.get(
  "/:id/transactions",
  handler(async (req, res) => {
    const wallet = await findWallet(String(req.params["id"]), currentUserId(req));
    const limit = Math.min(50, Number(req.query["limit"] ?? 20) || 20);

    const transactions = await getWalletProvider().getTransactions(
      wallet.chain,
      wallet.address,
      limit,
    );

    res.json({
      walletId: wallet.id as string,
      transactions,
      // Spec 7 — say so plainly rather than letting the UI infer an empty history.
      costBasisAvailable: transactions.some((t) => t.priceUsd !== undefined),
      ...(transactions.length === 0
        ? { note: "This chain's public RPC doesn't expose a full transfer history." }
        : {}),
    });
  }),
);

/**
 * Pulls on-chain balances into the portfolio as WALLET holdings (spec 5).
 *
 * Cost basis is only claimed when the provider gave us priced transfers;
 * otherwise the rows are marked UNAVAILABLE and the UI shows
 * "Cost basis unavailable" so the user can supply one (spec 7).
 */
router.post(
  "/:id/sync",
  handler(async (req, res) => {
    const userId = currentUserId(req);
    const wallet = await findWallet(String(req.params["id"]), userId);

    const provider = getWalletProvider();
    const balances = await provider.getBalances(wallet.chain, wallet.address);

    const priced = await provider
      .getTransactions(wallet.chain, wallet.address, 50)
      .catch((err: unknown) => {
        log.warn(`Transaction history unavailable: ${(err as Error).message}`);
        return [];
      });

    const costBasis = deriveCostBasis(priced);

    // Replace rather than merge: the chain is authoritative for quantity, so a
    // stale row for a token the user has since sold must not survive a resync.
    await HoldingModel.deleteMany({
      userId: new Types.ObjectId(userId),
      walletId: wallet._id,
      source: "WALLET",
    });

    const tracked = balances.filter(
      (b): b is TokenBalance & { coinId: string } => Boolean(b.coinId) && b.quantity > 0,
    );

    const today = new Date().toISOString().slice(0, 10);
    const docs = await HoldingModel.insertMany(
      tracked.map((balance) => {
        const basis = costBasis.get(balance.symbol.toUpperCase());
        return {
          userId: new Types.ObjectId(userId),
          walletId: wallet._id,
          coinId: balance.coinId,
          quantity: balance.quantity,
          averageBuyPrice: basis?.averagePrice ?? 0,
          costBasisSource: basis ? "TRANSACTIONS" : "UNAVAILABLE",
          source: "WALLET",
          purchaseDate: basis?.firstDate ?? today,
          wallet: wallet.label ?? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`,
        };
      }),
    );

    wallet.lastSyncedAt = new Date();
    await wallet.save();

    const skipped = balances.length - tracked.length;

    res.json({
      wallet: toWalletAccount(wallet),
      holdings: docs.map((d) => toHolding(d)),
      ...(skipped > 0
        ? { skipped, skippedNote: `${skipped} token(s) we couldn't match to market data.` }
        : {}),
      costBasisAvailable: costBasis.size > 0,
      ...(costBasis.size === 0
        ? { costBasisNote: "Cost basis unavailable — add your average buy price to track profit." }
        : { costBasisNote: "Cost basis estimated from on-chain transfers." }),
    });
  }),
);

/** Weighted average of priced inbound transfers, per symbol. */
function deriveCostBasis(
  transactions: Array<{
    direction: "IN" | "OUT" | "UNKNOWN";
    symbol: string;
    quantity: number;
    priceUsd?: number;
    timestamp: number;
  }>,
): Map<string, { averagePrice: number; firstDate: string }> {
  const acc = new Map<string, { cost: number; quantity: number; earliest: number }>();

  for (const tx of transactions) {
    // Only priced inbound transfers tell us anything about what was paid.
    if (tx.direction !== "IN" || tx.priceUsd === undefined || tx.quantity <= 0) continue;

    const key = tx.symbol.toUpperCase();
    const entry = acc.get(key) ?? { cost: 0, quantity: 0, earliest: tx.timestamp };
    entry.cost += tx.quantity * tx.priceUsd;
    entry.quantity += tx.quantity;
    entry.earliest = Math.min(entry.earliest, tx.timestamp);
    acc.set(key, entry);
  }

  const out = new Map<string, { averagePrice: number; firstDate: string }>();
  for (const [symbol, entry] of acc) {
    if (entry.quantity <= 0) continue;
    out.set(symbol, {
      averagePrice: entry.cost / entry.quantity,
      firstDate: new Date(entry.earliest).toISOString().slice(0, 10),
    });
  }
  return out;
}

async function findWallet(id: string, userId: string) {
  const wallet = await WalletModel.findOne({
    _id: id,
    userId: new Types.ObjectId(userId),
  });
  if (!wallet) throw ApiError.notFound("We couldn't find that wallet.");
  return wallet;
}

export default router;
