# Transfer — what is mocked

Moves value between the places a user holds it. One surface, several protocols;
which one a transfer uses falls out of the endpoints picked, not out of a mode
the user selects. `lib/transfer/routes.ts` is the resolver.

**Routes describe movement; mechanisms own protocol.** A route says *what* is
happening between two chains; the mechanism says *how* it is carried out —
steps, confirmations, timing, trust model, its own fees. They used to be one
thing, which worked only while there was exactly one mechanism per direction.

| Route kind | Pair | Direction |
| --- | --- | --- |
| `peg_in` | base layer → Sundial L2 | `peg_in` |
| `peg_out` | Sundial L2 → base layer | `peg_out` |
| `same_layer` | same chain → same chain | `same_layer` |
| `unsupported` | everything else | — |

A route also carries `baseChain`: the non-L2 side of a cross-layer movement,
which is what decides whether a given mechanism can carry it.

## Route selection

Every routable pair has a **direction**, and direction decides which mechanisms
are candidates (`lib/transfer/mechanisms.ts`). The Route card renders them as a
"Route selection" dropdown; unavailable entries are listed and disabled with
"Coming soon" rather than hidden, so the roadmap stays visible.

They are called *mechanisms*, not bridges, because not every option is one — a
transfer between two wallets on the same network uses no bridge at all.

Support is declared **per direction**, not as one flag per mechanism, because
the two are independent — Charms carries peg-in today and is planned for
peg-out, and a single `isAvailable` boolean could only describe one of those.
A missing direction key means "does not address this direction at all", which
is a different statement from "not yet".

| Mechanism | peg-in | peg-out | same-layer | Chains | Notes |
| --- | --- | --- | --- | --- | --- |
| **Direct transfer** | — | — | Available | any | An ordinary transaction on the network itself. Covers wallet-to-wallet on Bitcoin, on Cardano, and within the L2. |
| **Charms Beaming** | Available | Coming soon | — | Bitcoin | Beams a charm onto the L2, authorized by a `scrolls_cardano` ICP threshold signature. The beam spec covers the deposit leg and scopes the withdraw leg out, so the peg-out entry is a roadmap position, not a capability. |
| **Pogun** | Coming soon | Coming soon | — | Bitcoin | Recorded as a BitVM-based Bitcoin bridge on a Q4 2026 roadmap, from search-indexed coverage rather than a primary source, so the registry carries only that one claim. Listed in both directions because nothing known excludes either — not because two-way support is confirmed. |
| **Bifrost** | Coming soon | Coming soon | — | unscoped | **No description, deliberately.** Nothing in this repo, the `charms-test` docs or the Sundial notes says what Bifrost is, and a plausible-sounding guess about a bridge's mechanism would be worse than a blank. Fill in `lib/transfer/mechanisms.ts` when the real answer is known. |

So today: peg-in offers one working mechanism and two coming soon; **peg-out
lists three entries, all coming soon**, and the form refuses to submit;
same-layer offers Direct transfer.

Selection is validated server-side in `app/api/transfer/initiate`, not just
disabled in the picker: a disabled `<option>` is a hint, not a control. Three
checks run there — the mechanism must be known, must cover the route's direction
**and base chain**, and must be *available for that direction*. Charms on a peg-out is
refused even though Charms is perfectly available for peg-in. Failures come back
as `MECHANISM_UNAVAILABLE`; pairs that do not route at all remain
`ROUTE_UNSUPPORTED`.

The client mirrors the same filtering, and derives its effective selection
rather than correcting it in an effect — an effect that rewrites the choice
whenever direction changes fights the user's own click and can loop.

**The UI and the `/api/transfer/*` contract are real. Everything behind them is
not.** No transaction is built or broadcast, no proof is generated, no canister
is called, nothing reaches any ledger. The step machine advances on a timer in
`lib/transfer/mock-service.ts`.

Balances, addresses and wallet connections **are** real — they come from the
live Reown (Bitcoin), lucid (Cardano) and `/api/testnet/utxos` (L2) paths.

Setting `TRANSFER_API_URL` makes every route proxy a real service and the mock
never runs. That variable is the whole switch.

## Why it is mocked

Four independent blockers, none of them fixable from this repo:

1. The transfer service — the stateful orchestrator every route depends on —
   does not exist in any repo.
2. The L2 block producer is down (`GET /commit` → `failed worker`). Operator-side.
3. The eBTC-style vault app that locks BTC and mints the bridged charm exists in
   no local repo.
4. testnet4 BTC cannot reach the finality-work target, so a real beam needs
   mainnet.

## Mocks, by the service that replaces them

### Every route

| Mocked | Replaced by |
| --- | --- |
| Unsigned source transaction | **Transfer service** — real transaction construction per chain (btc-locker/PSBT for Bitcoin, Lucid/CML for Cardano-family) |
| Per-transfer state | **Transfer service** — durable store. The in-process `Map` dies with the process; on serverless it dies between requests. |
| Broadcast + confirmation tracking | **Transfer service** — chain watchers (mempool.space for Bitcoin, Blockfrost/Ogmios for Cardano, the L2 node for L2) |
| Network fee estimates | **Transfer service** — a fee oracle plus a built transaction. Currently fixed plausible numbers, labelled as estimates in the UI. |

### `beam` only

| Mocked | Replaced by | Notes |
| --- | --- | --- |
| Placeholder + collateral UTxOs | **Transfer service** — L2 tx construction + `POST /submit` | Beam spec §3.1: put the placeholder at an **always-succeeds script address**, not a user pubkey address. A script input needs no vkey witness, so the receive is authorized by the Scrolls signature alone and the user never co-signs. |
| `nonce` / commitment storage | **Transfer service** — durable store | The derivation is **not** faked: `deriveCommitment` is the real `SHA256(txid_reversed ‖ vout_le32 ‖ nonce_le64)` from `charms-test/scripts/beam_commit.py`. What is mocked is where it lives. |
| The lock transaction | **eBTC-style vault app** | The `--app-bins` that burns on BTC and mints the bridged charm on the L2. Conceptually `CharmsDev/ebtc`; present in no local repo. **The single biggest build item.** |
| `confirming (N/6)` | **BTC mainnet watcher** | mempool.space **mainnet**, assembling `!bitcoin {tx, proof, headers}` from a merkleblock proof plus the chained headers. |
| `proving` | **charms prover** | Hosted `v15.charms.dev/spells/prove` or self-hosted. ~2 proofs per beam; decide who operates and who pays. |
| `scrolls_sign` | **ICP agent** → `scrolls_cardano.sign` | Canister `tty7k-waaaa-aaaak-qvngq-cai` on IC mainnet, via `@dfinity/agent`. Port from `charms/scrolls/src/scrolls-api`; a 38-line reference call lives at `charms-test/scripts/scrolls-call/call.mjs`. |
| `submitting` → `settled` | **Sundial L2 node** `POST /submit` + operator block production | Transaction hex goes in the **request body**; the `?tx_cbor=` query form returns `400 Invalid CBOR provided`. "Enqueued" ≠ "applied". |
| `SCROLLS_FIXED_COST = 420000` | Live `scrolls_cardano.config()` | The canister can change it. It also gates the mandatory fee output, which must sit at index `spell.tx.outs.len()` and match `fee_address[network]` or signing is refused. |

## What is deliberately real

- **The secrecy boundary.** The beam `nonce` is generated in `mock-service.ts`
  and never enters a response body, exactly as it must not in production — it is
  half the commitment, and whoever holds it can claim the beam. Same for signing
  keys and the L2 node URL.
- **Server-submit.** The browser signs but never broadcasts. The signed source
  transaction goes to `/api/transfer/submit-signed-source` and the service
  broadcasts it, so there is no window where funds have moved and nothing is
  tracking them. This is the opposite of the escrow staking flow — **do not**
  route a transfer through `/api/btc-broadcast`.
- **Route resolution.** The server re-resolves the route from the chain pair at
  initiate rather than trusting the client's answer. A client-declared route kind
  would be a client-declared trust model, and the beam's threshold authorization
  is not something a caller gets to opt into.
- **Resumability.** The browser stores only a `transferId`; step, confirmations
  and the unsigned transaction are re-read from the service every mount.
- **Wallets and balances.** Reown (Bitcoin), lucid (Cardano) and
  `/api/testnet/utxos` (L2) are all live.

## Known gaps in the UI itself

- **In-browser signing is Bitcoin-only.** The Reown connector is wired;
  Cardano-source transfers fall back to "copy the transaction and sign it in
  your wallet". Wiring lucid's `signTx` is the fix.
- **The Sundial L2 has no wallet integration**, so its account is entered by
  hand, sharing the `sundial:l2-address` key with the staking form and balance
  card.

## One deviation from the beam spec

Spec §5's status shape does not return the unsigned transaction, but without it
a refresh during `awaiting_signature` strands the transfer — it was returned
once by `initiate` and is gone. `TransferStatusSuccessResponse` therefore
re-serves `sourceUnsignedTx` while that step is active, and null afterwards. The
alternative was caching it in the browser, which is what §4 exists to prevent.

Also note spec §4/§5 give the balance route as `/api/l2/utxos`; it is now
`/api/testnet/utxos`.

## Still undecided — not the UI's call

From `charms-test/docs/l2-beam-integration.md` §3, and both change what gets
built above:

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

## Adding more chains

The four things that used to block this are done. Protocol facts live on the
mechanism, so a second mechanism on a direction no longer collides with the
first:

- **`MechanismProfile`** holds steps, confirmations, ETA, threshold-authorization
  and any mechanism fee, declared per direction. Charms' seven-step beam is a
  Charms fact, not a peg-in fact.
- **`chains`** scopes a mechanism to the base layers it bridges, so Charms is not
  offered for an Ethereum peg-in the moment that pair resolves.
- **`nativeSettlement(chain)`** supplies the profile for `direct`, because how a
  same-network send settles is a property of the ledger, not of a mechanism.
- **Route kinds name movements** (`peg_in`/`peg_out`/`same_layer`), not
  mechanisms. The old `beam`/`beam_out` names were what let mechanism-specific
  data ride on the route.

Adding a chain is now: an entry in `chainConfigs`, a wallet integration in
`hooks/dashboard/transfer-endpoints.ts`, a branch in `resolveTransferRoute`, and
— if it needs a new bridge — an entry in `mechanisms.ts` with its own profile.
No existing mechanism has to change.

One thing still to watch: `resolveTransferRoute` is a hand-written if-ladder.
It reads clearly at five chains; past roughly a dozen it wants to be table-driven.
