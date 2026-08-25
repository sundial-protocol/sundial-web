import { NextResponse } from "next/server";
import { findInstance } from "../../../fixtures";
import { notFound } from "../../../helpers";

// GET /api/solstice/instances/[id]/reserves → ReserveStatus
// Client-facing PoR / ratio-freshness panel (spec §6.2). Drives the
// "investment paused" banner.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);
  return NextResponse.json(instance.reserve_status);
}
