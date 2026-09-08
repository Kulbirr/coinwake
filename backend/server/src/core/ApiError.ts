/**
 * Every error the API returns to a client is an ApiError with a stable machine
 * `code`. Spec 35: users never see a raw provider or database error — the error
 * middleware only serialises these fields, and anything unrecognised becomes a
 * generic 500.
 */
export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "COIN_NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_RATE_LIMITED"
  | "INSUFFICIENT_DATA"
  | "MISSING_SUPPLY"
  | "INVALID_TARGET"
  | "WALLET_VERIFICATION_FAILED"
  | "PUSH_NOT_CONFIGURED"
  | "INTERNAL";

export interface ApiErrorOptions {
  /** Safe, user-facing hint rendered under the message. */
  hint?: string;
  /** Seconds until the client should retry (sent as Retry-After). */
  retryAfter?: number;
  /** Field-level validation problems. */
  details?: Array<{ path: string; message: string }>;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly hint?: string;
  readonly retryAfter?: number;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(status: number, code: ErrorCode, message: string, options: ApiErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    if (options.hint !== undefined) this.hint = options.hint;
    if (options.retryAfter !== undefined) this.retryAfter = options.retryAfter;
    if (options.details !== undefined) this.details = options.details;
  }

  static badRequest(message: string, options?: ApiErrorOptions) {
    return new ApiError(400, "BAD_REQUEST", message, options);
  }

  static unauthorized(message = "You need to sign in to do that.", options?: ApiErrorOptions) {
    return new ApiError(401, "UNAUTHORIZED", message, options);
  }

  static forbidden(message = "You don't have access to that.", options?: ApiErrorOptions) {
    return new ApiError(403, "FORBIDDEN", message, options);
  }

  static notFound(message = "Not found.", options?: ApiErrorOptions) {
    return new ApiError(404, "NOT_FOUND", message, options);
  }

  static coinNotFound(coinId: string) {
    return new ApiError(404, "COIN_NOT_FOUND", `We don't have data for "${coinId}".`, {
      hint: "Search the market to find the right coin.",
    });
  }

  static conflict(message: string, options?: ApiErrorOptions) {
    return new ApiError(409, "CONFLICT", message, options);
  }

  static rateLimited(retryAfter: number) {
    return new ApiError(429, "RATE_LIMITED", "Too many requests — slow down for a moment.", {
      retryAfter,
    });
  }

  static providerUnavailable(message = "Market data is temporarily unavailable.") {
    return new ApiError(503, "PROVIDER_UNAVAILABLE", message, {
      hint: "We're showing the last known values. Try again shortly.",
    });
  }

  static providerRateLimited(retryAfter = 60) {
    return new ApiError(
      503,
      "PROVIDER_RATE_LIMITED",
      "Our market data provider is rate limiting us.",
      { hint: "Prices may be a little stale for the next minute.", retryAfter },
    );
  }

  static missingSupply(coinId: string) {
    return new ApiError(
      422,
      "MISSING_SUPPLY",
      `Circulating supply is unavailable for "${coinId}".`,
      { hint: "Enter a circulating supply manually to calculate a market-cap target." },
    );
  }

  static invalidTarget(message: string) {
    return new ApiError(422, "INVALID_TARGET", message);
  }

  static insufficientData(message: string, hint?: string) {
    return new ApiError(422, "INSUFFICIENT_DATA", message, {
      ...(hint === undefined ? {} : { hint }),
    });
  }

  static walletVerificationFailed(
    message = "We couldn't verify that signature.",
    hint = "Make sure you approved the request with the same wallet you're connecting.",
  ) {
    return new ApiError(400, "WALLET_VERIFICATION_FAILED", message, { hint });
  }

  static pushNotConfigured() {
    return new ApiError(503, "PUSH_NOT_CONFIGURED", "Push notifications aren't set up yet.", {
      hint: "Alerts will still show in the app and sound the alarm while it's open.",
    });
  }

  static internal(message = "Something went wrong on our side.", cause?: unknown) {
    return new ApiError(500, "INTERNAL", message, { ...(cause === undefined ? {} : { cause }) });
  }
}
