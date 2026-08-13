import { decode } from "cborg";

import type { NodeUtxo } from "@/app/api/testnet/utxos/types";

// Server-only decoding of the L2 node's UTxO CBOR.
//
// `GET /utxos` returns entries whose `value` field is the hex CBOR of a whole
// Cardano TransactionOutput — address, amount and datum — not just the amount.
// Summing a balance therefore means deserializing each output and taking its
// coin, which is what the node itself does when it sizes the faucet
// (demo/midgard-node/src/services/faucet.ts, selectFaucetUtxo).
//
// Shapes handled, per sundial-monorepo/cddl-files/codec.cddl:
//
//   transaction_output = { 0 : address, 1 : value, ? 2 : data, ? 3 : script_ref }
//   value              = coin / [ coin, multiasset<positive_coin> ]
//
// The CDDL notes Midgard only emits the post-Alonzo map form, but the legacy
// array form (`[address, value, ?datum_hash]`) is accepted too: it costs three
// lines, and the node's own CML-based reader accepts both, so refusing it here
// would make this stricter than the thing producing the data.
//
// Import this from route handlers only — cborg is pure JS, but this module is
// server-side by intent and nothing here needs to reach the browser.

export class L2DecodeError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "L2DecodeError";
  }
}

// Map key / array index of `value` within a TransactionOutput. Same position in
// both encodings, which is why one constant covers them.
const AMOUNT_POSITION = 1;

const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length === 0 || hex.length % 2 !== 0) {
    throw new L2DecodeError(
      `UTxO output CBOR must be an even-length hex string (got length ${hex.length})`,
    );
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) {
      throw new L2DecodeError(
        `UTxO output CBOR contains non-hex characters at byte ${i}`,
      );
    }
    bytes[i] = byte;
  }
  return bytes;
};

// cborg yields a JS number for uints below 2^53 and a bigint above it, so both
// arrive here. Everything downstream is bigint: a lovelace total can exceed
// 2^53 (max ADA supply is ~4.5e16 lovelace), and silently going through float
// would round the balance.
const toCoin = (value: unknown): bigint => {
  if (typeof value === "bigint") {
    if (value < BigInt(0)) {
      throw new L2DecodeError(`UTxO output has a negative coin: ${value}`);
    }
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new L2DecodeError(
        `UTxO output has a non-integer or negative coin: ${value}`,
      );
    }
    return BigInt(value);
  }
  throw new L2DecodeError(
    `UTxO output coin is not a number (got ${value === null ? "null" : typeof value})`,
  );
};

// `value` is either a bare coin or a [coin, multiasset] pair. In the pair case
// only the coin is the lovelace; the multiasset map is other tokens.
//
// Note this counts the coin of multi-asset outputs. `selectFaucetUtxo` skips
// those, but it does so because it needs a lovelace-only UTxO it can spend —
// a different question from what an address holds.
const coinFromValue = (value: unknown): bigint =>
  Array.isArray(value) ? toCoin(value[0]) : toCoin(value);

const coinFromOutput = (cborHex: string): bigint => {
  let decoded: unknown;
  try {
    decoded = decode(hexToBytes(cborHex), {
      // Required: outputs are keyed by integer, and cborg's default object mode
      // rejects non-string map keys outright.
      useMaps: true,
      allowBigInt: true,
    });
  } catch (e) {
    if (e instanceof L2DecodeError) throw e;
    throw new L2DecodeError("UTxO output is not decodable CBOR", { cause: e });
  }

  if (decoded instanceof Map) {
    if (!decoded.has(AMOUNT_POSITION)) {
      throw new L2DecodeError("UTxO output map has no amount at key 1");
    }
    return coinFromValue(decoded.get(AMOUNT_POSITION));
  }

  if (Array.isArray(decoded)) {
    if (decoded.length <= AMOUNT_POSITION) {
      throw new L2DecodeError("UTxO output array has no amount at index 1");
    }
    return coinFromValue(decoded[AMOUNT_POSITION]);
  }

  throw new L2DecodeError(
    `UTxO output is neither a map nor an array (got ${typeof decoded})`,
  );
};

/**
 * Sums the lovelace across a node UTxO list.
 *
 * Throws `L2DecodeError` on the first undecodable entry rather than skipping
 * it: a partial sum is indistinguishable from a smaller balance, and the route
 * turns this into a 500 instead of showing a number that is quietly too low.
 */
export const sumUtxoLovelace = (utxos: readonly NodeUtxo[]): bigint => {
  let total = BigInt(0);
  for (const utxo of utxos) {
    if (typeof utxo?.value !== "string") {
      throw new L2DecodeError("UTxO entry is missing its `value` CBOR string");
    }
    total += coinFromOutput(utxo.value);
  }
  return total;
};
