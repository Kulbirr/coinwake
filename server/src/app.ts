import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { corsOrigins, isProd } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { optionalAuth } from "./middleware/auth.js";
import routes from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  // Behind a proxy (Render/Fly/nginx) req.ip must come from X-Forwarded-For or
  // every client shares one rate-limit bucket.
  if (isProd) app.set("trust proxy", 1);

  app.disable("x-powered-by");

  app.use(
    helmet({
      // This server is a JSON API; a CSP here would only constrain responses no
      // browser renders, and it must not interfere with the frontend's own.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Same-origin and server-to-server requests have no Origin header.
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed"));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "100kb" }));

  // Identify before limiting so signed-in users get a per-user bucket rather
  // than sharing one with everyone behind the same NAT.
  app.use(optionalAuth);
  app.use(rateLimit({ bucket: "global", max: 600, windowSeconds: 60 }));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
