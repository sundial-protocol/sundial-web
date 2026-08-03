import { NextRequest, NextResponse } from "next/server";
import { findInstance } from "../../../fixtures";
import { MOCK_QUOTE_SIGNATURE } from "../../../fixtures";
import {
  MOCK_FEE_SATS,
  QUOTE_VALIDITY_MS,
  mockId,
  rtOutForSats,
  solsticeError,
} from "../../../helpers";
import type { RatioQuoteResponse } from "../../../types";

// GET /api/solstice/instances/[id]/quote?side=invest&amount_sats=…
// Signed, short-lived Claim Ratio quote (spec §4.1 / §7.1). When `amount_sats`
// is supplied, attaches a priced `preview`. If the instance's reserve checks
// fail, the quote carries investment_paused and the UI blocks invest.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = findInstance(id);
  if (!instance) {
    return solsticeError("INSTANCE_PAUSED", `Unknown instance: ${id}`);
  }

  if (instance.reserve_status.investment_paused) {
    return solsticeError(
      "RESERVE_STALE",
      instance.reserve_status.paused_reason ??
        "Reserve attestation stale; investment paused.",
    );
  }

  const { searchParams } = request.nextUrl;
  const amountSatsParam = searchParams.get("amount_sats");

  const issuedAt = Date.now();
  const claimRatio = instance.claim_ratio;

  const quote: RatioQuoteResponse = {
    quote_id: mockId("quote"),
    instance_id: instance.instance_id,
    claim_ratio: claimRatio,
    issued_at: new Date(issuedAt).toISOString(),
    expires_at: new Date(issuedAt + QUOTE_VALIDITY_MS).toISOString(),
    validity_ms: QUOTE_VALIDITY_MS,
    signature: MOCK_QUOTE_SIGNATURE,
  };

  if (amountSatsParam) {
    const amountSats = Number(amountSatsParam);
    if (Number.isFinite(amountSats) && amountSats > 0) {
      if (amountSats < instance.min_invest_sats) {
        return solsticeError(
          "AMOUNT_BELOW_MIN",
          `Below min_invest_sats (${instance.min_invest_sats}).`,
        );
      }
      const rtOut = rtOutForSats(
        amountSats,
        claimRatio.btc_per_rt,
        MOCK_FEE_SATS,
        instance.receipt_rune.divisibility,
      );
      const effective = (
        (amountSats - MOCK_FEE_SATS) /
        1e8 /
        (Number(rtOut) / 10 ** instance.receipt_rune.divisibility)
      ).toFixed(8);
      quote.preview = {
        amount_sats: amountSats,
        rt_out: rtOut,
        fee_sats: MOCK_FEE_SATS,
        effective_btc_per_rt: effective,
      };
    }
  }

  return NextResponse.json(quote);
}
