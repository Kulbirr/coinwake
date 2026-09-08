import type { Request, RequestHandler } from "express";

import { createLogger } from "../config/logger.js";
import { ApiError } from "../core/ApiError.js";
import { getCache } from "../db/redis.js";

const log = createLogger("ratelimit");

export interface RateLimitOptions {
  /** Requests allowed per window. */
  max: number;
  windowSeconds: number;
  /** Bucket name, so different routes don't share a counter. */
  bucket: string;
  /** Defaults to the user id when signed in, otherwise the client IP. */
  key?: (req: Request) => string;
}

function defaultKey(req: Request): string {
  return req.userId ?? req.ip ?? "anonymous";
}

/**
 * Spec 33 — protects both us and our upstream provider. Backed by Redis so the
 * limit holds across replicas; with the in-process fallback it is per-instance,
 * which is why REDIS_URL matters before scaling out.
 */
export function rateLimit(options: RateLimitOptions): RequestHandler {
  const { max, windowSeconds, bucket, key = defaultKey } = options;

  return (req, res, next) => {
    const cacheKey = `ratelimit:${bucket}:${key(req)}`;

    getCache()
      .incrWithTtl(cacheKey, windowSeconds)
      .then((count) => {
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - count)));

        if (count > max) {
          next(ApiError.rateLimited(windowSeconds));
          return;
        }
        next();
      })
      .catch((err: unknown) => {
        // Never lock users out because the cache is unreachable.
        log.warn(`Rate limit check failed, allowing request: ${(err as Error).message}`);
        next();
      });
  };
}
