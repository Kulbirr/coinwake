import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async route handler so a rejected promise reaches the error
 * middleware instead of hanging the request.
 */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void fn(req as unknown as T, res, next).catch(next);
  };
}
