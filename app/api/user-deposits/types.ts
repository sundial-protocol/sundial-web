import type { ApiErrorResponse } from "../types";

// ── Single deposit record returned by the backend ──

export interface UserDeposit {
  /** Deposit UUID */
  deposit_id: string;
  /** Bitcoin beneficiary address */
  user_beneficiary_address: string;
  /** Deposit lifecycle status */
  status: DepositStatus;
  /** Provider UUID */
  provider_id: string;
  /** Program UUID */
  program_id: string;
  /** Total deposit amount in satoshis */
  amount_sats: number;
  /** Escrow allocation in basis points (0–10 000) */
  alpha_bps: number;
  /** Lock duration in milliseconds */
  lock_ms: number;
  /** Maturity timestamp – null until the indexer sets it */
  due_at: string | null;
  /** ISO 8601 creation timestamp */
  created_at: string;
}

/** Full deposit lifecycle as defined by the Sundial backend. */
export type DepositStatus =
  | "INTENT_CREATED"
  | "DEPOSIT_SEEN"
  | "DEPOSIT_CONFIRMED"
  | "PROVIDER_CLAIM_SEEN"
  | "PROVIDER_CLAIM_CONFIRMED"
  | "DISTRIBUTION_SEEN"
  | "DISTRIBUTION_CONFIRMED"
  | "WITHDRAWAL_SEEN"
  | "WITHDRAWAL_CONFIRMED";

// ── Response types ──

export type UserDepositsResponse = UserDeposit[] | ApiErrorResponse;
