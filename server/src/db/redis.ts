// Named import, not default: ioredis ships CJS types, and under NodeNext the
// default import resolves to the namespace object rather than the class.
import { Redis } from "ioredis";

import { env } from "../config/env.js";
import { createLogger } from "../config/logger.js";

const log = createLogger("cache");

/**
 * The subset of Redis the app actually uses. Keeping it this small means the
 * in-process fallback is a few lines rather than a reimplementation, and swapping
 * in Memcached/Upstash later is a single new class.
 */
export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  /** Returns the new counter value; sets the TTL on first increment. */
  incrWithTtl(key: string, ttlSeconds: number): Promise<number>;
  readonly kind: "redis" | "memory";
  close(): Promise<void>;
}

class RedisCache implements CacheClient {
  readonly kind = "redis" as const;

  constructor(private readonly client: Redis) {}

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number) {
    await this.client.set(key, value, "EX", ttlSeconds);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async incrWithTtl(key: string, ttlSeconds: number) {
    const [count] = await this.client
      .multi()
      .incr(key)
      .expire(key, ttlSeconds, "NX")
      .exec()
      .then((res) => (res ?? []).map((r) => r?.[1] as number));
    return Number(count ?? 1);
  }

  async close() {
    await this.client.quit();
  }
}

/**
 * Single-process TTL cache. Correct for local dev and a single container; it
 * cannot coordinate rate limits or cache across replicas, so REDIS_URL should be
 * set before scaling out.
 */
class MemoryCache implements CacheClient {
  readonly kind = "memory" as const;
  private readonly store = new Map<string, { value: string; expiresAt: number }>();
  private readonly sweeper: NodeJS.Timeout;

  constructor() {
    // Lazy expiry alone would let one-shot keys accumulate forever.
    this.sweeper = setInterval(() => this.sweep(), 60_000);
    this.sweeper.unref();
  }

  private sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
  }

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string) {
    this.store.delete(key);
  }

  async incrWithTtl(key: string, ttlSeconds: number) {
    const current = await this.get(key);
    const next = Number(current ?? 0) + 1;
    const existing = this.store.get(key);
    // Preserve the original window so a busy caller can't extend its own limit.
    const expiresAt = existing?.expiresAt ?? Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value: String(next), expiresAt });
    return next;
  }

  async close() {
    clearInterval(this.sweeper);
    this.store.clear();
  }
}

let cacheClient: CacheClient | null = null;

export function initCache(): CacheClient {
  if (cacheClient) return cacheClient;

  if (!env.REDIS_URL) {
    log.warn("REDIS_URL is not set — using an in-process cache (single instance only).");
    cacheClient = new MemoryCache();
    return cacheClient;
  }

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    lazyConnect: false,
    retryStrategy: (times) => Math.min(times * 500, 5_000),
  });

  client.on("error", (err: Error) => log.error(`Redis error: ${err.message}`));
  client.on("connect", () => log.info("Connected to Redis."));

  cacheClient = new RedisCache(client);
  return cacheClient;
}

export function getCache(): CacheClient {
  if (!cacheClient) return initCache();
  return cacheClient;
}

export async function closeCache(): Promise<void> {
  if (!cacheClient) return;
  await cacheClient.close();
  cacheClient = null;
}

/** JSON helpers — every caller stores JSON, so encode once here. */
export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await getCache().get(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    await getCache().del(key);
    return null;
  }
}

export async function cacheSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await getCache().set(key, JSON.stringify(value), ttlSeconds);
}
