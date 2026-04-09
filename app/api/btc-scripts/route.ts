import { NextRequest, NextResponse } from "next/server";
import { BTCLocker, TimeUtils } from "@sundial-protocol/btc-locker";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";
import type {
  CreateScriptsResponse,
  CreateScriptsSuccessResponse,
} from "./types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CreateScriptsResponse>> {
  try {
    const body = await request.json();
    const {
      userPublicKey,
      network = "bitcoin",
      locktime = TimeUtils.dateToTimestamp(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ),
    } = body;

    if (!userPublicKey) {
      return NextResponse.json(
        { error: "Missing required field: userPublicKey" },
        { status: 400 },
      );
    }

    if (!/^[0-9a-fA-F]{66}$/.test(userPublicKey)) {
      return NextResponse.json(
        { error: "Invalid public key format. Must be 66 hex characters." },
        { status: 400 },
      );
    }

    const locker = new BTCLocker(network);

    const timelockScript = await locker.createTimelockScript(
      locktime,
      userPublicKey,
    );

    const escrowScript = await locker.createEscrowScript(
      locktime,
      YIELD_PROVIDER_PUBKEY,
      userPublicKey,
    );

    const response: CreateScriptsSuccessResponse = {
      escrowScript,
      timelockScript,
      locktime,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error creating Bitcoin scripts:", error);
    return NextResponse.json(
      {
        error: "Failed to create scripts",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
