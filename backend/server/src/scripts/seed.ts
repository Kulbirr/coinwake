/**
 * Seeds the demo dataset (spec 42) against a real MONGODB_URI.
 *
 *   npm run seed
 *
 * With no MONGODB_URI the server uses an in-memory MongoDB that lives and dies
 * with its process, so seeding from here would write to a database nothing else
 * can see. In that case `npm run dev` seeds itself on first boot instead — this
 * script says so rather than pretending to have done something.
 */
import mongoose from "mongoose";

import { env, isProd } from "../config/env.js";
import { createLogger } from "../config/logger.js";
import { connectMongo, disconnectMongo } from "../db/mongo.js";
import { seedDemoData } from "../db/seed.js";

const log = createLogger("seed");

async function main(): Promise<void> {
  if (isProd) {
    log.error("Refusing to seed in production.");
    process.exit(1);
  }

  if (!env.MONGODB_URI) {
    log.warn("MONGODB_URI is not set, so there is no shared database to seed.");
    log.warn("Just run `npm run dev` — it seeds the in-memory database on first boot.");
    process.exit(0);
  }

  await connectMongo();
  const result = await seedDemoData();

  log.info(`Demo login: ${result.email} / ${result.password}`);
  log.info(`Crypto provider: ${env.CRYPTO_PROVIDER}. Start the API with: npm run dev`);
}

main()
  .then(() => disconnectMongo())
  .then(() => process.exit(0))
  .catch(async (err: unknown) => {
    log.error("Seed failed", err);
    if (mongoose.connection.readyState === 1) await disconnectMongo();
    process.exit(1);
  });
