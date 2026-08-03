import { NextRequest, NextResponse } from "next/server";
import { findInstance, MOCK_PSBT_BASE64 } from "../../../../fixtures";
import {
  QUOTE_VALIDITY_MS,
  mockId,
  notFound,
  solsticeError,
} from "../../../../helpers";
import type {
  ReservationClaimBuildRequest,
  ReservationClaimBuildResponse,
} from "../../../../types";

// POST /api/solstice/instances/[id]/reservations/claim → claim/build (§5.3)
// Builds the PSBT that consumes a claimable Reservation UTXO and returns the
// correct RT to the Vault. The client signs, then submits via redeem/submit.
//
// NOTE: this static `claim` segment sits alongside the dynamic `[address]`
// segment; Next.js routes the literal `claim` here and any other value to the
// reservations list route.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);

  const body = (await request.json()) as Partial<ReservationClaimBuildRequest>;
  const {
    reservation_id,
    user_pubkey_hex,
    network = instance.network,
  } = body;

  if (!reservation_id || !user_pubkey_hex) {
    return solsticeError(
      "AMOUNT_BELOW_MIN",
      "Missing required fields: reservation_id, user_pubkey_hex",
    );
  }

  const response: ReservationClaimBuildResponse = {
    reservation_id,
    swap_id: mockId("swap"),
    expires_at: new Date(Date.now() + QUOTE_VALIDITY_MS).toISOString(),
    payout_sats: 998_800,
    psbt_base64: MOCK_PSBT_BASE64,
    network,
  };

  return NextResponse.json(response, { status: 201 });
}
