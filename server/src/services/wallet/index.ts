import { randomBytes } from "node:crypto";

import { env } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { ApiError } from "../../core/ApiError.js";
import type { WalletChain } from "../../core/types.js";
import { WalletNonceModel } from "../../models/WalletNonce.js";
import { LiveWalletProvider } from "./LiveWalletProvider.js";
import { MockWalletProvider } from "./MockWalletProvider.js";
import { buildChallengeMessage, type SignatureChallenge, type WalletProvider } from "./WalletProvider.js";

const log = createLogger("wallet");

const NONCE_TTL_MS = 5 * 60 * 1000;

let provider: WalletProvider | null = null;

export function getWalletProvider(): WalletProvider {
  if (provider) return provider;
  provider = env.WALLET_PROVIDER === "live" ? new LiveWalletProvider() : new MockWalletProvider();
  log.info(`Using the ${provider.name} wallet provider (read-only).`);
  return provider;
}

/** Issues a single-use challenge for the user to sign in their wallet. */
export async function createChallenge(
  chain: WalletChain,
  address: string,
  domain: string,
): Promise<SignatureChallenge> {
  const wallet = getWalletProvider();

  if (!wallet.isValidAddress(chain, address)) {
    throw ApiError.badRequest(
      `That doesn't look like a valid ${chain === "solana" ? "Solana" : "Ethereum"} address.`,
    );
  }

  const nonce = randomBytes(16).toString("hex");
  const message = buildChallengeMessage({ address, nonce, domain });
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS);

  await WalletNonceModel.create({ chain, address, nonce, message, expiresAt });

  return { chain, address, nonce, message, expiresAt: expiresAt.getTime() };
}

/**
 * Consumes the challenge and verifies the signature. The nonce row is deleted
 * whether or not verification succeeds, so a captured signature can't be replayed
 * and a wrong guess can't be brute-forced against the same nonce.
 */
export async function verifyChallenge(input: {
  chain: WalletChain;
  address: string;
  nonce: string;
  signature: string;
}): Promise<void> {
  const { chain, address, nonce, signature } = input;

  const record = await WalletNonceModel.findOneAndDelete({ chain, address, nonce });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw ApiError.walletVerificationFailed(
      "That verification request expired.",
      "Please try connecting your wallet again.",
    );
  }

  const ok = await getWalletProvider().verifySignature({
    chain,
    address,
    message: record.message,
    signature,
  });

  if (!ok) throw ApiError.walletVerificationFailed();
}
