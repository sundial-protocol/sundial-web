import type { ApiErrorResponse } from "../types";

// ── Request ──

export interface CreateDepositIntentRequest {
  /** Bitcoin beneficiary address where user funds are returned */
  user_beneficiary_address: string;
  /** Compressed secp256k1 pubkey hex (66 chars) */
  user_pubkey_hex: string;
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
}

// ── Response (201 from backend) ──

export interface DepositIntentSuccessResponse {
  deposit_id: string;
  status: string;
  provider_id: string;
  program_id: string;
  amount_sats: number;
  alpha_bps: number;
  lock_ms: number;
  op_return_hex: string;
  psbt_base64: string;
  network: string;
  created_at: string;
}

export type DepositIntentResponse =
  | DepositIntentSuccessResponse
  | ApiErrorResponse;
