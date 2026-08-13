import { NextRequest, NextResponse } from "next/server";

import { initiate } from "@/lib/bridge/mock-service";
import {
  bridgeError,
  bridgeServiceUrl,
  proxyToBridgeService,
} from "@/lib/bridge/service";
import { isBech32PaymentAddress } from "@/lib/l2/address";
import type {
  BridgeInitiateRequest,
  BridgeInitiateResponse,
  BridgeInitiateSuccessResponse,
} from "../types";

// Opens a peg-in: the service creates the placeholder + collateral UTxOs on the
// L2, picks a nonce, derives the commitment, and returns the unsigned beam-send
// for the user's wallet.
//
// The response carries the placeholder UTxO but never the nonce — the
// commitment binding them is what authorizes the claim later, and half of it
// has to stay here.

export const dynamic = "force-dynamic";

// Above the L2's 6dp representable minimum by a wide margin, and far enough
// above the dust limit that the beam-send is relayable. A lower bound belongs
// here rather than only in the form: the form is not the only possible caller.
const MIN_AMOUNT_BTC = 0.0001;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BridgeInitiateResponse>> {
  let body: Partial<BridgeInitiateRequest>;
  try {
    body = (await request.json()) as Partial<BridgeInitiateRequest>;
  } catch {
    return bridgeError(400, "INTERNAL", "Expected a JSON body.");
  }

  const { asset, amount, l2DestAddr } = body;

  if (asset !== "BTC") {
    return bridgeError(
      400,
      "ASSET_UNSUPPORTED",
      "This bridge currently moves BTC only.",
    );
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return bridgeError(400, "AMOUNT_INVALID", "Enter an amount of BTC to bridge.");
  }

  if (amount < MIN_AMOUNT_BTC) {
    return bridgeError(
      400,
      "AMOUNT_INVALID",
      `The minimum bridge amount is ${MIN_AMOUNT_BTC} BTC.`,
    );
  }

  const destination = l2DestAddr?.trim() ?? "";
  if (!isBech32PaymentAddress(destination)) {
    return bridgeError(
      400,
      "ADDRESS_INVALID",
      "Enter a valid Sundial L2 bech32 payment address.",
    );
  }

  const baseUrl = bridgeServiceUrl();
  if (baseUrl) {
    return proxyToBridgeService<BridgeInitiateSuccessResponse>(baseUrl, "/v1/bridge/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset, amount, l2DestAddr: destination }),
    });
  }

  try {
    const result = await initiate({ asset, amount, l2DestAddr: destination });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error("Bridge initiate failed:", e);
    return bridgeError(
      500,
      "INTERNAL",
      "The bridge request could not be opened. Please try again.",
    );
  }
}
