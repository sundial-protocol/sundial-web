import { NextRequest, NextResponse } from "next/server";

import {
  submitSignedSource,
  TransferStateError,
  TransferUnknownError,
} from "@/lib/transfer/mock-service";
import {
  proxyToTransferService,
  transferError,
  transferServiceUrl,
} from "@/lib/transfer/service";
import type {
  TransferSubmitSignedSourceRequest,
  TransferSubmitSignedSourceResponse,
  TransferSubmitSignedSourceSuccessResponse,
} from "../types";

// Hands the signed source transaction back to the service, which broadcasts it
// and takes over from there.
//
// The browser deliberately does not broadcast. The service has to see the
// transaction go out to start watching for it, and routing it through here
// means there is no window where funds have moved and nothing is tracking them.
// Note this is the opposite of the escrow staking flow, which broadcasts from
// the client via /api/btc-broadcast — do not reuse that path here.

export const dynamic = "force-dynamic";

const isHex = (value: string): boolean =>
  value.length > 0 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value);

export async function POST(
  request: NextRequest,
): Promise<NextResponse<TransferSubmitSignedSourceResponse>> {
  let body: Partial<TransferSubmitSignedSourceRequest>;
  try {
    body = (await request.json()) as Partial<TransferSubmitSignedSourceRequest>;
  } catch {
    return transferError(400, "INTERNAL", "Expected a JSON body.");
  }

  const transferId = body.transferId?.trim() ?? "";
  const signedSourceTx = body.signedSourceTx?.trim() ?? "";

  if (!transferId) {
    return transferError(400, "TRANSFER_UNKNOWN", "A transfer id is required.");
  }

  if (!isHex(signedSourceTx)) {
    return transferError(
      400,
      "SIGNED_TX_INVALID",
      "The signed source transaction must be raw hex.",
    );
  }

  const baseUrl = transferServiceUrl();
  if (baseUrl) {
    return proxyToTransferService<TransferSubmitSignedSourceSuccessResponse>(
      baseUrl,
      "/v1/transfer/submit-signed-source",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferId, signedSourceTx }),
      },
    );
  }

  try {
    const result = await submitSignedSource(transferId, signedSourceTx);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof TransferUnknownError) {
      return transferError(404, "TRANSFER_UNKNOWN", e.message);
    }
    if (e instanceof TransferStateError) {
      return transferError(409, "TRANSFER_STATE_INVALID", e.message);
    }
    console.error("Transfer submit-signed-source failed:", e);
    return transferError(
      500,
      "INTERNAL",
      "The signed transaction could not be accepted. Please try again.",
    );
  }
}
