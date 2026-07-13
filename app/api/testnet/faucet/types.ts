import type { ApiErrorResponse } from "../../types";

// Faucet claim API types.
//
// This route is the single integration point between sundial-web and the
// Sundial faucet. The browser only ever sends a recipient address; the
// idempotency key and hashed IP are derived server-side, and the faucet bearer
// key never leaves the server.

// Mirrors the faucet's `FaucetClaimCode` (demo/midgard-node/src/services/faucet.ts).
export type FaucetClaimCode =
  | "DISABLED"
  | "ADDRESS_INVALID"
  | "ADDRESS_NETWORK_MISMATCH"
  | "ADDRESS_NO_PAYMENT_CREDENTIAL"
  | "ADDRESS_SCRIPT"
  | "COOLDOWN"
  | "IP_LIMIT"
  | "DEPLETED"
  | "VALIDATION_FAILED"
  | "INTERNAL"
  // Surfaced by this proxy when it cannot reach or talk to the node.
  | "NODE_UNAVAILABLE"
  // Surfaced by this proxy when the faucet env vars are not configured.
  | "NOT_CONFIGURED";

export interface FaucetClaimRequest {
  // Bech32 recipient payment address (addr_test1…).
  address: string;
  // Optional client-supplied idempotency key. When present and stable across
  // retries it lets the node dedupe a retried claim; otherwise the route
  // generates a fresh one per request.
  idempotencyKey?: string;
}

export interface FaucetClaimSuccessResponse {
  success: true;
  claimId: string;
  txHash: string;
  // Lovelace granted, as a decimal string (matches the node's serialization).
  amount: string;
  // ISO-8601 timestamp the address becomes eligible to claim again.
  nextEligibleAt: string;
}

export interface FaucetClaimErrorResponse extends ApiErrorResponse {
  code: FaucetClaimCode;
  // Present for COOLDOWN responses so the UI can show a countdown.
  nextEligibleAt?: string;
}

export type FaucetClaimResponse =
  | FaucetClaimSuccessResponse
  | FaucetClaimErrorResponse;
