import { NextRequest, NextResponse } from "next/server";
import { sundialFetch } from "@/lib/sundial-api";
import type {
  CreateDepositIntentPsbtRequest,
  DepositIntentPsbtResponse,
  DepositIntentPsbtSuccessResponse,
} from "./types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<DepositIntentPsbtResponse>> {
  try {
    const body: CreateDepositIntentPsbtRequest = await request.json();

    const required: (keyof CreateDepositIntentPsbtRequest)[] = [
      "user_beneficiary_address",
      "provider_id",
      "program_id",
      "amount_sats",
      "alpha_bps",
      "lock_ms",
      "psbt_base64",
    ];

    for (const field of required) {
      if (body[field] == null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const data = await sundialFetch<DepositIntentPsbtSuccessResponse>(
      "/v1/users/deposits/intent-psbt",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Deposit intent (psbt) error:", error);
    return NextResponse.json(
      {
        error: "Failed to create deposit intent with PSBT",
        details: error.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
