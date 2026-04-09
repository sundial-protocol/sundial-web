import type { ApiErrorResponse } from "../types";

export interface CreateScriptsRequest {
  userPublicKey: string;
  network?: "bitcoin" | "testnet";
  /** Absolute Unix timestamp (seconds). Defaults to 30 days from now. */
  locktime?: number;
}

export interface ScriptInfo {
  address: string;
  redeemScript: string;
}

export interface CreateScriptsSuccessResponse {
  escrowScript: ScriptInfo;
  timelockScript: ScriptInfo;
  /** Resolved absolute Unix timestamp used to build the scripts */
  locktime: number;
}

export type CreateScriptsResponse =
  | CreateScriptsSuccessResponse
  | ApiErrorResponse;
