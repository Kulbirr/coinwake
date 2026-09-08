import { Router } from "express";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import {
  buildScenarios,
  calcProfit,
  distanceToTarget,
  marketCapFromPrice,
  planGoal,
  priceFromMarketCap,
  scenarioLadder,
} from "../core/calc.js";
import { optionalAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { handler, validate } from "../middleware/validate.js";
import { getCryptoProvider } from "../services/crypto/index.js";

const router: Router = Router();

/** Spec 43 — attached to every calculator response, not buried in the UI. */
const DISCLAIMER =
  "CryptoWake calculations are estimates based on the data and assumptions provided. They are not financial advice.";

/**
 * Spec 7 — with no purchase price there is nothing to divide by, so ROI and
 * multiple come back null. This says why, in words the UI can show as-is.
 */
const NO_BASIS_NOTE =
  "Return on investment needs a purchase price. Enter one to see ROI and multiple.";

/**
 * Spec 15 — `supplyEstimated` only ever means "the caller gave us this number",
 * so one sentence covers every case that sets it.
 */
const OVERRIDE_SUPPLY_NOTE = "Estimated — based on the circulating supply you entered.";

function basisNote(quantity: number, purchasePrice: number): { costBasisNote?: string } {
  return quantity * purchasePrice > 0 ? {} : { costBasisNote: NO_BASIS_NOTE };
}

router.use(optionalAuth);
router.use(rateLimit({ bucket: "calc", max: 240, windowSeconds: 60 }));

const profitSchema = z.object({
  coinId: z.string().trim().min(1).optional(),
  quantity: z.number().positive("Enter an amount above zero."),
  purchasePrice: z.number().min(0),
  currentPrice: z.number().positive().optional(),
  targetPrice: z.number().positive("Enter a target price above zero."),
});

const marketCapSchema = z.object({
  coinId: z.string().trim().min(1),
  targetMarketCap: z.number().positive("Enter a market cap above zero."),
  quantity: z.number().min(0).default(0),
  purchasePrice: z.number().min(0).default(0),
  /** Overrides the live quote, so "what if it were at $x today" works here too. */
  currentPrice: z.number().positive().optional(),
  /** Spec 15 — fill a gap the provider left, or model a different float. */
  circulatingSupply: z.number().positive().optional(),
});

const whatIfSchema = z.object({
  coinId: z.string().trim().min(1),
  quantity: z.number().min(0),
  purchasePrice: z.number().min(0).default(0),
  from: z.number().positive().default(1_000_000),
  to: z.number().positive().default(1_000_000_000),
  steps: z.number().int().min(2).max(24).default(8),
  circulatingSupply: z.number().positive().optional(),
});

const goalSchema = z.object({
  coinId: z.string().trim().min(1),
  targetValue: z.number().positive("Enter a target value above zero."),
  quantity: z.number().positive("Enter how much you hold."),
  circulatingSupply: z.number().positive().optional(),
});

const scenariosSchema = z.object({
  coinId: z.string().trim().min(1),
  quantity: z.number().min(0),
  purchasePrice: z.number().min(0).default(0),
  marketCaps: z.array(z.number().positive()).min(1).max(24),
  circulatingSupply: z.number().positive().optional(),
});

/**
 * Circulating supply for a coin, plus the quote and symbol the caller will need
 * anyway. A figure the caller supplied wins over the provider's, so the optional
 * supply field can model a different float and not only fill a gap — but anything
 * that came from the caller is reported as `estimated` so the response says so in
 * words rather than passing a guess off as vendor data (spec 7/15).
 */
async function resolveSupply(
  coinId: string,
  override?: number,
): Promise<{ supply: number; estimated: boolean; price: number; symbol: string }> {
  const coin = await getCryptoProvider().getCoin(coinId);
  if (!coin) throw ApiError.coinNotFound(coinId);
  const quote = { price: coin.price, symbol: coin.symbol };

  if (override) return { ...quote, supply: override, estimated: true };
  if (coin.circulatingSupply) {
    return { ...quote, supply: coin.circulatingSupply, estimated: false };
  }
  throw ApiError.missingSupply(coinId);
}

/** Spec 14 — profit calculator. */
router.post(
  "/profit",
  validate(profitSchema),
  handler(async (req, res) => {
    const input = req.body as z.infer<typeof profitSchema>;

    let currentPrice = input.currentPrice;
    let symbol: string | undefined;

    if (currentPrice === undefined) {
      if (!input.coinId) {
        throw ApiError.badRequest("Provide either a current price or a coin to look one up.");
      }
      const coin = await getCryptoProvider().getCoin(input.coinId);
      if (!coin) throw ApiError.coinNotFound(input.coinId);
      currentPrice = coin.price;
      symbol = coin.symbol;
    }

    const result = calcProfit({
      quantity: input.quantity,
      purchasePrice: input.purchasePrice,
      currentPrice,
      targetPrice: input.targetPrice,
    });

    res.json({
      result: {
        ...result,
        currentPrice,
        distanceToTargetPercent: distanceToTarget(currentPrice, input.targetPrice),
        ...(symbol ? { symbol } : {}),
      },
      ...basisNote(input.quantity, input.purchasePrice),
      disclaimer: DISCLAIMER,
    });
  }),
);

/** Spec 15 — Price = Market Cap / Circulating Supply. */
router.post(
  "/market-cap",
  validate(marketCapSchema),
  handler(async (req, res) => {
    const input = req.body as z.infer<typeof marketCapSchema>;
    const { supply, estimated, price: quoted, symbol } = await resolveSupply(
      input.coinId,
      input.circulatingSupply,
    );

    // An override reprices "now" as well as the target, so the current cap, the
    // multiple and the distance all move with it rather than half the response
    // describing the live market and half describing the hypothetical.
    const price = input.currentPrice ?? quoted;

    const targetPrice = priceFromMarketCap(input.targetMarketCap, supply);
    const currentMarketCap = marketCapFromPrice(price, supply);

    const profit =
      input.quantity > 0
        ? calcProfit({
            quantity: input.quantity,
            purchasePrice: input.purchasePrice,
            currentPrice: price,
            targetPrice,
          })
        : null;

    res.json({
      result: {
        symbol,
        currentPrice: price,
        currentMarketCap,
        targetMarketCap: input.targetMarketCap,
        targetPrice,
        circulatingSupply: supply,
        multiple: price > 0 ? targetPrice / price : 0,
        distanceToTargetPercent: distanceToTarget(price, targetPrice),
        ...(profit ? { profit } : {}),
      },
      supplyEstimated: estimated,
      ...(estimated ? { supplyNote: OVERRIDE_SUPPLY_NOTE } : {}),
      ...(profit ? basisNote(input.quantity, input.purchasePrice) : {}),
      disclaimer: DISCLAIMER,
    });
  }),
);

/** Spec 16 — the what-if slider, $1M to $1B by default. */
router.post(
  "/what-if",
  validate(whatIfSchema),
  handler(async (req, res) => {
    const input = req.body as z.infer<typeof whatIfSchema>;
    const { supply, estimated, price, symbol } = await resolveSupply(
      input.coinId,
      input.circulatingSupply,
    );

    if (input.to <= input.from) {
      throw ApiError.invalidTarget("The upper market cap has to be above the lower one.");
    }

    const ladder = scenarioLadder(input.from, input.to, input.steps);
    const scenarios = buildScenarios(
      ladder.map((marketCap, i) => ({ id: `step-${i}`, marketCap })),
      { circulatingSupply: supply, quantity: input.quantity, purchasePrice: input.purchasePrice },
    );

    res.json({
      symbol,
      currentPrice: price,
      currentMarketCap: marketCapFromPrice(price, supply),
      scenarios,
      supplyEstimated: estimated,
      ...(estimated ? { supplyNote: OVERRIDE_SUPPLY_NOTE } : {}),
      ...basisNote(input.quantity, input.purchasePrice),
      disclaimer: DISCLAIMER,
    });
  }),
);

/** Spec 18 — the scenario table for caller-chosen market caps. */
router.post(
  "/scenarios",
  validate(scenariosSchema),
  handler(async (req, res) => {
    const input = req.body as z.infer<typeof scenariosSchema>;
    const { supply, estimated, price, symbol } = await resolveSupply(
      input.coinId,
      input.circulatingSupply,
    );

    const scenarios = buildScenarios(
      input.marketCaps.map((marketCap, i) => ({ id: `scenario-${i}`, marketCap })),
      { circulatingSupply: supply, quantity: input.quantity, purchasePrice: input.purchasePrice },
    );

    res.json({
      symbol,
      currentPrice: price,
      scenarios,
      supplyEstimated: estimated,
      ...(estimated ? { supplyNote: OVERRIDE_SUPPLY_NOTE } : {}),
      ...basisNote(input.quantity, input.purchasePrice),
      disclaimer: DISCLAIMER,
    });
  }),
);

/** Spec 17 — "I want my holdings to be worth $X". */
router.post(
  "/goal-plan",
  validate(goalSchema),
  handler(async (req, res) => {
    const input = req.body as z.infer<typeof goalSchema>;
    const coin = await getCryptoProvider().getCoin(input.coinId);
    if (!coin) throw ApiError.coinNotFound(input.coinId);

    // Same precedence as `resolveSupply`: the caller's figure wins, and saying so
    // is what keeps it labelled an estimate. Unlike the other routes this one does
    // not throw without a supply — the required *price* is still exact, only the
    // required market cap is unknowable.
    const supply = input.circulatingSupply ?? coin.circulatingSupply;
    const supplyEstimated = input.circulatingSupply !== undefined;
    const plan = planGoal({
      targetValue: input.targetValue,
      quantity: input.quantity,
      currentPrice: coin.price,
      ...(supply === undefined ? {} : { circulatingSupply: supply }),
    });

    res.json({
      plan: { ...plan, symbol: coin.symbol, currentPrice: coin.price },
      supplyEstimated,
      // Two different situations, two different sentences: the cap was worked out
      // from a supply the user gave us, or there's no cap because we won't guess
      // a supply (spec 15). `requiredPrice` is unaffected either way.
      ...(supplyEstimated
        ? { supplyNote: OVERRIDE_SUPPLY_NOTE }
        : plan.requiredMarketCap === null
          ? { supplyNote: "Market cap unavailable — circulating supply unknown." }
          : {}),
      disclaimer: DISCLAIMER,
    });
  }),
);

export default router;
