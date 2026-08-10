import { NextRequest, NextResponse } from "next/server";
import { sumUtxoLovelace } from "@/lib/l2/decode-output";
import {
  LOVELACE_PER_UNIT,
  type L2BalanceCode,
  type L2BalanceErrorResponse,
  type L2BalanceResponse,
  type NodeUtxo,
} from "./types";

// Single integration point between sundial-web and the Sundial L2 node's
// `GET /utxos?address=<bech32>` endpoint (internal-docs/api.md §4).
//
// The browser cannot call the node directly: it serves no CORS headers, and its
// UTxOs come back as raw CBOR. This route proxies the call, decodes the CBOR
// server-side and returns plain numbers, so the node URL stays server-side and
// no CBOR decoder reaches the client.
//
// A missing `SUNDIAL_L2_NODE_URL` is an error, never a fallback: this route
// reports real money, so a misconfigured deployment must fail loudly rather
// than serve a plausible number nobody can tell is wrong.

// Balances are per-request state; never cache them.
export const dynamic = "force-dynamic";

// Trim a trailing slash so we can safely append the endpoint path.
const nodeBaseUrl = (): string | null => {
  const raw = process.env.SUNDIAL_L2_NODE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
};

const error = (
  status: number,
  code: L2BalanceCode,
  message: string,
): NextResponse<L2BalanceResponse> => {
  const body: L2BalanceErrorResponse = { error: message, code };
  return NextResponse.json(body, { status });
};

// Cheap shape check only. The node re-validates through Lucid's
// `getAddressDetails` and rejects addresses without a payment credential, so
// this exists to reject obvious junk before we make a network call.
const isBech32PaymentAddress = (address: string): boolean =>
  /^addr(_test)?1[0-9ac-hj-np-z]{10,}$/.test(address);

export async function GET(
  request: NextRequest,
): Promise<NextResponse<L2BalanceResponse>> {
  const address = request.nextUrl.searchParams.get("address")?.trim() ?? "";

  if (!address) {
    return error(400, "ADDRESS_INVALID", "An address is required.");
  }
  if (!isBech32PaymentAddress(address)) {
    return error(
      400,
      "ADDRESS_INVALID",
      "Enter a valid Cardano bech32 payment address.",
    );
  }

  const baseUrl = nodeBaseUrl();
  if (!baseUrl) {
    return error(
      503,
      "NOT_CONFIGURED",
      "The L2 node is not configured on this deployment.",
    );
  }

  let nodeResponse: Response;
  try {
    nodeResponse = await fetch(
      `${baseUrl}/utxos?address=${encodeURIComponent(address)}`,
      { cache: "no-store" },
    );
  } catch (e) {
    console.error("L2 utxos request failed:", e);
    return error(
      502,
      "NODE_UNAVAILABLE",
      "The L2 node is currently unreachable. Please try again shortly.",
    );
  }

  let nodeBody: Record<string, unknown> = {};
  try {
    nodeBody = (await nodeResponse.json()) as Record<string, unknown>;
  } catch {
    // Non-JSON response (e.g. a gateway error page) — fall through to the
    // status handling below with an empty body.
  }

  if (!nodeResponse.ok) {
    // The node answers an unparseable address with 400 and an `error` string.
    // Anything else is a backend problem the browser can do nothing about, so
    // it collapses into a generic message rather than leaking internals.
    if (nodeResponse.status === 400) {
      return error(
        400,
        "ADDRESS_INVALID",
        typeof nodeBody.error === "string"
          ? nodeBody.error
          : "The L2 node rejected that address.",
      );
    }
    console.error(
      `L2 utxos request returned ${nodeResponse.status}`,
      nodeBody.error,
    );
    return error(
      502,
      "NODE_UNAVAILABLE",
      "The L2 balance could not be read. Please try again later.",
    );
  }

  const utxos = nodeBody.utxos;
  if (!Array.isArray(utxos)) {
    console.error("L2 utxos response had no utxos array:", nodeBody);
    return error(
      502,
      "NODE_UNAVAILABLE",
      "The L2 node returned an unexpected response.",
    );
  }

  let lovelace: bigint;
  try {
    lovelace = sumUtxoLovelace(utxos as NodeUtxo[]);
  } catch (e) {
    console.error("Failed to decode L2 UTxOs:", e);
    return error(
      500,
      "INTERNAL",
      "The L2 balance could not be read. Please try again later.",
    );
  }

  return NextResponse.json({
    address,
    lovelace: lovelace.toString(),
    balance: Number(lovelace) / LOVELACE_PER_UNIT,
    utxoCount: utxos.length,
  });
}
