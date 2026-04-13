import type { ApiErrorResponse, ScriptInfo } from "../types";

// BTC Staking API Types
export interface BtcStakingSuccessResponse {
  success: true;
  psbt: string;
  transactionType: "deposit";
  amount: number;
  escrowScript: ScriptInfo;
  timelockScript: ScriptInfo;
  locktime: number;
}

export type BtcStakingResponse = BtcStakingSuccessResponse | ApiErrorResponse;
