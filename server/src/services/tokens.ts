import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../core/ApiError.js";
import type { UserDocument } from "../models/User.js";

export interface AccessTokenClaims {
  sub: string;
  type: "access";
}

export interface RefreshTokenClaims {
  sub: string;
  type: "refresh";
  /** Matches User.tokenVersion; a bump invalidates every outstanding refresh token. */
  v: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export function issueTokens(user: UserDocument): TokenPair {
  const sub = user.id as string;

  const accessToken = jwt.sign({ sub, type: "access" } satisfies AccessTokenClaims, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions);

  const refreshToken = jwt.sign(
    { sub, type: "refresh", v: user.tokenVersion } satisfies RefreshTokenClaims,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_TTL } as SignOptions,
  );

  return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_TTL };
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  try {
    const claims = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenClaims;
    if (claims.type !== "access") throw new Error("wrong token type");
    return claims;
  } catch {
    throw ApiError.unauthorized("Your session has expired. Please sign in again.");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  try {
    const claims = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenClaims;
    if (claims.type !== "refresh") throw new Error("wrong token type");
    return claims;
  } catch {
    throw ApiError.unauthorized("Please sign in again.");
  }
}
