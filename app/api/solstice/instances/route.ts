import { NextResponse } from "next/server";
import { allInstances } from "../fixtures";
import type { SolsticeInstance } from "../types";

// GET /api/solstice/instances → SolsticeInstance[]
// Multi-instance registry (spec §1, §2.3). Each instance renders as its own
// yield-option card in the dashboard — there is no instance selector.
export async function GET(): Promise<NextResponse<SolsticeInstance[]>> {
  return NextResponse.json(allInstances());
}
