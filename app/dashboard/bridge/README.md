# Bridge (peg-in) — what is mocked

Frontend half of `charms-test/docs/beam-to-l2-frontend-spec.md`: native BTC on
Bitcoin → bridged BTC on the Sundial L2, authorized by a `scrolls_cardano` ICP
threshold signature rather than an on-chain Groth16 verifier.

**The UI and the `/api/bridge/*` contract are real. Everything behind them is
not.** No Bitcoin transaction is built or broadcast, no proof is generated, no
canister is called, nothing reaches the L2. The step machine advances on a timer
in `lib/bridge/mock-service.ts`.

Setting `BRIDGE_API_URL` makes every route proxy a real service and the mock
never runs. That variable is the whole switch.

## Why it is mocked

Four independent blockers, none of them fixable from this repo:

1. The Bridging Service — the stateful orchestrator the whole flow depends on —
   does not exist in any repo.
2. The L2 block producer is down (`GET /commit` → `failed worker`). Operator-side.
3. The eBTC-style vault app that locks BTC and mints the bridged charm exists in
   no local repo.
4. testnet4 BTC cannot reach the finality-work target, so a real beam needs
   mainnet.

## Mocks, by the service that replaces them

| Mocked | Replaced by | Notes |
| --- | --- | --- |
| Placeholder + collateral UTxOs (`initiate`) | **Bridging Service** — L2 tx construction (Lucid/CML) + `POST /submit` | Spec §3.1: put the placeholder at an **always-succeeds script address**, not a user pubkey address. A script input needs no vkey witness, so the receive is authorized by the Scrolls signature alone and the user never co-signs. |
| Per-request state (`nonce`, commitment, txids) | **Bridging Service** — durable store | The nonce derivation is **not** faked: `deriveCommitment` is the real `SHA256(txid_reversed ‖ vout_le32 ‖ nonce_le64)` from `scripts/beam_commit.py`. What is mocked is where it lives — an in-process `Map` that dies with the process. Real needs Postgres/KV. |
| Unsigned beam-send PSBT | **Bridging Service** + **eBTC-style vault app** | The `--app-bins` that burns on BTC and mints the bridged charm on the L2. Conceptually `CharmsDev/ebtc`; present in no local repo. **The single biggest build item.** |
| `confirming (N/6)` | **BTC mainnet watcher** | mempool.space **mainnet**, assembling `!bitcoin {tx, proof, headers}` from a merkleblock proof plus the chained headers. |
| `proving` | **charms prover** | Hosted `v15.charms.dev/spells/prove` or self-hosted. ~2 proofs per beam; decide who operates and who pays. |
| `scrolls_sign` | **ICP agent** → `scrolls_cardano.sign` | Canister `tty7k-waaaa-aaaak-qvngq-cai` on IC mainnet, via `@dfinity/agent`. Port from `charms/scrolls/src/scrolls-api`; a 38-line reference call lives at `charms-test/scripts/scrolls-call/call.mjs`. |
| `submitting` → `applied` | **Sundial L2 node** `POST /submit` + operator block production | Tx hex goes in the **request body**; the `?tx_cbor=` query form returns `400 Invalid CBOR provided`. "Enqueued" ≠ "applied". |
| Miner fee estimate | **Bridging Service** — fee oracle + a built transaction | Currently a fixed plausible number. |
| `SCROLLS_FIXED_COST = 420000` | Live `scrolls_cardano.config()` | The canister can change it. It also gates the mandatory fee output, which must sit at index `spell.tx.outs.len()` and match `fee_address[network]` or signing is refused. |

## What is deliberately real

- **The secrecy boundary.** The `nonce` is generated in `mock-service.ts` and
  never enters a response body, exactly as it must not in production — it is
  half the commitment, and whoever holds it can claim the beam. Same for signing
  keys and the L2 node URL.
- **Server-submit.** The browser signs but never broadcasts. The signed source
  tx goes to `/api/bridge/submit-signed-source` and the service broadcasts it,
  so there is no window where BTC is locked and nothing is watching for it.
  This is the opposite of the escrow staking flow — **do not** route a bridge tx
  through `/api/btc-broadcast`.
- **Resumability.** The browser stores only a `bridgeRequestId`; step,
  confirmations and the unsigned PSBT are re-read from the service every mount.

## One deviation from the spec

Spec §5's status shape does not return the unsigned PSBT, but without it a
refresh during `awaiting_source_lock` strands the request — the PSBT was
returned once by `initiate` and is gone. `BridgeStatusSuccessResponse` therefore
re-serves `sourceUnsignedPsbt` while that step is active, and null afterwards.
The alternative was caching it in the browser, which is what §4 exists to
prevent.

Also note spec §4/§5 give the balance route as `/api/l2/utxos`; it is now
`/api/testnet/utxos`.

## Still undecided — not the UI's call

From `l2-beam-integration.md` §3, and both change what gets built above:

1. **Trust model.** *Beam-verified* (BTC PoW finality baked into the spell proof,
   Scrolls verifies the whole thing — trust-minimized, needs the finality
   pipeline and the vault app) vs. *service-mediated* (Scrolls signs a plain mint
   and the BTC↔mint link is enforced only by a trusted service).
2. **BTC custody shape.** Is BTC locked to a `scrolls_bitcoin`-derived
   threshold-controlled vault address, or to a charms carrier? Peg-in has to put
   the BTC somewhere the user cannot reclaim, or the mint is unbacked.

Unverified: whether `scrolls_cardano.sign` accepts a real beam-**receive** (with
`beamed_outs` and a BTC finality prev-tx) off-chain. Only a plain mint has been
tested.
