import type { ApiErrorResponse } from "../types";

// BTC Broadcast API Types
export interface BtcBroadcastSuccessResponse {
  success: true;
  txid: string;
  rawTransaction: string;
}

export type BtcBroadcastResponse =
  | BtcBroadcastSuccessResponse
  | ApiErrorResponse;
