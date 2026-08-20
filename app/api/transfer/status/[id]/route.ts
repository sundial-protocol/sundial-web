import { NextResponse } from "next/server";

import * as demo from "@/lib/transfer/demo-service";
import * as live from "@/lib/transfer/live-service";
import { isDemoMode, isLiveMode } from "@/lib/transfer/mode";
import { getStatus, TransferUnknownError } from "@/lib/transfer/mock-service";
import {
  proxyToTransferService,
  transferError,
  transferServiceUrl,
} from "@/lib/transfer/service";
import type {
  TransferStatusResponse,
  TransferStatusSuccessResponse,
} from "../../types";

// Drives the progress view. Polled while the transfer is at a non-terminal step.
//
// Everything the browser knows about an in-flight transfer comes from here,
// keyed on an id it stored — which is the point of the design: a beam spans an
// hour of finality wait and has to survive a refresh, a closed tab, and a
// different device, none of which it could if the state lived client-side.

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<TransferStatusResponse>> {
  const { id } = await params;
  const transferId = id?.trim() ?? "";

  if (!transferId) {
    return transferError(400, "TRANSFER_UNKNOWN", "A transfer id is required.");
  }

  const baseUrl = transferServiceUrl();
  if (baseUrl) {
    return proxyToTransferService<TransferStatusSuccessResponse>(
      baseUrl,
      `/v1/transfer/status/${encodeURIComponent(transferId)}`,
    );
  }

  try {
    // demo.getStatus is mock.getStatus re-exported — a demo record lives in
    // the same store and its mode ("demo" vs "mock") is read off the record
    // itself, not the mode this route dispatches on. Branching here anyway
    // for the same reason the other two routes do: readability, and so a
    // future divergence has an obvious place to land.
    const result = isLiveMode()
      ? await live.getStatus(transferId)
      : isDemoMode()
        ? await demo.getStatus(transferId)
        : await getStatus(transferId);
    return NextResponse.json(result);
  } catch (e) {
    if (
      e instanceof TransferUnknownError ||
      e instanceof live.LiveTransferUnknownError
    ) {
      return transferError(404, "TRANSFER_UNKNOWN", e.message);
    }
    console.error("Transfer status lookup failed:", e);
    return transferError(
      500,
      "INTERNAL",
      "The transfer status could not be read. Please try again.",
    );
  }
}
