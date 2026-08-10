import type { ApiErrorResponse } from "../../types";

// L2 balance API types.
//
// The Sundial L2 node exposes `GET /utxos?address=<bech32>` returning raw CBOR
// (see internal-docs/api.md §4). This route is the single integration point
// between sundial-web and that endpoint: it does the CBOR decoding server-side
// and hands the browser plain numbers, so no CML/wasm ever reaches the client
// bundle. The node URL never leaves the server.

export type L2BalanceCode =
  // The `address` query param is missing, malformed, or not a bech32 payment address.
  | "ADDRESS_INVALID"
  // Surfaced when this route cannot reach or parse a response from the node.
  | "NODE_UNAVAILABLE"
  // Surfaced when SUNDIAL_L2_NODE_URL is not set on this deployment.
  | "NOT_CONFIGURED"
  | "INTERNAL";

export interface L2BalanceSuccessResponse {
  // The bech32 address the balance was resolved for.
  address: string;
  // Total spendable lovelace, as a decimal string (matches the node's
  // serialization and avoids precision loss on values above 2^53).
  lovelace: string;
  // `lovelace` scaled to whole units — the L2 ledger uses 6 decimals. This is
  // bridged BTC, so the UI denominates it in BTC and marks the layer; see
  // lib/btc-sources.ts.
  balance: number;
  // Number of UTxOs backing the balance.
  utxoCount: number;
}

export interface L2BalanceErrorResponse extends ApiErrorResponse {
  code: L2BalanceCode;
}

export type L2BalanceResponse =
  | L2BalanceSuccessResponse
  | L2BalanceErrorResponse;

// The L2 ledger uses 6 decimals, so 1 bridged BTC = 1_000_000 of its base unit
// (the node calls that unit lovelace). Display naming lives in lib/btc-sources.ts.
export const L2_DECIMALS = 6;
export const LOVELACE_PER_UNIT = 1_000_000;

// Shape of the node's `GET /utxos` success body. Note that `value` is a
// misnomer inherited from the node: it holds the hex CBOR of the entire
// TransactionOutput (address + amount + datum), not just the amount.
export interface NodeUtxo {
  outref: string;
  value: string;
}

export interface NodeUtxosResponse {
  utxos: NodeUtxo[];
}
