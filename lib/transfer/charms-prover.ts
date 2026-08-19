import "server-only";

// Client for the Charms Prover API.
//
// https://docs.charms.dev/reference/prover-api/ — the request/response shape
// below was captured directly from `charms spell prove --payload` against real
// data from the live Sundial L2 node this session, and cross-checked against
// the documented reference (both agree). `deriveDest` for Cardano was verified
// byte-for-byte against `charms util dest --addr <addr> --chain=cardano`:
// bech32-decoding an address IS the derivation — no CML/wasm needed.
//
// This calls the real prover over HTTP. It does not shell out to the `charms`
// CLI or depend on WSL: the CLI's own `--payload` output showed that what it
// sends is structurally the same NormalizedSpell as the YAML templates in
// charms-test/my-token/spells/ — that JSON object goes straight into the POST
// body, per the documented `spell: object | string` field.

const DEFAULT_PROVE_API_URL = "https://v15.charms.dev/spells/prove";

export const proveApiUrl = (): string =>
  process.env.CHARMS_PROVE_API_URL?.trim() || DEFAULT_PROVE_API_URL;

export class ProverError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ProverError";
    this.status = status;
  }
}

// Rejected by the prover itself — a 400. The spell, an amount, or an address is
// wrong. Distinct from a 500/network failure, which is retryable and not the
// caller's fault; a 400 is fixed by changing the request, not by waiting.
export class ProverRejectedError extends ProverError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ProverRejectedError";
  }
}

export type SpellApp =
  // NFT app: tag/identity_hex/vk_hex -> null.
  | { kind: "nft"; identity: string; vk: string }
  // Fungible-token app.
  | { kind: "token"; identity: string; vk: string };

const appKey = (app: SpellApp): string => {
  const tag = app.kind === "nft" ? "n" : "t";
  return `${tag}/${app.identity}/${app.vk}`;
};

export interface SpellCoin {
  amount: number;
  // Bitcoin scriptPubKey or Cardano address bytes, hex. Use `deriveDest`.
  dest: string;
}

// A NormalizedSpell, per https://docs.charms.dev/reference/spell/ — the same
// shape as the YAML templates in charms-test/my-token/spells/, just as a plain
// object instead of YAML text.
export interface Spell {
  version: 15;
  tx: {
    ins: string[];
    outs: Array<Record<number, Record<string, unknown>>>;
    beamed_outs?: Record<number, string>;
    coins: SpellCoin[];
  };
  app_public_inputs: Record<string, unknown>;
}

export type PrevTx =
  | { cardano: string }
  // Plain hex, no finality wrapper. This is the same form
  // charms-test/scripts/beam-04-receive-cardano.sh itself used for its one
  // validated demo run — testnet4 BTC cannot reach the finality-work target,
  // so a full `{tx, proof, headers}` wrapper was never exercised even in the
  // reference repo. Real finality assembly (merkleblock proof + chained
  // headers from a mainnet lock) is a separate, unbuilt piece.
  | { bitcoin: string };

export interface ProveRequest {
  spell: Spell;
  // Input index -> beamed source. Second element is the nonce that binds the
  // claim to the commitment — see lib/transfer/mock-service.ts's
  // deriveCommitment for the derivation this must match.
  //
  // Nonce is a decimal-string u64, not a `number`: JS numbers lose precision
  // above 2^53, and a real nonce routinely exceeds it. `proveSpell` splices
  // this in as a raw (unquoted) JSON integer literal — see NONCE_TOKEN below —
  // so the value that leaves this process is never rounded by JS at all.
  tx_ins_beamed_source_utxos?: Record<string, [string, string] | [string]>;
  binaries?: Record<string, string>;
  prev_txs?: PrevTx[];
  change_address: string;
  fee_rate?: number;
  chain: "bitcoin" | "cardano";
  collateral_utxo?: string;
}

export type ProvedTx = { bitcoin: string } | { cardano: string };

/**
 * Cardano address -> the raw bytes `coins[].dest` expects.
 *
 * Verified: bech32-decoding `addr_test1vq472u5jkqrkcrrcz9sk7qxjc95jvjynd202ldtstwg9njgf3m8zg`
 * this way produces exactly what `charms util dest --chain=cardano` printed
 * for the same address (`602be572…9c9`) — this is the whole derivation, not
 * an approximation of it.
 */
export const deriveCardanoDest = async (address: string): Promise<string> => {
  const { bech32 } = await import("bech32");
  const decoded = bech32.decode(address, 1000);
  return Buffer.from(bech32.fromWords(decoded.words)).toString("hex");
};

/**
 * Bitcoin address -> its scriptPubKey, hex.
 *
 * Standard `bitcoinjs-lib` output-script derivation. Not independently
 * cross-checked against `charms util dest` the way the Cardano path was — that
 * would need a real BTC address on hand — but the library and algorithm are
 * the same ones the rest of this codebase already trusts for PSBT work
 * (lib/psbt-finalize.ts).
 */
export const deriveBitcoinDest = async (
  address: string,
  network: "mainnet" | "testnet",
): Promise<string> => {
  const bitcoin = await import("bitcoinjs-lib");
  const net =
    network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  const script = bitcoin.address.toOutputScript(address, net);
  return Buffer.from(script).toString("hex");
};

export const spellAppPublicInputKey = appKey;

// `JSON.stringify` cannot serialize a bigint, and parsing the nonce into a
// `number` first is exactly the precision loss this exists to avoid. Instead,
// stringify with the nonce replaced by this sentinel (a valid JSON string,
// so `JSON.stringify` accepts it structurally), then splice the real digits
// in as a bare integer literal via a targeted text replace. The sentinel is
// deliberately not valid decimal, so it cannot collide with a real nonce that
// this same call also happens to be sending.
const NONCE_TOKEN = "__CHARMS_NONCE_TOKEN__";

const serializeProveRequest = (request: ProveRequest): string => {
  const withToken: ProveRequest = request.tx_ins_beamed_source_utxos
    ? {
        ...request,
        tx_ins_beamed_source_utxos: Object.fromEntries(
          Object.entries(request.tx_ins_beamed_source_utxos).map(
            ([index, entry]) => [
              index,
              entry.length === 2 ? [entry[0], NONCE_TOKEN] : entry,
            ],
          ),
        ) as Record<string, [string, string] | [string]>,
      }
    : request;

  const json = JSON.stringify(withToken);

  const nonces = Object.values(request.tx_ins_beamed_source_utxos ?? {})
    .filter((entry): entry is [string, string] => entry.length === 2)
    .map((entry) => entry[1]);

  for (const nonce of nonces) {
    if (!/^\d+$/.test(nonce)) {
      throw new ProverRejectedError(`Nonce must be a non-negative integer: ${nonce}`);
    }
  }

  // One token per beamed input in this request; replaceAll is correct because
  // every occurrence of the sentinel *is* a nonce placeholder — nothing else
  // in the payload can contain this exact string.
  let index = 0;
  return json.replace(new RegExp(`"${NONCE_TOKEN}"`, "g"), () => nonces[index++]);
};

/**
 * Calls `POST /spells/prove`. Runs the app contracts, generates the proof, and
 * returns the ready-to-sign transaction(s) — real proving, on the real
 * network, exactly per https://docs.charms.dev/reference/prover-api/.
 *
 * Costs real $PROVE from whichever Succinct account the target prover bills to
 * (~$3/proof against the hosted default). Nothing in this module decides
 * whether that's acceptable to spend — the caller does.
 */
export const proveSpell = async (
  request: ProveRequest,
): Promise<ProvedTx[]> => {
  const url = proveApiUrl();

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serializeProveRequest(request),
    });
  } catch (e) {
    console.error("Prover API request failed:", e);
    throw new ProverError(`The prover at ${url} is unreachable.`);
  }

  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new ProverError(
      `The prover returned a non-JSON response: ${text.slice(0, 200)}`,
    );
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : text.slice(0, 300);
    if (response.status >= 400 && response.status < 500) {
      throw new ProverRejectedError(message);
    }
    throw new ProverError(message, response.status);
  }

  if (!Array.isArray(body)) {
    throw new ProverError("The prover returned an unexpected response shape.");
  }
  return body as ProvedTx[];
};
