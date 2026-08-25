import { NextRequest, NextResponse } from "next/server";
import { findInstance, MOCK_TXID } from "../../../../fixtures";
import { notFound, solsticeError } from "../../../../helpers";
import type {
  InvestSubmitRequest,
  InvestSubmitResponse,
} from "../../../../types";

// POST /api/solstice/instances/[id]/invest/submit  (server-submit, spec §4.3)
// The client returns the signed swap PSBT; the backend co-signs and submits
// atomically. No Solstice swap PSBT is ever handed to /api/btc-broadcast.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);

  const body = (await request.json()) as Partial<InvestSubmitRequest>;
  if (!body.swap_id || !body.signed_psbt_base64) {
    return solsticeError(
      "AMOUNT_BELOW_MIN",
      "Missing required fields: swap_id, signed_psbt_base64",
    );
  }

  // Real backend would validate the quote is still live here and 409 with
  // QUOTE_EXPIRED / RATIO_MOVED if it lapsed, and echo the swap's own rt_out.
  // The mock is stateless, so it returns a representative amount.
  const response: InvestSubmitResponse = {
    swap_id: body.swap_id,
    status: "submitted",
    txid: MOCK_TXID,
    rt_out: "4995000000",
    submitted_at: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 201 });
}
