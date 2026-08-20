// Bitcoin wallet-connector signing errors.
//
// Reown's BitcoinConnector wraps several different wallet APIs — Unisat's
// injected window.unisat, Sats Connect wallets (Xverse and others), Leather,
// OKX — and each rejects a declined signPSBT/sendTransfer call with its own
// shape: a {code, message} object modeled on EIP-1193's 4001 convention (which
// Unisat and Sats Connect both reuse verbatim for Bitcoin), a plain string, or
// occasionally an object with no usable message at all — which is what an
// `instanceof Error` check alone misses, surfacing as an empty `{}` wherever
// it gets logged or displayed.
//
// None of that is a genuine failure to begin with. A user declining to sign is
// the single most common, most expected outcome of asking them to — treating
// it as an application error (console.error, a scary generic message)
// misrepresents an ordinary "no".

export interface WalletLikeError {
  code?: number | string;
  message?: string;
  name?: string;
}

const isWalletLikeError = (error: unknown): error is WalletLikeError =>
  typeof error === "object" && error !== null;

const REJECTION_PATTERN = /reject|declin|cancel|denied|user.?abort/i;

/** Whether a signPSBT/sendTransfer failure was the user declining, rather than a real error. */
export function isUserRejection(error: unknown): boolean {
  if (!isWalletLikeError(error)) return false;
  if (error.code === 4001 || error.code === "4001") return true;
  const text = `${error.message ?? ""} ${error.name ?? ""}`;
  return REJECTION_PATTERN.test(text);
}

/** A message safe to show the user after a failed wallet signing call. */
export function describeSigningError(error: unknown): string {
  if (isUserRejection(error)) {
    return "Signing was declined in your wallet. Nothing was sent.";
  }
  if (error instanceof Error && error.message) return error.message;
  if (isWalletLikeError(error) && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return "The transaction could not be signed.";
}
