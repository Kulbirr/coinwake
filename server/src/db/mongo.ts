import mongoose from "mongoose";

import { env } from "../config/env.js";
import { createLogger } from "../config/logger.js";

const log = createLogger("mongo");

/**
 * The database both connection paths land in. Atlas's "Connect your application"
 * string names no database, and Mongoose quietly falls back to `test` in that
 * case — so without this the in-memory fallback would write to `coinwake` while
 * a pasted Atlas URI wrote to `test`, and moving between them would look like
 * the data had vanished.
 */
const DEFAULT_DB_NAME = "coinwake";

/** Holds the in-memory server handle so we can stop it on shutdown. */
let memoryServer: { stop: () => Promise<unknown> } | null = null;

/**
 * The database a connection string names, if it names one.
 *
 * Credentials come off first: a password may contain an encoded `@` but a host
 * can't, so the last `@` ahead of the query string ends the credentials. MongoDB
 * requires `/` and `?` in a password to be percent-encoded, so the first literal
 * `/` after that begins the path.
 */
function databaseFromUri(uri: string): string | undefined {
  const afterScheme = uri.slice(uri.indexOf("://") + 3);
  const beforeQuery = afterScheme.split("?")[0] ?? "";
  const hostAndPath = beforeQuery.slice(beforeQuery.lastIndexOf("@") + 1);
  const slash = hostAndPath.indexOf("/");
  const name = slash === -1 ? "" : hostAndPath.slice(slash + 1);
  return name === "" ? undefined : name;
}

/**
 * Turns the two failures every Atlas setup hits into instructions. The driver's
 * own message lists SRV hostnames and mentions neither cause, and the reader
 * here is an operator looking at a log rather than a user looking at a screen —
 * so this is additional detail, not a replacement for spec 35's user-facing
 * wording.
 */
function explainConnectionFailure(err: unknown): string | undefined {
  const message = err instanceof Error ? err.message : String(err);

  if (/bad auth|authentication failed/i.test(message)) {
    return (
      "The cluster rejected those credentials. Check the database user exists, " +
      "and percent-encode any @ : / ? # or % in its password (@ becomes %40)."
    );
  }
  if (/serverselection|etimedout|econnrefused|querysrv|enotfound/i.test(message)) {
    return (
      "Could not reach the cluster. On Atlas this is nearly always the IP " +
      "allowlist — Network Access → Add IP Address → Add Current IP Address."
    );
  }
  return undefined;
}

/**
 * Connects to MONGODB_URI when set. With no URI we boot an in-memory MongoDB so
 * a fresh clone runs with zero infrastructure — the schema and query code are
 * identical either way, only the storage is ephemeral. Production refuses to
 * start without a real URI (see config/env.ts).
 */
export async function connectMongo(): Promise<void> {
  let uri = env.MONGODB_URI;

  if (!uri) {
    if (env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is required in production");
    }
    log.warn("MONGODB_URI is not set — starting an in-memory MongoDB (data is lost on restart).");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const server = await MongoMemoryServer.create();
      memoryServer = server;
      uri = server.getUri(DEFAULT_DB_NAME);
    } catch (err) {
      log.error(
        "Could not start the in-memory MongoDB. Install mongodb-memory-server " +
          "or set MONGODB_URI to a real MongoDB instance.",
        err,
      );
      throw err;
    }
  }

  // Only supply a database the URI leaves unnamed. One that's spelled out is a
  // deliberate choice and outranks our default.
  const dbName = databaseFromUri(uri) ?? DEFAULT_DB_NAME;

  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10_000,
      // Alerts are evaluated on a timer; a small pool is plenty and keeps us
      // inside free-tier Atlas connection limits.
      maxPoolSize: 10,
    });
  } catch (err) {
    const hint = explainConnectionFailure(err);
    if (hint) log.error(hint);
    throw err;
  }

  log.info(`Connected to MongoDB (${memoryServer ? "in-memory" : "external"}, db=${dbName}).`);

  mongoose.connection.on("disconnected", () => log.warn("MongoDB disconnected."));
  mongoose.connection.on("reconnected", () => log.info("MongoDB reconnected."));
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
