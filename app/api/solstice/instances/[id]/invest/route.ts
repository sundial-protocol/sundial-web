import { NextRequest, NextResponse } from "next/server";
import { findInstance, MOCK_PSBT_BASE64 } from "../../../fixtures";
import {
  MOCK_FEE_SATS,
  QUOTE_VALIDITY_MS,
  mockId,
  notFound,
  rtOutForSats,
  solsticeError,
} from "../../../helpers";
import type {
  InvestBuildRequest,
  InvestBuildResponse,
} from "../../../types";

// POST /api/solstice/instances/[id]/invest  → invest/build (C1, spec §4.2)
// Builds the atomic swap PSBT (Vault RT → user; user BTC → Vault/buffer). The
// client signs but never broadcasts — see invest/submit for server-submit.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = findInstance(id);
  if (!instance) return notFound(`Unknown instance: ${id}`);

  if (instance.reserve_status.investment_paused) {
    return solsticeError(
      "RESERVE_STALE",
      instance.reserve_status.paused_reason ??
        "Reserve attestation stale; investment paused.",
    );
  }

  const body = (await request.json()) as Partial<InvestBuildRequest>;
  const {
    quote_id,
    user_beneficiary_address,
    user_pubkey_hex,
    amount_sats,
    network = instance.network,
  } = body;

  if (
    !quote_id ||
    !user_beneficiary_address ||
    !user_pubkey_hex ||
    !amount_sats
  ) {
    return solsticeError(
      "AMOUNT_BELOW_MIN",
      "Missing required fields: quote_id, user_beneficiary_address, user_pubkey_hex, amount_sats",
    );
  }

  if (amount_sats < instance.min_invest_sats) {
    return solsticeError(
      "AMOUNT_BELOW_MIN",
      `Below min_invest_sats (${instance.min_invest_sats}).`,
    );
  }

  const rtOut = rtOutForSats(
    amount_sats,
    instance.claim_ratio.btc_per_rt,
    MOCK_FEE_SATS,
    instance.receipt_rune.divisibility,
  );

  const response: InvestBuildResponse = {
    swap_id: mockId("swap"),
    instance_id: instance.instance_id,
    quote_id,
    expires_at: new Date(Date.now() + QUOTE_VALIDITY_MS).toISOString(),
    amount_sats,
    rt_out: rtOut,
    fee_sats: MOCK_FEE_SATS,
    psbt_base64: MOCK_PSBT_BASE64,
    network,
  };

  return NextResponse.json(response, { status: 201 });
}
