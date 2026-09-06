import { clearSession, getAccessToken, getRefreshToken, setSession } from "./session";
import type { TokenPair } from "./types";

/**
 * The one place the frontend talks HTTP.
 *
 * Everything a component sees is either data or an ApiClientError whose `message`
 * is already safe to render: the server never sends a raw database or vendor
 * error (spec 35), and the failures it can't describe — offline, DNS, timeout —
 * get their own wording here rather than leaking `TypeError: Failed to fetch`.
 */

/** Set VITE_API_URL when the API isn't on localhost:4000 (see .env.example). */
const BASE_URL = (
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

export function apiBaseUrl(): string {
  return BASE_URL;
}

/** ws(s):// origin for the realtime feed, derived so there's one URL to configure. */
export function socketUrl(): string {
  const base = BASE_URL.replace(/\/api$/, "");
  return `${base.replace(/^http/, "ws")}/ws`;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  hint?: string;
  details?: Array<{ path: string; message: string }>;
  retryAfter?: number;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly hint?: string;
  readonly details?: Array<{ path: string; message: string }>;
  readonly retryAfter?: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = body.code;
    if (body.hint !== undefined) this.hint = body.hint;
    if (body.details !== undefined) this.details = body.details;
    if (body.retryAfter !== undefined) this.retryAfter = body.retryAfter;
  }

  /** Field-level messages for a form, keyed by field name. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const issue of this.details ?? []) {
      // Zod paths arrive dotted ("notify.push"); forms key on the leaf.
      const key = issue.path.split(".").pop();
      if (key) out[key] = issue.message;
    }
    return out;
  }
}

function networkError(): ApiClientError {
  return new ApiClientError(0, {
    code: "NETWORK_UNAVAILABLE",
    message: "We couldn't reach CoinWake.",
    hint: "Check your connection and try again.",
  });
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Send the access token. On by default; off for public and auth endpoints. */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Refreshes the access token, collapsing concurrent callers onto one request.
 *
 * Without the single flight, a screen that fires five queries at once would send
 * five refreshes; the first rotates the token and the rest race against it.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        // The refresh token is spent or revoked — this session is over.
        clearSession();
        return false;
      }

      const data = (await res.json()) as { tokens: TokenPair };
      setSession(data.tokens);
      return true;
    } catch {
      // A network blip is not a revoked session; keep the tokens and let the
      // caller surface a connection error instead of signing the user out.
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function send(
  path: string,
  options: RequestOptions,
  token: string | null,
): Promise<Response> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (token) headers["authorization"] = `Bearer ${token}`;

  return fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    ...(options.signal ? { signal: options.signal } : {}),
  });
}

async function toError(res: Response): Promise<ApiClientError> {
  let body: ApiErrorBody = {
    code: "REQUEST_FAILED",
    message: "Something went wrong. Please try again.",
  };
  try {
    const parsed = (await res.json()) as { error?: ApiErrorBody };
    if (parsed.error?.message) body = parsed.error;
  } catch {
    // A non-JSON body means a proxy or crash, not our error handler. The generic
    // message above is the right thing to show.
  }
  return new ApiClientError(res.status, body);
}

/**
 * Performs a request and returns the parsed body.
 *
 * On a 401 with a stored refresh token it refreshes once and replays the request,
 * so an expired access token is invisible to callers.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const useAuth = options.auth !== false;

  let res: Response;
  try {
    res = await send(path, options, useAuth ? getAccessToken() : null);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw networkError();
  }

  if (res.status === 401 && useAuth && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      try {
        res = await send(path, options, getAccessToken());
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        throw networkError();
      }
    }
  }

  if (!res.ok) throw await toError(res);

  // 204 and friends have no body; callers of those declare `void`.
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}

/** Anything renderable as a user-facing message, whatever was thrown. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiClientError) return err.message;
  if (err instanceof Error && err.name === "AbortError") return "That request was cancelled.";
  return "Something went wrong. Please try again.";
}

/** The extra sentence a toast can show under the message, when there is one. */
export function errorHint(err: unknown): string | undefined {
  return err instanceof ApiClientError ? err.hint : undefined;
}
