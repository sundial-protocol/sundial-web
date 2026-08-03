import { NextResponse } from "next/server";
import { findInstance } from "../../../../fixtures";
import { notFound, payoutSatsForRt } from "../../../../helpers";
import type { PositionResponse } from "../../../../types";

// GET /api/solstice/instances/[id]/positions/[address] → PositionResponse
// RT balance valued at the current claim ratio, plus any queued redemptions
// (spec §6.1).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; address: string }> },
): Promise<NextResponse> {
  const { id, address } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);

  const rtBalance = "4995000000";
  const valueSats = payoutSatsForRt(
    rtBalance,
    instance.claim_ratio.btc_per_rt,
    0, // position value is unfee'd
    instance.receipt_rune.divisibility,
  );

  const response: PositionResponse = {
    instance_id: instance.instance_id,
    address,
    rt_balance: rtBalance,
    value_sats: valueSats,
    claim_ratio: {
      btc_per_rt: instance.claim_ratio.btc_per_rt,
      as_of_at: instance.claim_ratio.as_of_at,
    },
    pending_redemptions: instance.redemption.instant_available
      ? []
      : [
          {
            request_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            amount_rt: "1000000000",
            locked_payout_sats: 998_800,
            queue_position: 7,
            status: "queued",
            estimated_settlement_at:
              instance.redemption.next_settlement_at ??
              new Date(Date.now() + instance.redemption.cycle_ms).toISOString(),
          },
        ],
  };

  return NextResponse.json(response);
}
