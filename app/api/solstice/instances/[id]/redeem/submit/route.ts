import { NextRequest, NextResponse } from "next/server";
import { findInstance, MOCK_TXID } from "../../../../fixtures";
import { notFound, solsticeError } from "../../../../helpers";
import type {
  RedeemSubmitRequest,
  RedeemSubmitResponse,
} from "../../../../types";

// POST /api/solstice/instances/[id]/redeem/submit  (server-submit, spec §5.2)
// instant → server co-signs & submits. queued → records the request with RT
// locked in the Vault; a Reservation is minted at the next buffer refill.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);

  const body = (await request.json()) as Partial<RedeemSubmitRequest>;
  if (!body.signed_psbt_base64 || (!body.swap_id && !body.request_id)) {
    return solsticeError(
      "AMOUNT_BELOW_MIN",
      "Missing required fields: signed_psbt_base64 and one of swap_id | request_id",
    );
  }

  // request_id present → queued path; swap_id present → instant path.
  if (body.request_id) {
    const response: RedeemSubmitResponse = {
      status: "queued",
      request_id: body.request_id,
      queue_position: 7,
      reservation_expected_at:
        instance.redemption.next_settlement_at ??
        new Date(Date.now() + instance.redemption.cycle_ms).toISOString(),
    };
    return NextResponse.json(response, { status: 201 });
  }

  const response: RedeemSubmitResponse = {
    status: "submitted",
    txid: MOCK_TXID,
    payout_sats: 998_800,
  };
  return NextResponse.json(response, { status: 201 });
}
