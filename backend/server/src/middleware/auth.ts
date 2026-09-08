import type { NextFunction, Request, RequestHandler, Response } from "express";

import { ApiError } from "../core/ApiError.js";
import { User, type UserDocument } from "../models/User.js";
import { verifyAccessToken } from "../services/tokens.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by requireAuth/optionalAuth. Spec 36: every query scopes to this id. */
      user?: UserDocument;
      userId?: string;
    }
  }
}

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Spec 36 — all user-specific data is isolated by authenticated user id. Routes
 * behind this middleware must scope every query with `req.userId`; never accept
 * a user id from the request body or params.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = bearerToken(req);
  if (!token) {
    next(ApiError.unauthorized());
    return;
  }

  try {
    const claims = verifyAccessToken(token);
    req.userId = claims.sub;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Loads the full user document; use when settings or email are needed.
 *
 * `passwordHash` is deselected in the schema but included here, because
 * `toPublicUser` reports whether an account has a password at all — without it
 * every account would look password-less to the settings screen.
 */
export const loadUser: RequestHandler = (req, _res, next) => {
  if (!req.userId) {
    next(ApiError.unauthorized());
    return;
  }

  User.findById(req.userId)
    .select("+passwordHash")
    .then((user) => {
      if (!user) {
        next(ApiError.unauthorized("That account no longer exists."));
        return;
      }
      req.user = user;
      next();
    })
    .catch(next);
};

/** Attaches the user id when a valid token is present, but never rejects. */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = bearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    req.userId = verifyAccessToken(token).sub;
  } catch {
    // An invalid token on a public route is simply anonymous.
  }
  next();
};

/** Narrows `req.userId` for handlers that run behind requireAuth. */
export function currentUserId(req: Request): string {
  const id = req.userId;
  if (!id) throw ApiError.unauthorized();
  return id;
}
