import type { TokenBalance, WalletChain, WalletTransaction } from "../../core/types.js";

export interface SignatureChallenge {
  chain: WalletChain;
  address: string;
  nonce: string;
  message: string;
  expiresAt: number;
}

/**
 * Read-only wallet access (spec 4/27).
 *
 * VERY IMPORTANT — this interface deliberately has no method that can move
 * funds, and implementations must never accept a seed phrase, a private key or a
 * spend approval. Ownership is proven with a signed message and nothing else;
 * balances and transactions are fetched from public RPC by address.
 */
export interface WalletProvider {
  readonly name: string;

  /** Chains this provider can read. */
  supports(chain: WalletChain): boolean;

  /** True if the string is a well-formed address for the chain. */
  isValidAddress(chain: WalletChain, address: string): boolean;

  /**
   * Verifies that `signature` is a signature of `message` by `address`.
   * The nonce inside the message makes each challenge single-use.
   */
  verifySignature(input: {
    chain: WalletChain;
    address: string;
    message: string;
    signature: string;
  }): Promise<boolean>;

  getBalances(chain: WalletChain, address: string): Promise<TokenBalance[]>;

  getTransactions(chain: WalletChain, address: string, limit?: number): Promise<WalletTransaction[]>;
}

/** Human-readable sign-in message. Shown verbatim in the wallet popup. */
export function buildChallengeMessage(input: {
  address: string;
  nonce: string;
  domain: string;
}): string {
  return [
    "CoinWake wants to verify you own this wallet.",
    "",
    "This signature proves ownership only.",
    "It does NOT approve any transaction and cannot move your funds.",
    "",
    `Wallet: ${input.address}`,
    `Site: ${input.domain}`,
    `Nonce: ${input.nonce}`,
  ].join("\n");
}
