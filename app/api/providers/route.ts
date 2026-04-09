import { NextResponse } from "next/server";
import { sundialFetch } from "@/lib/sundial-api";
import type { ProvidersResponse, ServerProvider } from "./types";

/**
 * GET /api/providers
 *
 * Proxies GET /v1/providers from the Sundial backend and returns the list of
 * active providers with their active programs.
 */
export async function GET(): Promise<NextResponse<ProvidersResponse>> {
  try {
    const data = await sundialFetch<ServerProvider[]>("/v1/providers");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch providers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch providers",
        details: error.message ?? "Unknown error",
      },
      { status: 502 },
    );
  }
}
