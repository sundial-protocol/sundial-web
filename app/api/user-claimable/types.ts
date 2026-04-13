import type { ApiErrorResponse } from "@/app/api/types";

/** A single claimable distribution allocation, as returned by GET /v1/users/:address/claimable */
export interface ClaimableAllocation {
  distribution_allocation_id: string;
  distribution_id: string;
  deposit_id: string;
  provider_id: string;
  program_id: string;
  status: string;
  /** Principal BTC to be returned to the user, in satoshis */
  principal_return_sats: number;
  /** Yield earned, in satoshis */
  yield_sats: number;
  /** Total amount claimable (principal + yield), in satoshis */
  total_return_sats: number;
  /** Redeem script for the escrow output (needed to build withdrawal PSBT) */
  escrow_script: string;
  /** Redeem script for the timelock output (needed to build withdrawal PSBT) */
  timelock_script: string;
}

export type ClaimableResponse = ClaimableAllocation[] | ApiErrorResponse;
