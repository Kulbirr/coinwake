import { Router } from "express";
import { z } from "zod";

import { ApiError } from "../core/ApiError.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { handler, validate } from "../middleware/validate.js";
import { getCryptoProvider } from "../services/crypto/index.js";

const router: Router = Router();

// DexScreener search gets its own bucket (separate from main market limiter)
const dexLimiter = rateLimit({ bucket: "dex-search", max: 60, windowSeconds: 60 });

const searchQuery = z.object({
  q: z.string().trim().max(80).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

router.use(dexLimiter);

router.get(
  "/search",
  validate(searchQuery, "query"),
  handler(async (req, res) => {
    const { q, limit } = req.query as unknown as z.infer<typeof searchQuery>;

    // Only the DexScreener provider can serve this; the composite's searchCoins
    // delegates to primary (CoinGecko) on purpose. We reach through the cache
    // to the inner provider for the raw DexScreener search.
    const provider = getCryptoProvider();
    const inner = (provider as any).inner; // CompositeCryptoProvider
    if (!inner?.dexScreener?.searchCoins) {
      throw ApiError.providerUnavailable("DexScreener search not available");
    }

    const results = await inner.dexScreener.searchCoins(q, limit);
    res.json({ results });
  }),
);

export default router;