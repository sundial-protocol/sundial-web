import type { ApiErrorResponse } from "../types";

// BTC Withdrawal API Types
export interface BtcWithdrawalSuccessResponse {
  success: true;
  psbt: string;
  transactionType: "withdraw";
  amount: number;
  withdrawAddress: string;
  escrowAddress: string;
  timelockAddress: string;
  locktime: number;
}

export interface BtcWithdrawalLocktimeErrorResponse {
  error: string;
  locktime: number;
  currentTime: number;
}

export type BtcWithdrawalResponse =
  | BtcWithdrawalSuccessResponse
  | BtcWithdrawalLocktimeErrorResponse
  | ApiErrorResponse;
