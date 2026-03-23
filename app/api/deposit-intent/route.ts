import { NextRequest, NextResponse } from "next/server";
import { sundialFetch } from "@/lib/sundial-api";
import type {
  CreateDepositIntentRequest,
  DepositIntentResponse,
  DepositIntentSuccessResponse,
} from "./types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<DepositIntentResponse>> {
  try {
    const body: CreateDepositIntentRequest = await request.json();

    // ── Validate required fields ──
    const required: (keyof CreateDepositIntentRequest)[] = [
      "user_beneficiary_address",
      "user_pubkey_hex",
      "provider_id",
      "program_id",
      "amount_sats",
      "alpha_bps",
      "lock_ms",
    ];

    for (const field of required) {
      if (body[field] == null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // ── Forward to Sundial backend ──
    const data = await sundialFetch<DepositIntentSuccessResponse>(
      "/v1/deposits/intent",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Deposit intent error:", error);
    return NextResponse.json(
      {
        error: "Failed to create deposit intent",
        details: error.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
