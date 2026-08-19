import "server-only";

import { readFile } from "fs/promises";
import { join } from "path";

import {
  deriveCardanoDest,
  spellAppPublicInputKey,
  type ProveRequest,
  type Spell,
  type SpellApp,
} from "./charms-prover";

// Assembles the beam-receive spell for a peg-in.
//
// Structurally identical to charms-test/my-token/spells/beam-receive.yaml —
// same fields, same semantics, just as a JS object built from real inputs
// instead of an envsubst'd YAML file. §6.2's fee-output requirement (an output
// to `config.fee_address[network]` at index `spell.tx.outs.len()`, or
// `scrolls_cardano.sign` refuses the transaction) is encoded directly rather
// than left to the caller to remember.

// The one Charms app that exists anywhere to test against. `my-token` is a
// generic demo NFT app (charms-test/my-token) — it does not lock BTC or mint
// bridged value. Using it proves the beam-receive *mechanism* for real: a real
// prover, real Scrolls verification, a real L2 submission. It does not move
// real bridged BTC, because no vault app that could do that exists in any repo
// (see app/dashboard/transfer/README.md).
//
// Identity and vk are captured from an already-executed real demo run
// (charms-test/beam-state/state.env, NFT_MINT_TXID / APP_VK) — this is the
// actual identity of a specific NFT that was actually minted and beamed once
// before. Replaying a beam-receive against it depends on that NFT's current
// on-chain state, which nothing here verifies; a mint through a fresh Bitcoin
// lock would carry its own fresh identity instead.
export const DEMO_APP: SpellApp = {
  kind: "nft",
  identity: "552f98b581ed0ed2ee853ec21fbcb53879acfbc20431a5d6cc86ad79ff4cce75",
  vk: "87c7a2c3512502d63e0907a10cf753e2a2f3479dd1daa3b17fdbba4e497ac3b1",
};

const DEMO_APP_WASM_PATH = join(
  process.cwd(),
  "lib/transfer/charms-apps/my-token.wasm",
);

let cachedWasmBase64: string | null = null;
const demoAppWasmBase64 = async (): Promise<string> => {
  if (cachedWasmBase64) return cachedWasmBase64;
  const bytes = await readFile(DEMO_APP_WASM_PATH);
  cachedWasmBase64 = bytes.toString("base64");
  return cachedWasmBase64;
};

export interface ScrollsFee {
  address: string;
  amount: number;
}

export interface BeamReceiveParams {
  // The L2 UTxO the beam commits to (spec §3.1) — `<txid>:<vout>`.
  placeholderUtxoId: string;
  // Hex CBOR of the transaction that created it (fetched via lib/transfer/l2-node.ts).
  placeholderPrevTxCbor: string;
  collateralUtxoId: string;
  // Where the re-materialized charm's native coin lands.
  recipientAddress: string;
  recvAmount: number;
  changeAddress: string;
  // The beam-send output on the source chain — `<txid>:<vout>` — plus the
  // nonce that binds it to the commitment. Held by whoever ran the beam-send;
  // there is no hosted Bridging Service generating or custodying it here.
  sourceUtxoId: string;
  // Decimal string — see ProveRequest's nonce doc comment in charms-prover.ts
  // for why this is never a `number`.
  nonce: string;
  // Plain hex, no finality wrapper — see PrevTx's doc comment in
  // charms-prover.ts for why this, not `{tx, proof, headers}`, matches the one
  // demo run charms-test itself actually completed.
  sourceTxHex: string;
  fee: ScrollsFee;
  // true only for pipeline verification — the resulting transaction cannot be
  // threshold-signed by Scrolls (it re-verifies the real proof) or accepted
  // on-chain. Costs nothing at the prover; fails loudly, for real, at the
  // scrolls.sign() step that follows this.
  mock?: boolean;
}

export const buildBeamReceiveRequest = async (
  params: BeamReceiveParams,
): Promise<ProveRequest> => {
  const dest = await deriveCardanoDest(params.recipientAddress);
  const feeDest = await deriveCardanoDest(params.fee.address);
  const wasmBase64 = await demoAppWasmBase64();

  const spell: Spell = {
    version: 15,
    tx: {
      ins: [params.placeholderUtxoId],
      // State mirrors the fixed demo shape my-token/spells/beam-receive.yaml
      // itself uses (ticker MY-TOKEN, remaining 100000) — the app contract
      // checks this matches what was beamed out, so it is not a free choice.
      outs: [{ 0: { ticker: "MY-TOKEN", remaining: 100000 } }],
      coins: [
        { amount: params.recvAmount, dest },
        // Scrolls fee output. Must be exactly here — index spell.tx.outs.len(),
        // i.e. the first (and here only) coins[] entry — or sign() refuses.
        { amount: params.fee.amount, dest: feeDest },
      ],
    },
    app_public_inputs: { [spellAppPublicInputKey(DEMO_APP)]: null },
  };

  const request: ProveRequest = {
    spell,
    tx_ins_beamed_source_utxos: {
      "0": [params.sourceUtxoId, params.nonce],
    },
    binaries: { [DEMO_APP.vk]: wasmBase64 },
    prev_txs: [
      { cardano: params.placeholderPrevTxCbor },
      { bitcoin: params.sourceTxHex },
    ],
    change_address: params.changeAddress,
    chain: "cardano",
    collateral_utxo: params.collateralUtxoId,
  };

  if (params.mock) {
    (request.spell as unknown as { mock: boolean }).mock = true;
  }

  return request;
};
