/**
 * Wallet ownership proofs (spec 27).
 *
 * This lives on its own because it is pure cryptography — no RPC, no API key, no
 * network. Both the live and the mock provider verify through here, so the one
 * security-critical step in the wallet flow behaves identically in development
 * and in production. A signature that wouldn't be accepted on a deployed server
 * must not be accepted on a laptop either.
 *
 * Nothing here ever sees a private key: the user signs in their own wallet UI and
 * we only check the result.
 */
import bs58 from "bs58";
import nacl from "tweetnacl";
import { getAddress, verifyMessage } from "ethers";

import { createLogger } from "../../config/logger.js";
import type { WalletChain } from "../../core/types.js";

const log = createLogger("wallet-signature");

const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const SIGNATURE_BYTES = 64;

/** Wallets return base58 (Phantom), hex, or base64 depending on the adapter. */
function decodeSignature(signature: string): Uint8Array | null {
  const attempts: Array<() => Uint8Array> = [
    () => bs58.decode(signature),
    () => Uint8Array.from(Buffer.from(signature.replace(/^0x/, ""), "hex")),
    () => Uint8Array.from(Buffer.from(signature, "base64")),
  ];

  for (const attempt of attempts) {
    try {
      const bytes = attempt();
      if (bytes.length === SIGNATURE_BYTES) return bytes;
    } catch {
      // Try the next encoding.
    }
  }

  return null;
}

/** Shape check only — says nothing about whether the address exists on-chain. */
export function isWellFormedAddress(chain: WalletChain, address: string): boolean {
  if (chain === "ethereum") return EVM_ADDRESS_RE.test(address);
  if (!SOLANA_ADDRESS_RE.test(address)) return false;
  try {
    return bs58.decode(address).length === 32;
  } catch {
    return false;
  }
}

/**
 * True only when `signature` really is a signature of `message` by `address`.
 * Every failure path returns false rather than throwing, so a malformed input
 * from a wallet adapter reads as "not verified" instead of a 500.
 */
export function verifyWalletSignature(input: {
  chain: WalletChain;
  address: string;
  message: string;
  signature: string;
}): boolean {
  const { chain, address, message, signature } = input;
  if (signature.trim().length === 0) return false;

  try {
    if (chain === "solana") {
      const signatureBytes = decodeSignature(signature);
      if (!signatureBytes) return false;
      return nacl.sign.detached.verify(
        new TextEncoder().encode(message),
        signatureBytes,
        bs58.decode(address),
      );
    }

    // EVM wallets sign with personal_sign, which ethers recovers for us.
    return getAddress(verifyMessage(message, signature)) === getAddress(address);
  } catch (err) {
    log.warn(`Signature verification failed: ${(err as Error).message}`);
    return false;
  }
}
