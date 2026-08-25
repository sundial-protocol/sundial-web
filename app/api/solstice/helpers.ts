// Shared helpers for the Solstice mock routes: the error envelope and the
// bits of ratio math the fixtures need to look internally consistent.

import { NextResponse } from "next/server";
import type { SolsticeErrorCode, SolsticeErrorResponse } from "./types";

const CODE_STATUS: Record<SolsticeErrorCode, number> = {
  QUOTE_EXPIRED: 409,
  RATIO_MOVED: 409,
  RESERVE_STALE: 503,
  INSTANCE_PAUSED: 503,
  AMOUNT_BELOW_MIN: 400,
};

const CODE_ERROR: Record<SolsticeErrorCode, string> = {
  QUOTE_EXPIRED: "Conflict",
  RATIO_MOVED: "Conflict",
  RESERVE_STALE: "Service Unavailable",
  INSTANCE_PAUSED: "Service Unavailable",
  AMOUNT_BELOW_MIN: "Bad Request",
};

export function solsticeError(
  code: SolsticeErrorCode,
  message: string,
): NextResponse<SolsticeErrorResponse> {
  const statusCode = CODE_STATUS[code];
  return NextResponse.json(
    { statusCode, error: CODE_ERROR[code], code, message },
    { status: statusCode },
  );
}

// Plain 404 for an unknown instance id/slug (not a branchable Solstice code).
export function notFound(message: string): NextResponse {
  return NextResponse.json(
    { statusCode: 404, error: "Not Found", message },
    { status: 404 },
  );
}

// A flat 30-sat mock network/settlement fee — enough to look real without
// pretending to model fee estimation in the mock phase.
export const MOCK_FEE_SATS = 1200;

// RT out for a BTC-in amount, given a btc_per_rt ratio. base-units string.
export function rtOutForSats(
  amountSats: number,
  btcPerRt: string,
  feeSats = MOCK_FEE_SATS,
  divisibility = 8,
): string {
  const netSats = Math.max(amountSats - feeSats, 0);
  const btcPerRtNum = Number(btcPerRt);
  const rtWhole = netSats / 1e8 / btcPerRtNum; // RT (display units)
  const baseUnits = Math.floor(rtWhole * 10 ** divisibility);
  return baseUnits.toString();
}

// BTC payout (sats) for an RT-in amount, given a btc_per_rt ratio.
export function payoutSatsForRt(
  amountRt: string,
  btcPerRt: string,
  feeSats = MOCK_FEE_SATS,
  divisibility = 8,
): number {
  const rtWhole = Number(amountRt) / 10 ** divisibility;
  const grossSats = Math.floor(rtWhole * Number(btcPerRt) * 1e8);
  return Math.max(grossSats - feeSats, 0);
}

// Short-lived quote window used across the mock (spec §7.1).
export const QUOTE_VALIDITY_MS = 30_000;

// A UUID-ish id for mock swap/quote/request handles.
export function mockId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2, 10);
  const t = Date.now().toString(16);
  return `${prefix}-${t}-${rand}`;
}
