import { NextRequest, NextResponse } from "next/server";
import { sundialFetch } from "@/lib/sundial-api";
import type { ClaimableAllocation, ClaimableResponse } from "./types";

/**
 * GET /api/user-claimable?address=<bitcoin_beneficiary_address>
 *
 * Proxies to: GET /v1/users/:beneficiary_address/claimable
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ClaimableResponse>> {
  const address = request.nextUrl.searchParams.get("address");

  if (!address || address.trim() === "") {
    return NextResponse.json(
      { error: "Missing required query parameter: address" },
      { status: 400 },
    );
  }

  try {
    const data = await sundialFetch<ClaimableAllocation[]>(
      `/v1/users/${encodeURIComponent(address.trim())}/claimable`,
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch claimable allocations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch claimable allocations",
        details: error.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
