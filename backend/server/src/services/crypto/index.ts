import { env } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { CachedCryptoProvider } from "./CachedCryptoProvider.js";
import { CoinGeckoProvider } from "./CoinGeckoProvider.js";
import { CompositeCryptoProvider } from "./CompositeCryptoProvider.js";
import { DexScreenerProvider } from "./DexScreenerProvider.js";
import type { CryptoDataProvider } from "./CryptoDataProvider.js";
import { MockCryptoProvider } from "./MockCryptoProvider.js";

const log = createLogger("crypto");

let provider: CachedCryptoProvider | null = null;
let mock: MockCryptoProvider | null = null;

/**
 * The single place that decides which market-data vendor the app talks to
 * (spec 2). Everything downstream depends on the interface, never on CoinGecko.
 *
 * When CRYPTO_PROVIDER=coingecko, we wrap CoinGecko + DexScreener in a
 * CompositeCryptoProvider so sol: IDs route to DexScreener and bare slugs
 * route to CoinGecko. This gives us live Solana DEX tokens with alert support
 * while keeping the main search CoinGecko-only.
 */
export function getCryptoProvider(): CachedCryptoProvider {
  if (provider) return provider;

  let base: CryptoDataProvider;
  if (env.CRYPTO_PROVIDER === "coingecko") {
    const coingecko = new CoinGeckoProvider();
    const dexscreener = new DexScreenerProvider();
    base = new CompositeCryptoProvider(coingecko, dexscreener);
    log.info("Using composite provider: CoinGecko (primary) + DexScreener (Solana DEX)");
  } else {
    mock = new MockCryptoProvider();
    base = mock;
    log.info(`Using the ${base.name} market data provider.`);
  }

  provider = new CachedCryptoProvider(base);
  return provider;
}

/**
 * The mock provider only, when it is the active one. The price service uses this
 * to advance simulated prices each tick; with a live vendor it returns null and
 * the poller just fetches.
 */
export function getMockProvider(): MockCryptoProvider | null {
  getCryptoProvider();
  return mock;
}

export type { CryptoDataProvider };
