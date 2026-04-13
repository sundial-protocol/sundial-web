import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sundialFetch } from "@/lib/sundial-api";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";
import type {
  CreateProgramRequest,
  CreateProgramResponse,
  CreateProgramSuccessResponse,
} from "./types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CreateProgramResponse>> {
  try {
    const body: CreateProgramRequest = await request.json();

    const required: (keyof CreateProgramRequest)[] = [
      "provider_id",
      "name",
      "expected_yield_bps",
      "min_lock_ms",
      "escrow_script",
      "timelock_script",
    ];

    for (const field of required) {
      if (body[field] == null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const data = await sundialFetch<CreateProgramSuccessResponse>(
      "/v1/programs",
      {
        method: "POST",
        body: JSON.stringify({
          program_id: randomUUID(),
          provider_id: body.provider_id,
          name: body.name,
          description: body.description ?? null,
          expected_yield_bps: body.expected_yield_bps,
          min_lock_ms: body.min_lock_ms,
          distribution_type: body.distribution_type ?? "FINAL",
          program_vault_address: body.program_vault_address,
          provider_pubkey_hex:
            body.provider_pubkey_hex ??
            process.env.PROVIDER_PUBKEY_HEX ??
            YIELD_PROVIDER_PUBKEY,
          escrow_script: body.escrow_script,
          timelock_script: body.timelock_script,
        }),
      },
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Create program error:", error);
    return NextResponse.json(
      {
        error: "Failed to create program",
        details: error.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
