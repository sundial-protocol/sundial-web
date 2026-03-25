import { NextRequest, NextResponse } from "next/server";
import { sundialFetch } from "@/lib/sundial-api";
import type {
  CreateDepositIntentRequest,
  DepositIntentResponse,
  DepositIntentSuccessResponse,
} from "./types";

// In-memory rate limit map: key = user_pubkey_hex + provider_id + program_id, value = timestamp (ms)
const recentRequests = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds

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

    // ── Rate limiting: prevent repeated requests for same user+provider+program within window ──
    const key = `${body.user_pubkey_hex}:${body.provider_id}:${body.program_id}`;
    const now = Date.now();
    const lastRequest = recentRequests.get(key);
    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json(
        {
          error:
            "Please wait before retrying deposit intent. Try again in a few seconds.",
        },
        { status: 429 },
      );
    }
    recentRequests.set(key, now);

    // ── Forward to Sundial backend ──
    const data = await sundialFetch<DepositIntentSuccessResponse>(
      "/v1/users/deposits/intent",
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
