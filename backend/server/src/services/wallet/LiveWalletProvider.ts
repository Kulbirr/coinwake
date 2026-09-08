import { env } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { rpcCall } from "../../core/http.js";
import type { TokenBalance, WalletChain, WalletTransaction } from "../../core/types.js";
import { isWellFormedAddress, verifyWalletSignature } from "./signature.js";
import type { WalletProvider } from "./WalletProvider.js";

const log = createLogger("wallet-live");

/** Well-known SPL mints we can map onto our coin ids without an indexer. */
const SPL_MINTS: Record<string, { coinId: string | null; symbol: string; name: string }> = {
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    coinId: "bonk",
    symbol: "BONK",
    name: "Bonk",
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    coinId: null,
    symbol: "USDC",
    name: "USD Coin",
  },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    coinId: null,
    symbol: "USDT",
    name: "Tether",
  },
};

const LAMPORTS_PER_SOL = 1_000_000_000;
const WEI_PER_ETH = 1_000_000_000_000_000_000n;

interface SolTokenAccounts {
  value: Array<{
    account: {
      data: {
        parsed: {
          info: {
            mint: string;
            tokenAmount: { amount: string; decimals: number; uiAmount: number | null };
          };
        };
      };
    };
  }>;
}

interface SolSignature {
  signature: string;
  blockTime: number | null;
  err: unknown;
}

interface SolTransaction {
  blockTime: number | null;
  meta: {
    preBalances: number[];
    postBalances: number[];
  } | null;
  transaction: {
    message: {
      accountKeys: Array<string | { pubkey: string }>;
    };
  };
}

/**
 * Reads balances and transfers straight from public RPC (spec 4). Strictly
 * read-only: the only write-shaped operation anywhere near a wallet is verifying
 * a signature the user produced in their own wallet UI (spec 27).
 */
export class LiveWalletProvider implements WalletProvider {
  readonly name = "live";

  supports(chain: WalletChain): boolean {
    if (chain === "solana") return Boolean(env.SOLANA_RPC_URL);
    return Boolean(env.EVM_RPC_URL);
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
    return chain === "solana" ? this.solBalances(address) : this.evmBalances(address);
  }

  async getTransactions(
    chain: WalletChain,
    address: string,
    limit = 10,
  ): Promise<WalletTransaction[]> {
    if (chain === "solana") return this.solTransactions(address, limit);
    // Enumerating EVM transfers needs an indexer (Etherscan/Alchemy/Covalent);
    // plain JSON-RPC cannot do it. Returning nothing is the honest answer — the
    // portfolio then reports "Cost basis unavailable" rather than guessing.
    return [];
  }

  private async solBalances(address: string): Promise<TokenBalance[]> {
    const url = env.SOLANA_RPC_URL;
    if (!url) return [];

    const balances: TokenBalance[] = [];

    const lamports = await rpcCall<{ value: number }>(url, "getBalance", [address]);
    balances.push({
      coinId: "solana",
      symbol: "SOL",
      name: "Solana",
      quantity: lamports.value / LAMPORTS_PER_SOL,
      decimals: 9,
    });

    const tokens = await rpcCall<SolTokenAccounts>(url, "getTokenAccountsByOwner", [
      address,
      { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
      { encoding: "jsonParsed" },
    ]);

    for (const entry of tokens.value ?? []) {
      const info = entry.account.data.parsed.info;
      const quantity = info.tokenAmount.uiAmount ?? 0;
      if (quantity <= 0) continue;

      const known = SPL_MINTS[info.mint];
      balances.push({
        coinId: known?.coinId ?? null,
        symbol: known?.symbol ?? `${info.mint.slice(0, 4)}…`,
        name: known?.name ?? "Unknown token",
        quantity,
        contract: info.mint,
        decimals: info.tokenAmount.decimals,
      });
    }

    return balances;
  }

  private async evmBalances(address: string): Promise<TokenBalance[]> {
    const url = env.EVM_RPC_URL;
    if (!url) return [];

    const hex = await rpcCall<string>(url, "eth_getBalance", [address, "latest"]);
    const wei = BigInt(hex);
    // Integer-divide first so large balances keep full precision.
    const whole = Number(wei / WEI_PER_ETH);
    const fraction = Number(wei % WEI_PER_ETH) / Number(WEI_PER_ETH);

    return [
      {
        coinId: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        quantity: whole + fraction,
        decimals: 18,
      },
    ];
  }

  private async solTransactions(address: string, limit: number): Promise<WalletTransaction[]> {
    const url = env.SOLANA_RPC_URL;
    if (!url) return [];

    const signatures = await rpcCall<SolSignature[]>(url, "getSignaturesForAddress", [
      address,
      { limit: Math.min(limit, 25) },
    ]);

    const confirmed = signatures.filter((s) => !s.err).slice(0, Math.min(limit, 10));
    const out: WalletTransaction[] = [];

    // One RPC round-trip per transaction, so the cap above matters.
    for (const sig of confirmed) {
      try {
        const tx = await rpcCall<SolTransaction | null>(url, "getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);
        if (!tx?.meta) {
          out.push(unknownTransfer(sig));
          continue;
        }

        const keys = tx.transaction.message.accountKeys.map((k) =>
          typeof k === "string" ? k : k.pubkey,
        );
        const index = keys.indexOf(address);
        const pre = index >= 0 ? tx.meta.preBalances[index] : undefined;
        const post = index >= 0 ? tx.meta.postBalances[index] : undefined;

        if (pre === undefined || post === undefined) {
          out.push(unknownTransfer(sig));
          continue;
        }

        const delta = (post - pre) / LAMPORTS_PER_SOL;
        out.push({
          hash: sig.signature,
          timestamp: (sig.blockTime ?? tx.blockTime ?? 0) * 1000,
          direction: delta === 0 ? "UNKNOWN" : delta > 0 ? "IN" : "OUT",
          symbol: "SOL",
          quantity: Math.abs(delta),
        });
      } catch (err) {
        log.debug(`Skipping ${sig.signature}: ${(err as Error).message}`);
      }
    }

    return out;
  }
}

function unknownTransfer(sig: SolSignature): WalletTransaction {
  return {
    hash: sig.signature,
    timestamp: (sig.blockTime ?? 0) * 1000,
    direction: "UNKNOWN",
    symbol: "SOL",
    quantity: 0,
  };
}
