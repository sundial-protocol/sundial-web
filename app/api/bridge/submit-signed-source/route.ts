import { NextRequest, NextResponse } from "next/server";

import {
  BridgeRequestStateError,
  BridgeRequestUnknownError,
  submitSignedSource,
} from "@/lib/bridge/mock-service";
import {
  bridgeError,
  bridgeServiceUrl,
  proxyToBridgeService,
} from "@/lib/bridge/service";
import type {
  BridgeSubmitSignedSourceRequest,
  BridgeSubmitSignedSourceResponse,
  BridgeSubmitSignedSourceSuccessResponse,
} from "../types";

// Hands the signed beam-send back to the service, which broadcasts it and takes
// over: watch for finality, prove the receive, threshold-sign, submit.
//
// The browser deliberately does not broadcast. The service has to see the
// transaction go out to start its finality watch, and routing it through here
// means there is no window where the BTC is locked but nothing is watching for
// it. Note this is the opposite of the escrow staking flow, which broadcasts
// from the client via /api/btc-broadcast — do not reuse that path here.

export const dynamic = "force-dynamic";

const isHex = (value: string): boolean =>
  value.length > 0 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value);

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BridgeSubmitSignedSourceResponse>> {
  let body: Partial<BridgeSubmitSignedSourceRequest>;
  try {
    body = (await request.json()) as Partial<BridgeSubmitSignedSourceRequest>;
  } catch {
    return bridgeError(400, "INTERNAL", "Expected a JSON body.");
  }

  const bridgeRequestId = body.bridgeRequestId?.trim() ?? "";
  const signedSourceTx = body.signedSourceTx?.trim() ?? "";

  if (!bridgeRequestId) {
    return bridgeError(400, "REQUEST_UNKNOWN", "A bridge request id is required.");
  }

  if (!isHex(signedSourceTx)) {
    return bridgeError(
      400,
      "SIGNED_TX_INVALID",
      "The signed source transaction must be raw hex.",
    );
  }

  const baseUrl = bridgeServiceUrl();
  if (baseUrl) {
    return proxyToBridgeService<BridgeSubmitSignedSourceSuccessResponse>(
      baseUrl,
      "/v1/bridge/submit-signed-source",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bridgeRequestId, signedSourceTx }),
      },
    );
  }

  try {
    const result = await submitSignedSource(bridgeRequestId, signedSourceTx);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof BridgeRequestUnknownError) {
      return bridgeError(404, "REQUEST_UNKNOWN", e.message);
    }
    if (e instanceof BridgeRequestStateError) {
      return bridgeError(409, "REQUEST_STATE_INVALID", e.message);
    }
    console.error("Bridge submit-signed-source failed:", e);
    return bridgeError(
      500,
      "INTERNAL",
      "The signed transaction could not be accepted. Please try again.",
    );
  }
}
