"use client";

// Dashboard hook + typed client for the Solstice mock API (app/api/solstice/*).
// One method per proxy route from the Solstice API Spec (§7), so the yield
// catalog can drive the full quote → build → submit flows against fixtures.
// Flip to the real backend later by pointing the routes at BTC_YIELD_API_URL —
// nothing here changes.

import { useCallback, useEffect, useState } from "react";
import type {
  InvestBuildRequest,
  InvestBuildResponse,
  InvestSubmitResponse,
  PositionResponse,
  RatioQuoteResponse,
  RedeemBuildRequest,
  RedeemBuildResponse,
  RedeemSubmitResponse,
  Reservation,
  ReservationClaimBuildRequest,
  ReservationClaimBuildResponse,
  ReserveStatus,
  SolsticeErrorCode,
  SolsticeInstance,
} from "@/app/api/solstice/types";

const BASE = "/api/solstice/instances";

// Demo holder identity for the read panels (positions/reservations). Going live
// swaps this for the connected wallet's address.
export const SOLSTICE_DEMO_ADDRESS =
  "tb1qs0lst1cedem0addressmock00000000000q9k2xr";

// Surfaces the machine-readable `code` so callers can branch on QUOTE_EXPIRED /
// RESERVE_STALE / AMOUNT_BELOW_MIN etc. (spec §1 error envelope).
export class SolsticeApiError extends Error {
  code?: SolsticeErrorCode;
  statusCode: number;
  constructor(statusCode: number, message: string, code?: SolsticeErrorCode) {
    super(message);
    this.name = "SolsticeApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function unwrap<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new SolsticeApiError(
      res.status,
      data?.message ?? `Request failed (${res.status})`,
      data?.code,
    );
  }
  return data as T;
}

function postJson<T>(url: string, body: unknown): Promise<T> {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => unwrap<T>(r));
}

export const solsticeApi = {
  listInstances: () => fetch(BASE).then((r) => unwrap<SolsticeInstance[]>(r)),

  getReserves: (id: string) =>
    fetch(`${BASE}/${id}/reserves`).then((r) => unwrap<ReserveStatus>(r)),

  getQuote: (
    id: string,
    opts: { side: "invest" | "redeem"; amountSats?: number },
  ) => {
    const params = new URLSearchParams({ side: opts.side });
    if (opts.amountSats != null)
      params.set("amount_sats", String(opts.amountSats));
    return fetch(`${BASE}/${id}/quote?${params.toString()}`).then((r) =>
      unwrap<RatioQuoteResponse>(r),
    );
  },

  buildInvest: (id: string, body: InvestBuildRequest) =>
    postJson<InvestBuildResponse>(`${BASE}/${id}/invest`, body),

  submitInvest: (id: string, swapId: string, signedPsbt: string) =>
    postJson<InvestSubmitResponse>(`${BASE}/${id}/invest/submit`, {
      swap_id: swapId,
      signed_psbt_base64: signedPsbt,
    }),

  buildRedeem: (id: string, body: RedeemBuildRequest) =>
    postJson<RedeemBuildResponse>(`${BASE}/${id}/redeem`, body),

  submitRedeem: (
    id: string,
    handle: { swapId?: string; requestId?: string },
    signedPsbt: string,
  ) =>
    postJson<RedeemSubmitResponse>(`${BASE}/${id}/redeem/submit`, {
      swap_id: handle.swapId,
      request_id: handle.requestId,
      signed_psbt_base64: signedPsbt,
    }),

  getPositions: (id: string, address: string) =>
    fetch(`${BASE}/${id}/positions/${address}`).then((r) =>
      unwrap<PositionResponse>(r),
    ),

  getReservations: (id: string, address: string) =>
    fetch(`${BASE}/${id}/reservations/${address}`).then((r) =>
      unwrap<Reservation[]>(r),
    ),

  buildClaim: (id: string, body: ReservationClaimBuildRequest) =>
    postJson<ReservationClaimBuildResponse>(
      `${BASE}/${id}/reservations/claim`,
      body,
    ),
};

// Mocks the wallet leg: the real flow hands the PSBT to the connected wallet's
// signPSBT and returns the signed base64. Here we echo it back after a short
// delay so the invest/redeem flow reads end-to-end without a live wallet.
export async function mockSignPsbt(psbtBase64: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return psbtBase64;
}

export function useSolsticeInstances() {
  const [instances, setInstances] = useState<SolsticeInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setInstances(await solsticeApi.listInstances());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vaults");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { instances, isLoading, error, refresh };
}

// ---------------------------------------------------------------------------
// Display helpers (RT base units ⇄ display units, sats ⇄ BTC)
// ---------------------------------------------------------------------------

export function satsToBtc(sats: number): number {
  return sats / 1e8;
}

export function formatBtc(sats: number, dp = 6): string {
  return satsToBtc(sats).toFixed(dp);
}

// RT base units → display units string (divisibility-aware).
export function rtToDisplay(baseUnits: string, divisibility: number): string {
  const n = Number(baseUnits) / 10 ** divisibility;
  return n.toLocaleString(undefined, { maximumFractionDigits: divisibility });
}

// RT display units → base-units string for request bodies.
export function displayToRt(display: number, divisibility: number): string {
  return Math.floor(display * 10 ** divisibility).toString();
}
