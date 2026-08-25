import { NextResponse } from "next/server";
import { findInstance, mockReservations } from "../../../../fixtures";
import { notFound } from "../../../../helpers";

// GET /api/solstice/instances/[id]/reservations/[address] → Reservation[]
// Claimable Reservations for the user's address (Claim Reservation, spec §5.3
// user path). Claimable entries feed reservations/claim to build the claim
// PSBT.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; address: string }> },
): Promise<NextResponse> {
  const { id, address } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);

  // Instances with instant headroom don't accumulate reservations in the mock.
  const reservations = instance.redemption.instant_available
    ? []
    : mockReservations(address);

  return NextResponse.json(reservations);
}
