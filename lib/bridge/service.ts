import { NextResponse } from "next/server";

import type {
  BridgeErrorCode,
  BridgeErrorResponse,
} from "@/app/api/bridge/types";

// Where the bridge routes get their answers.
//
// Unset BRIDGE_API_URL means the mock orchestrator serves (lib/bridge/mock-service.ts).
// Set it and every route proxies to the real Bridging Service instead — that
// variable is the whole switch from mock to real, the same shape as
// SUNDIAL_L2_NODE_URL for app/api/testnet/utxos.
//
// The URL itself never reaches the browser, which is why the proxying lives
// server-side here rather than in the hook.

export const bridgeServiceUrl = (): string | null => {
  const raw = process.env.BRIDGE_API_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
};

export const isMockBridge = (): boolean => bridgeServiceUrl() === null;

export const bridgeError = (
  status: number,
  code: BridgeErrorCode,
  message: string,
): NextResponse<BridgeErrorResponse> =>
  NextResponse.json({ error: message, code }, { status });

// Forward to the real service and hand its answer back unchanged.
//
// Upstream failures collapse into SERVICE_UNAVAILABLE rather than surfacing
// their text: the Bridging Service's internals include the L2 node address and
// canister ids, and a proxy that relays raw upstream errors leaks them the
// first time something breaks.
export const proxyToBridgeService = async <T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<NextResponse<T | BridgeErrorResponse>> => {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, cache: "no-store" });
  } catch (e) {
    console.error(`Bridge service request to ${path} failed:`, e);
    return bridgeError(
      502,
      "SERVICE_UNAVAILABLE",
      "The bridging service is currently unreachable. Please try again shortly.",
    );
  }

  let body: T;
  try {
    // Trusted to match the contract. The real service owns that contract, and
    // re-validating its whole shape here would mean maintaining a second copy
    // of it that can disagree with the first.
    body = (await response.json()) as T;
  } catch {
    console.error(`Bridge service returned non-JSON from ${path}`);
    return bridgeError(
      502,
      "SERVICE_UNAVAILABLE",
      "The bridging service returned an unexpected response.",
    );
  }

  return NextResponse.json(body, { status: response.status });
};
