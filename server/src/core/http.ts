import { createLogger } from "../config/logger.js";
import { ApiError } from "./ApiError.js";

const log = createLogger("http");

export class ProviderRateLimitError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super(`Provider rate limited; retry after ${retryAfterSeconds}s`);
    this.name = "ProviderRateLimitError";
  }
}

export class ProviderHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Provider responded ${status}`);
    this.name = "ProviderHttpError";
  }
}

/** In-flight requests keyed by URL, so N concurrent callers make one call. */
const inFlight = new Map<string, Promise<unknown>>();

export interface FetchJsonOptions {
  headers?: Record<string, string>;
  /** Total attempts including the first. */
  attempts?: number;
  timeoutMs?: number;
  /** Collapse concurrent identical requests into one (spec 33). */
  dedupe?: boolean;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfter(header: string | null, fallbackSeconds: number): number {
  if (!header) return fallbackSeconds;
  const asSeconds = Number(header);
  if (Number.isFinite(asSeconds)) return Math.max(1, asSeconds);
  const asDate = Date.parse(header);
  if (!Number.isNaN(asDate)) return Math.max(1, Math.ceil((asDate - Date.now()) / 1000));
  return fallbackSeconds;
}

async function fetchJsonOnce<T>(url: string, options: FetchJsonOptions): Promise<T> {
  const { headers = {}, timeoutMs = 10_000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", ...headers },
      signal: controller.signal,
    });

    if (res.status === 429) {
      throw new ProviderRateLimitError(parseRetryAfter(res.headers.get("retry-after"), 60));
    }
    if (!res.ok) {
      throw new ProviderHttpError(res.status, (await res.text()).slice(0, 500));
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches JSON with exponential backoff on transient failures. 429 is never
 * retried in-line — the caller should serve cached data instead of queueing up
 * behind a provider that has already told us to back off.
 */
export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { attempts = 3, dedupe = true } = options;

  const run = async (): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await fetchJsonOnce<T>(url, options);
      } catch (err) {
        lastError = err;

        if (err instanceof ProviderRateLimitError) throw err;

        // 4xx other than 429 means our request is wrong; retrying won't fix it.
        if (err instanceof ProviderHttpError && err.status < 500) throw err;

        if (attempt < attempts) {
          const backoff = 2 ** (attempt - 1) * 400 + Math.floor(Math.random() * 200);
          log.warn(`${url} failed (attempt ${attempt}/${attempts}), retrying in ${backoff}ms`);
          await sleep(backoff);
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  };

  if (!dedupe) return run();

  const existing = inFlight.get(url) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = run().finally(() => inFlight.delete(url));
  inFlight.set(url, promise);
  return promise;
}

/** Converts a provider-layer failure into a safe, user-facing API error. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof ProviderRateLimitError) {
    return ApiError.providerRateLimited(err.retryAfterSeconds);
  }
  if (err instanceof ProviderHttpError) return ApiError.providerUnavailable();
  if (err instanceof Error && err.name === "AbortError") {
    return ApiError.providerUnavailable("Market data request timed out.");
  }
  return ApiError.internal("Something went wrong on our side.", err);
}

/** JSON-RPC helper shared by the Solana and EVM wallet providers. */
export async function rpcCall<T>(
  url: string,
  method: string,
  params: unknown[],
  timeoutMs = 12_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      throw new ProviderRateLimitError(parseRetryAfter(res.headers.get("retry-after"), 30));
    }
    if (!res.ok) throw new ProviderHttpError(res.status, (await res.text()).slice(0, 300));

    const body = (await res.json()) as { result?: T; error?: { message?: string } };
    if (body.error) throw new Error(body.error.message ?? "RPC error");
    if (body.result === undefined) throw new Error("RPC returned no result");
    return body.result;
  } finally {
    clearTimeout(timer);
  }
}
