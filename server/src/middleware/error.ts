import type { ErrorRequestHandler, RequestHandler } from "express";
import { MongoServerError } from "mongodb";
import { Error as MongooseError } from "mongoose";

import { isProd } from "../config/env.js";
import { createLogger } from "../config/logger.js";
import { ApiError } from "../core/ApiError.js";
import { ProviderHttpError, ProviderRateLimitError } from "../core/http.js";

const log = createLogger("error");

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`No route for ${req.method} ${req.path}.`));
};

/**
 * Converts anything thrown anywhere in the stack into a safe response body.
 *
 * Spec 35: users never see a raw API or database error. Only ApiError fields are
 * serialised; everything else is logged server-side and reported as a generic
 * failure with a stable code the client can branch on.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const apiError = normalise(err);

  if (apiError.status >= 500) {
    log.error(`${apiError.code}: ${(err as Error)?.message ?? "unknown"}`);
    if (!isProd && err instanceof Error && err.stack) log.debug(err.stack);
  }

  if (apiError.retryAfter !== undefined) {
    res.setHeader("Retry-After", String(apiError.retryAfter));
  }

  res.status(apiError.status).json({
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.hint === undefined ? {} : { hint: apiError.hint }),
      ...(apiError.details === undefined ? {} : { details: apiError.details }),
      ...(apiError.retryAfter === undefined ? {} : { retryAfter: apiError.retryAfter }),
    },
  });
};

function normalise(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof ProviderRateLimitError) {
    return ApiError.providerRateLimited(err.retryAfterSeconds);
  }
  if (err instanceof ProviderHttpError) return ApiError.providerUnavailable();

  if (err instanceof MongooseError.ValidationError) {
    return new ApiError(422, "VALIDATION_FAILED", "Please check the highlighted fields.", {
      details: Object.entries(err.errors).map(([path, issue]) => ({
        path,
        message: issue.message,
      })),
    });
  }

  if (err instanceof MongooseError.CastError) {
    return ApiError.badRequest("That id doesn't look right.");
  }

  // 11000 is a duplicate key; the index name would leak schema details, so don't.
  if (err instanceof MongoServerError && err.code === 11000) {
    return ApiError.conflict("That already exists.");
  }

  if (err instanceof Error && err.name === "AbortError") {
    return ApiError.providerUnavailable("That request took too long.");
  }

  if (err instanceof SyntaxError && "body" in err) {
    return ApiError.badRequest("We couldn't read that request body.");
  }

  return ApiError.internal();
}
