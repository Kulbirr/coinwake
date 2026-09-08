import { Router } from "express";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { fullyDilutedValuation } from "../core/calc.js";
import { CHART_RANGES, type ChartRange } from "../core/types.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { handler, validate } from "../middleware/validate.js";
import { getCryptoProvider } from "../services/crypto/index.js";

const router: Router = Router();

// Market data is the most expensive thing we serve, so it gets its own bucket.
const marketLimiter = rateLimit({ bucket: "market", max: 120, windowSeconds: 60 });

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(250).default(50),
});

const searchQuery = z.object({
  q: z.string().trim().max(80).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const chartQuery = z.object({
  range: z.enum(CHART_RANGES as unknown as [ChartRange, ...ChartRange[]]).default("24H"),
});

router.use(marketLimiter);

router.get(
  "/",
  validate(listQuery, "query"),
  handler(async (req, res) => {
    const { limit } = req.query as unknown as z.infer<typeof listQuery>;
    res.json({ coins: await getCryptoProvider().listCoins(limit) });
  }),
);

router.get(
  "/search",
  validate(searchQuery, "query"),
  handler(async (req, res) => {
    const { q, limit } = req.query as unknown as z.infer<typeof searchQuery>;
    res.json({ results: await getCryptoProvider().searchCoins(q, limit) });
  }),
);

router.get(
  "/trending",
  validate(listQuery.partial(), "query"),
  handler(async (req, res) => {
    const limit = Number((req.query as { limit?: number }).limit ?? 6);
    res.json({ coins: await getCryptoProvider().getTrendingCoins(limit) });
  }),
);

router.get(
  "/:coinId",
  handler(async (req, res) => {
    const coinId = String(req.params["coinId"]);
    const coin = await getCryptoProvider().getCoin(coinId);
    if (!coin) throw ApiError.coinNotFound(coinId);

    // FDV is derived rather than trusted: providers disagree about whether an
    // uncapped token has one at all, and null is the honest answer (spec 3).
    const fdv =
      coin.fdv ??
      fullyDilutedValuation(coin.price, {
        ...(coin.maxSupply === undefined ? {} : { maxSupply: coin.maxSupply }),
        ...(coin.totalSupply === undefined ? {} : { totalSupply: coin.totalSupply }),
      }) ??
      undefined;

    res.json({ coin: { ...coin, ...(fdv === undefined ? {} : { fdv }) } });
  }),
);

router.get(
  "/:coinId/price",
  handler(async (req, res) => {
    const coinId = String(req.params["coinId"]);
    const quote = await getCryptoProvider().getPrice(coinId);
    if (!quote) throw ApiError.coinNotFound(coinId);
    res.json({ price: quote });
  }),
);

router.get(
  "/:coinId/market",
  handler(async (req, res) => {
    const coinId = String(req.params["coinId"]);
    const market = await getCryptoProvider().getMarketData(coinId);
    if (!market) throw ApiError.coinNotFound(coinId);
    res.json({ market });
  }),
);

router.get(
  "/:coinId/supply",
  handler(async (req, res) => {
    const coinId = String(req.params["coinId"]);
    const supply = await getCryptoProvider().getSupply(coinId);
    if (!supply) throw ApiError.coinNotFound(coinId);

    // An empty object means the provider has no supply figures at all — the
    // calculator needs to know that so it can ask the user instead (spec 15).
    const known = supply.circulatingSupply !== undefined;
    res.json({ supply, circulatingSupplyAvailable: known });
  }),
);

router.get(
  "/:coinId/chart",
  validate(chartQuery, "query"),
  handler(async (req, res) => {
    const coinId = String(req.params["coinId"]);
    const { range } = req.query as unknown as z.infer<typeof chartQuery>;

    const series = await getCryptoProvider().getHistoricalPrices(coinId, range);
    if (series.length === 0) {
      throw ApiError.insufficientData(
        "We don't have enough chart data for that range yet.",
        "Try a shorter range.",
      );
    }

    res.json({ range, points: series });
  }),
);

export default router;
