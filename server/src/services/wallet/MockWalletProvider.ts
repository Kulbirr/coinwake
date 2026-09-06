import type { TokenBalance, WalletChain, WalletTransaction } from "../../core/types.js";
import { isWellFormedAddress, verifyWalletSignature } from "./signature.js";
import type { WalletProvider } from "./WalletProvider.js";

/** Deterministic per-address pseudo-random, so a demo wallet keeps its balances. */
function seeded(address: string, salt: string): number {
  let h = 2166136261;
  const input = `${address}:${salt}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Development wallet provider. Returns plausible read-only balances for any
 * address without touching a chain, so wallet-connect flows can be exercised
 * with no RPC endpoint configured.
 *
 * Balances and transactions are invented; signatures are not. Ownership proofs go
 * through the same real verification as production (see `signature.ts`), because a
 * flow that accepts a bogus signature locally teaches you the wrong thing about
 * whether your client works. `env.ts` still keeps this provider out of production
 * by defaulting WALLET_PROVIDER to live when NODE_ENV is production.
 */
export class MockWalletProvider implements WalletProvider {
  readonly name = "mock";

  supports(): boolean {
    return true;
  }

  isValidAddress(chain: WalletChain, address: string): boolean {
    return isWellFormedAddress(chain, address);
  }

  async verifySignature(input: {
    chain: WalletChain;
    address: string;
    message: string;
    signature: string;
  }): Promise<boolean> {
    return verifyWalletSignature(input);
  }

  async getBalances(chain: WalletChain, address: string): Promise<TokenBalance[]> {
    if (chain === "solana") {
      return [
        {
          coinId: "solana",
          symbol: "SOL",
          name: "Solana",
          quantity: Number((2 + seeded(address, "sol") * 40).toFixed(4)),
          decimals: 9,
        },
        {
          coinId: "bonk",
          symbol: "BONK",
          name: "Bonk",
          quantity: Math.round(seeded(address, "bonk") * 90_000_000),
          contract: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          decimals: 5,
        },
      ];
    }

    return [
      {
        coinId: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        quantity: Number((0.2 + seeded(address, "eth") * 6).toFixed(5)),
        decimals: 18,
      },
      {
        coinId: "pepe",
        symbol: "PEPE",
        name: "Pepe",
        quantity: Math.round(seeded(address, "pepe") * 400_000_000),
        contract: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
        decimals: 18,
      },
    ];
  }

  async getTransactions(
    chain: WalletChain,
    address: string,
    limit = 10,
  ): Promise<WalletTransaction[]> {
    const symbol = chain === "solana" ? "SOL" : "ETH";
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();

    return Array.from({ length: Math.min(limit, 6) }, (_, i) => {
      const r = seeded(address, `tx${i}`);
      return {
        hash: `mock-${chain}-${i}-${address.slice(0, 6)}`,
        timestamp: now - (i + 1) * day * 9,
        direction: r > 0.35 ? ("IN" as const) : ("OUT" as const),
        symbol,
        quantity: Number((r * (chain === "solana" ? 12 : 1.5)).toFixed(4)),
        priceUsd: Number(((chain === "solana" ? 90 : 2100) * (0.6 + r)).toFixed(2)),
      };
    });
  }
}
