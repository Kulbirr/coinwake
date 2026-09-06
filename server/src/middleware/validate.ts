import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodErrorMap, type ZodTypeAny, type z } from "zod";

import { ApiError } from "../core/ApiError.js";

type Source = "body" | "query" | "params";

/**
 * Replaces zod's developer-facing defaults with sentences a user can act on,
 * because these land in `details[].message` and the UI shows them next to the
 * field — "Invalid enum value. Expected 'dark' | 'light', received 'neon'" is
 * exactly the raw error spec 35 forbids.
 *
 * This only fills gaps: zod resolves the authored message first
 * (`issueData.message ?? errorMap(...)`), so a schema that already says
 * "Use at least 8 characters." keeps saying it. Living here rather than on each
 * schema means the next field added can't forget to be readable.
 */
const humanErrors: ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined" || issue.received === "null") {
        return { message: "This field is required." };
      }
      if (issue.expected === "integer") return { message: "Enter a whole number." };
      if (issue.expected === "number") return { message: "Enter a number." };
      if (issue.expected === "boolean") return { message: "Choose on or off." };
      if (issue.expected === "string") return { message: "Enter some text." };
      return { message: "That isn't the right kind of value." };

    case "too_small":
      if (issue.type === "string") {
        return {
          message:
            issue.minimum === 1
              ? "This can't be empty."
              : `Use at least ${issue.minimum} characters.`,
        };
      }
      if (issue.type === "array") return { message: `Choose at least ${issue.minimum}.` };
      return {
        message: issue.inclusive
          ? `Enter ${issue.minimum} or more.`
          : `Enter a number above ${issue.minimum}.`,
      };

    case "too_big":
      if (issue.type === "string") {
        return { message: `Keep this to ${issue.maximum} characters or fewer.` };
      }
      if (issue.type === "array") return { message: `Choose ${issue.maximum} at most.` };
      return {
        message: issue.inclusive
          ? `Enter ${issue.maximum} or less.`
          : `Enter a number below ${issue.maximum}.`,
      };

    case "invalid_enum_value":
      return { message: `Choose one of: ${issue.options.join(", ")}.` };

    case "invalid_union_discriminator":
      return { message: `Choose one of: ${issue.options.map(String).join(", ")}.` };

    case "invalid_string":
      if (issue.validation === "url") return { message: "Enter a valid link." };
      if (issue.validation === "email") return { message: "Enter a valid email address." };
      return { message: "That isn't in the right format." };

    case "not_multiple_of":
      return { message: `Use a multiple of ${issue.multipleOf}.` };

    case "unrecognized_keys":
      return { message: "We don't recognise one of those fields." };

    default:
      // Includes `custom`, where a .refine() nearly always supplies its own
      // wording — and that wording wins over anything returned here.
      return { message: "That value isn't valid." };
  }
};

function toApiError(err: ZodError): ApiError {
  return new ApiError(422, "VALIDATION_FAILED", "Please check the highlighted fields.", {
    details: err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
}

/**
 * Validates and replaces one part of the request. Handlers can then treat the
 * parsed value as trusted, and clients get field-level errors instead of a
 * generic 400 (spec 35).
 */
export function validate<T extends ZodTypeAny>(schema: T, source: Source = "body"): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source], { errorMap: humanErrors });
    if (!result.success) {
      next(toApiError(result.error));
      return;
    }
    // Express 5 makes req.query a getter, so assign through defineProperty.
    if (source === "query") {
      Object.defineProperty(req, "query", { value: result.data, writable: true });
    } else {
      req[source] = result.data as never;
    }
    next();
  };
}

/** Reads a validated request part with its inferred type. */
export function parsed<T extends ZodTypeAny>(
  req: Request,
  _schema: T,
  source: Source = "body",
): z.infer<T> {
  return req[source] as z.infer<T>;
}

/** Wraps an async handler so rejections reach the error middleware. */
export function handler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
