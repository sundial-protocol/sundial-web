import { NextResponse } from "next/server";

import {
  BridgeRequestUnknownError,
  getStatus,
} from "@/lib/bridge/mock-service";
import {
  bridgeError,
  bridgeServiceUrl,
  proxyToBridgeService,
} from "@/lib/bridge/service";
import type {
  BridgeStatusResponse,
  BridgeStatusSuccessResponse,
} from "../../types";

// Drives the stepper. Polled while the request is at a non-terminal step.
//
// Everything the browser knows about an in-flight bridge comes from here, keyed
// on an id it stored — which is the point of the design: the flow spans an hour
// of finality wait and has to survive a refresh, a closed tab, and a different
// device, none of which it could if the state lived client-side.

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<BridgeStatusResponse>> {
  const { id } = await params;
  const bridgeRequestId = id?.trim() ?? "";

  if (!bridgeRequestId) {
    return bridgeError(400, "REQUEST_UNKNOWN", "A bridge request id is required.");
  }

  const baseUrl = bridgeServiceUrl();
  if (baseUrl) {
    return proxyToBridgeService<BridgeStatusSuccessResponse>(
      baseUrl,
      `/v1/bridge/status/${encodeURIComponent(bridgeRequestId)}`,
    );
  }

  try {
    return NextResponse.json(await getStatus(bridgeRequestId));
  } catch (e) {
    if (e instanceof BridgeRequestUnknownError) {
      return bridgeError(404, "REQUEST_UNKNOWN", e.message);
    }
    console.error("Bridge status lookup failed:", e);
    return bridgeError(
      500,
      "INTERNAL",
      "The bridge status could not be read. Please try again.",
    );
  }
}
