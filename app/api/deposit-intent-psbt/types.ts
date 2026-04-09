import type { ApiErrorResponse } from "../types";

// ── Request ──

export interface CreateDepositIntentPsbtRequest {
  /** Bitcoin beneficiary address where user funds are returned */
  user_beneficiary_address: string;
  /** Provider UUID */
  provider_id: string;
  /** Program UUID */
  program_id: string;
  /** Deposit amount in satoshis (≥ 1) */
  amount_sats: number;
  /** Allocation basis points for escrow amount (0–10 000) */
  alpha_bps: number;
  /** Lock duration in milliseconds (≥ 1) */
  lock_ms: number;
  /** Externally built and signed PSBT in base64 */
  psbt_base64: string;
}

// ── Response (201 from backend) ──

export interface DepositIntentPsbtSuccessResponse {
  deposit_id: string;
  status: string;
  provider_id: string;
  program_id: string;
  amount_sats: number;
  alpha_bps: number;
  lock_ms: number;
  psbt_base64: string;
  network: string;
  created_at: string;
}

export type DepositIntentPsbtResponse =
  | DepositIntentPsbtSuccessResponse
  | ApiErrorResponse;
