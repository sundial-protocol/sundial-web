import type { ApiErrorResponse } from "@/app/api/types";

/** A single program belonging to a provider, as returned by GET /v1/providers */
export interface ServerProgram {
  program_id: string;
  name: string;
  description: string | null;
  /** Yield in basis points, e.g. 350 = 3.5 % APY */
  expected_yield_bps: number;
  /** Minimum lock duration in milliseconds */
  min_lock_ms: number;
  program_vault_address: string;
}

/** A provider record as returned by GET /v1/providers */
export interface ServerProvider {
  provider_id: string;
  name: string;
  programs: ServerProgram[];
}

export type ProvidersResponse = ServerProvider[] | ApiErrorResponse;
