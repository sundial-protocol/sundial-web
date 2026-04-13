import type { ApiErrorResponse } from "@/app/api/types";

export interface CreateProgramRequest {
  provider_id: string;
  name: string;
  description?: string;
  expected_yield_bps: number; // e.g. 350 = 3.5%
  min_lock_ms: number; // lock duration in milliseconds
  distribution_type?: string; // defaults to "FINAL"
  program_vault_address?: string; // resolved server-side if omitted
  provider_pubkey_hex?: string; // resolved server-side if omitted
  escrow_script: string; // hex-encoded redeem script for the escrow P2SH address
  timelock_script: string; // hex-encoded redeem script for the timelock P2SH address
}

export interface CreateProgramSuccessResponse {
  program_id: string;
  provider_id: string;
  name: string;
  description: string | null;
  expected_yield_bps: number;
  min_lock_ms: number;
  program_vault_address: string;
  escrow_script: string;
  timelock_script: string;
}

export type CreateProgramResponse =
  | CreateProgramSuccessResponse
  | ApiErrorResponse;
