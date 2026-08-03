import { NextRequest, NextResponse } from "next/server";
import { findInstance, MOCK_PSBT_BASE64 } from "../../../fixtures";
import {
  MOCK_FEE_SATS,
  QUOTE_VALIDITY_MS,
  mockId,
  notFound,
  payoutSatsForRt,
  solsticeError,
} from "../../../helpers";
import type {
  RedeemBuildRequest,
  RedeemBuildResponse,
} from "../../../types";

// POST /api/solstice/instances/[id]/redeem  → redeem/build (C2 / O2.1, §5.1)
// build decides instant vs queued by confirming buffer headroom at
// construction time (spec §4.3). The instant one-tx promise is only offered
// when headroom is confirmed; otherwise the response routes to `queued`.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);

  const body = (await request.json()) as Partial<RedeemBuildRequest>;
  const {
    quote_id,
    user_address,
    user_pubkey_hex,
    amount_rt,
    network = instance.network,
  } = body;

  if (!quote_id || !user_address || !user_pubkey_hex || !amount_rt) {
    return solsticeError(
      "AMOUNT_BELOW_MIN",
      "Missing required fields: quote_id, user_address, user_pubkey_hex, amount_rt",
    );
  }

  if (BigInt(amount_rt) < BigInt(instance.min_redeem_rt)) {
    return solsticeError(
      "AMOUNT_BELOW_MIN",
      `Below min_redeem_rt (${instance.min_redeem_rt}).`,
    );
  }

  const payoutSats = payoutSatsForRt(
    amount_rt,
    instance.claim_ratio.btc_per_rt,
    MOCK_FEE_SATS,
    instance.receipt_rune.divisibility,
  );
  const expiresAt = new Date(Date.now() + QUOTE_VALIDITY_MS).toISOString();

  // Instant only when this instance currently has buffer headroom.
  if (instance.redemption.instant_available) {
    const response: RedeemBuildResponse = {
      mode: "instant",
      swap_id: mockId("swap"),
      quote_id,
      expires_at: expiresAt,
      amount_rt,
      payout_sats: payoutSats,
      fee_sats: MOCK_FEE_SATS,
      psbt_base64: MOCK_PSBT_BASE64, // Buffer BTC → user; user RT → Vault
      network,
    };
    return NextResponse.json(response, { status: 201 });
  }

  // Buffer short / cap reached → queued (spec §4.3 buffer-short fallback).
  const response: RedeemBuildResponse = {
    mode: "queued",
    request_id: mockId("req"),
    quote_id,
    expires_at: expiresAt,
    amount_rt,
    locked_payout_sats: payoutSats,
    queue_position: 7,
    estimated_settlement_at:
      instance.redemption.next_settlement_at ??
      new Date(Date.now() + instance.redemption.cycle_ms).toISOString(),
    psbt_base64: MOCK_PSBT_BASE64, // user RT → Vault/redemption-pending
    network,
  };
  return NextResponse.json(response, { status: 201 });
}
