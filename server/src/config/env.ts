import "dotenv/config";
import { z } from "zod";

/**
 * Every environment variable the server reads is declared here and nowhere else.
 * Secrets stay on this side of the wire — the browser talks to this API, never
 * directly to CoinGecko or an RPC endpoint, so no third-party key is ever shipped
 * to the client.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:8080,http://localhost:5173"),

  // Checked here so a mistyped URI fails at boot with something actionable,
  // rather than as a ten-second server-selection timeout inside the driver.
  // An empty value is "unset" — that's the in-memory fallback, not an error.
  MONGODB_URI: z
    .string()
    .optional()
    .refine((v) => !v || /^mongodb(\+srv)?:\/\/\S+$/.test(v), {
      message:
        "must start with mongodb:// or mongodb+srv:// (Atlas → Connect → Drivers), with no spaces",
    })
    .refine((v) => !v?.includes("<"), {
      // Atlas hands the string over with a literal <db_password> still in it.
      message: "still has a <placeholder> in it — substitute the real database password",
    }),
  REDIS_URL: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(1).default("dev-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().min(1).default("dev-refresh-secret-change-me"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().optional(),

  CRYPTO_PROVIDER: z.enum(["mock", "coingecko"]).default("mock"),
  COINGECKO_BASE_URL: z.string().url().default("https://api.coingecko.com/api/v3"),
  COINGECKO_API_KEY: z.string().optional(),

  PRICE_POLL_INTERVAL_MS: z.coerce.number().int().min(5000).default(20_000),

  CACHE_TTL_PRICE: z.coerce.number().int().positive().default(20),
  CACHE_TTL_MARKET: z.coerce.number().int().positive().default(60),
  CACHE_TTL_METADATA: z.coerce.number().int().positive().default(86_400),
  CACHE_TTL_CHART: z.coerce.number().int().positive().default(900),

  WALLET_PROVIDER: z.enum(["mock", "live"]).default("mock"),
  SOLANA_RPC_URL: z.string().url().default("https://api.mainnet-beta.solana.com"),
  EVM_RPC_URL: z.string().url().default("https://eth.llamarpc.com"),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:alerts@coinwake.app"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  // eslint-disable-next-line no-console
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === "production";

export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/** Web Push only works once a VAPID keypair exists. */
export const pushEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);

if (isProd) {
  const weak: string[] = [];
  if (env.JWT_ACCESS_SECRET.startsWith("dev-")) weak.push("JWT_ACCESS_SECRET");
  if (env.JWT_REFRESH_SECRET.startsWith("dev-")) weak.push("JWT_REFRESH_SECRET");
  if (weak.length) {
    // eslint-disable-next-line no-console
    console.error(`Refusing to start in production with default secrets: ${weak.join(", ")}`);
    process.exit(1);
  }
  if (!env.MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.error("MONGODB_URI is required in production (the in-memory fallback is dev-only).");
    process.exit(1);
  }
  if (env.WALLET_PROVIDER === "mock") {
    // The mock provider accepts any signature, so it would let anyone claim any
    // address. Never in production.
    // eslint-disable-next-line no-console
    console.error("WALLET_PROVIDER=mock is not allowed in production; set it to 'live'.");
    process.exit(1);
  }
}
