import { NextResponse } from "next/server";

import { transferMode } from "@/lib/transfer/mode";
import { transferServiceUrl } from "@/lib/transfer/service";
import type { TransferModeResponse } from "../types";

// Which implementation is answering the transfer routes.
//
// Exists because the UI needs to say so *before* a transfer is created, and
// until then there is no initiate or status response carrying `mode`. Serving
// it from the same functions the routes dispatch on means the badge cannot
// disagree with what actually runs — a `NEXT_PUBLIC_` copy of the setting could,
// and the failure would be a page claiming "Simulated" while moving real funds.
//
// Nothing sensitive: this reports *which* implementation, never the service URL
// or node address behind it.

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<TransferModeResponse>> {
  return NextResponse.json({
    mode: transferServiceUrl() !== null ? "external" : transferMode(),
  });
}
