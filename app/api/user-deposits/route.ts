import { NextRequest, NextResponse } from "next/server";
import { sundialFetch } from "@/lib/sundial-api";
import type { UserDeposit, UserDepositsResponse } from "./types";

/**
 * GET /api/user-deposits?address=<bitcoin_beneficiary_address>
 *
 * Proxies to:  GET /v1/users/deposits/intents/:user_beneficiary_address
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<UserDepositsResponse>> {
  const address = request.nextUrl.searchParams.get("address");

  if (!address || address.trim() === "") {
    return NextResponse.json(
      { error: "Missing required query parameter: address" },
      { status: 400 },
    );
  }

  try {
    const data = await sundialFetch<UserDeposit[]>(
      `/v1/users/deposits/intents/${encodeURIComponent(address.trim())}`,
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch user deposits:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch deposits",
        details: error.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
