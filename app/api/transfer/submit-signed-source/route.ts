import { NextRequest, NextResponse } from "next/server";

import { ProverError, ProverRejectedError } from "@/lib/transfer/charms-prover";
import * as demo from "@/lib/transfer/demo-service";
import { L2NodeError } from "@/lib/transfer/l2-node";
import * as live from "@/lib/transfer/live-service";
import { isDemoMode, isLiveMode } from "@/lib/transfer/mode";
import {
  submitSignedSource,
  TransferStateError,
  TransferUnknownError,
} from "@/lib/transfer/mock-service";
import { ScrollsError, ScrollsRefusedError } from "@/lib/transfer/scrolls";
import {
  proxyToTransferService,
  transferError,
  transferServiceUrl,
} from "@/lib/transfer/service";
import type {
  BeamReceiveInput,
  TransferSubmitSignedSourceRequest,
  TransferSubmitSignedSourceResponse,
  TransferSubmitSignedSourceSuccessResponse,
} from "../types";

// Hands the signed source transaction back to the service — or, for a Charms
// beam-receive in live mode, hands back the *inputs* to build and prove one for
// real (see lib/transfer/charms-beam-receive.ts) — and the service takes over
// from there.
//
// The browser deliberately does not broadcast. The service has to see the
// transaction go out to start watching for it, and routing it through here
// means there is no window where funds have moved and nothing is tracking them.
// Note this is the opposite of the escrow staking flow, which broadcasts from
// the client via /api/btc-broadcast — do not reuse that path here.

export const dynamic = "force-dynamic";

const isHex = (value: string): boolean =>
  value.length > 0 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value);

const isValidBeamReceiveInput = (
  value: unknown,
): value is BeamReceiveInput => {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<BeamReceiveInput>;
  return (
    typeof v.placeholderUtxoId === "string" &&
    v.placeholderUtxoId.includes(":") &&
    typeof v.collateralUtxoId === "string" &&
    v.collateralUtxoId.includes(":") &&
    typeof v.sourceUtxoId === "string" &&
    v.sourceUtxoId.includes(":") &&
    typeof v.nonce === "string" &&
    /^\d+$/.test(v.nonce) &&
    typeof v.sourceTxHex === "string" &&
    isHex(v.sourceTxHex)
  );
};

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
  if (!transferId) {
    return transferError(400, "TRANSFER_UNKNOWN", "A transfer id is required.");
  }

  const signedSourceTx = body.signedSourceTx?.trim();
  const beamReceiveInput = body.beamReceiveInput;

  // Exactly one of the two ways to authorize a submission. Accepting both
  // silently would leave it ambiguous which one actually ran.
  if (signedSourceTx && beamReceiveInput) {
    return transferError(
      400,
      "SIGNED_TX_INVALID",
      "Provide either signedSourceTx or beamReceiveInput, not both.",
    );
  }

  if (beamReceiveInput !== undefined) {
    if (!isValidBeamReceiveInput(beamReceiveInput)) {
      return transferError(
        400,
        "SIGNED_TX_INVALID",
        "beamReceiveInput is missing a required field, or sourceTxHex is not hex.",
      );
    }
  } else if (!signedSourceTx || !isHex(signedSourceTx)) {
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
        body: JSON.stringify({ transferId, signedSourceTx, beamReceiveInput }),
      },
    );
  }

  // beamReceiveInput only means anything in live mode — the mock orchestrator
  // has no prover to call, and its own step machine already runs on a timer
  // regardless of what is submitted.
  if (beamReceiveInput && !isLiveMode()) {
    return transferError(
      400,
      "SIGNED_TX_INVALID",
      "beamReceiveInput requires TRANSFER_MODE=live.",
    );
  }

  try {
    const result = isLiveMode()
      ? await live.submitSignedSource(transferId, {
          signedSourceTx,
          beamReceiveInput,
        })
      : isDemoMode()
        ? await demo.submitSignedSource(transferId, signedSourceTx as string)
        : await submitSignedSource(transferId, signedSourceTx as string);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (
      e instanceof TransferUnknownError ||
      e instanceof live.LiveTransferUnknownError
    ) {
      return transferError(404, "TRANSFER_UNKNOWN", e.message);
    }
    if (
      e instanceof TransferStateError ||
      e instanceof live.LiveTransferStateError
    ) {
      return transferError(409, "TRANSFER_STATE_INVALID", e.message);
    }
    // A real testnet rejection (already spent, insufficient fee, malformed
    // signature) — surfaced verbatim, same reasoning as the prover/Scrolls
    // rejections below.
    if (e instanceof demo.DemoBroadcastError) {
      return transferError(400, "SIGNED_TX_INVALID", e.message);
    }
    // Real rejections from real infrastructure, surfaced rather than
    // generalized: a prover rejection, a Scrolls refusal, and the node's own
    // "Invalid CBOR provided" each name exactly what is wrong with the request,
    // which a generic 500 would throw away.
    if (e instanceof ProverRejectedError) {
      return transferError(400, "SIGNED_TX_INVALID", e.message);
    }
    if (e instanceof ProverError) {
      return transferError(502, "SERVICE_UNAVAILABLE", e.message);
    }
    if (e instanceof ScrollsRefusedError) {
      return transferError(400, "SIGNED_TX_INVALID", e.message);
    }
    if (e instanceof ScrollsError) {
      return transferError(502, "SERVICE_UNAVAILABLE", e.message);
    }
    if (e instanceof L2NodeError) {
      return transferError(
        e.status && e.status >= 400 && e.status < 500 ? 400 : 502,
        e.status && e.status >= 400 && e.status < 500
          ? "SIGNED_TX_INVALID"
          : "SERVICE_UNAVAILABLE",
        e.message,
      );
    }
    console.error("Transfer submit-signed-source failed:", e);
    return transferError(
      500,
      "INTERNAL",
      "The signed transaction could not be accepted. Please try again.",
    );
  }
}
