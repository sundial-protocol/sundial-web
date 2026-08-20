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

## Modes

Four implementations answer `app/api/transfer/*`, in precedence order:

| | When | What runs |
| --- | --- | --- |
| **external** | `TRANSFER_API_URL` set | Proxy an external transfer service. Nothing in this repo runs. |
| **live** | `TRANSFER_MODE=live` | `lib/transfer/live-service.ts` — the **real** L2 node and the **real** Scrolls canister, as far as the pipeline exists. |
| **demo** | `TRANSFER_MODE=demo` | `lib/transfer/demo-service.ts` — a **real** wallet-signed broadcast to Bitcoin testnet, then `lib/transfer/mock-service.ts`'s same timer for everything after. |
| **mock** | otherwise (default) | `lib/transfer/mock-service.ts` — the step machine on a timer. |

The active mode is on the wire as `mode` on initiate and status, so the UI
branches on fact rather than on an absent flag. `GET /api/transfer/mode` serves
it before any transfer exists, which is what the badge beside the tab heading
reads — served by the same functions the routes dispatch on, so it cannot claim
"Simulated" while live mode moves real funds. A `NEXT_PUBLIC_` copy of the
setting could drift; this cannot. The badge renders nothing if the lookup fails,
because no claim beats a wrong one.

### Live mode

Real, and verified against the live endpoints:

- **`POST /submit`** to the L2 node. Hex in the **body** — the `?tx_cbor=` query
  form returns `400 Invalid CBOR provided`. Returns the node's queue id.
- **`scrolls_cardano.sign()`** on IC mainnet (`tty7k-waaaa-aaaak-qvngq-cai`),
  for mechanisms that need the threshold signature.
- **`scrolls_cardano.config()`** for the live fee and fee addresses, read rather
  than trusting the compiled constant — the canister can change it.
- **The Charms Prover API** (`lib/transfer/charms-prover.ts`,
  `lib/transfer/charms-beam-receive.ts`) — genuinely builds and proves the
  beam-receive transaction, given an existing placeholder and beam-send. This
  is a real HTTP POST to `docs.charms.dev/reference/prover-api` (default
  `https://v15.charms.dev/spells/prove`, overridable via
  `CHARMS_PROVE_API_URL`), not a CLI shell-out — see "How the prover call
  works" below for how that was confirmed. Reachable from the live signing
  panel via `BeamReceiveForm`; `mock: true` verifies the pipeline for free
  (Scrolls still refuses the result, for real, since it re-verifies the actual
  proof).
- **Arrival**, read back from the destination address's UTxO count. `/submit`
  returning 200 means *enqueued*, not *applied*; block production is a separate
  operator-gated step, so the only honest "settled" is seeing it land. While the
  block producer is down this correctly never fires.

Not built, and **refuses rather than fakes**:

- **The placeholder and the source beam-send themselves.** Building the
  placeholder needs Cardano ledger protocol parameters for whatever network the
  L2 testnet settles to (confirmed: **preprod** — Sam, 2026-08-18); building the
  beam-send needs a real BTC wallet and, for anything beyond the demo NFT app,
  a value-locking vault app that exists in no repo. `BeamReceiveForm` takes
  both as inputs — e.g. from charms-test's own `beam-0{1,2,3}` scripts — it
  does not create them.
- **Real bridged value.** `my-token` (`lib/transfer/charms-apps/my-token.wasm`,
  copied from `charms-test`) is the only Charms app anywhere to prove against.
  It is a generic demo NFT app — proving through it exercises the mechanism for
  real, not a fake, but it never moves real bridged BTC.
- **Non-L2 destinations.** `/submit` is an L2 endpoint. A Bitcoin destination is
  refused with a message naming what is missing.

Errors from real infrastructure are passed through, and a refusal is kept
distinct from an outage throughout — a Scrolls **refusal**
(`ScrollsRefusedError`) or a prover **rejection** (`ProverRejectedError`) means
the transaction is wrong (`SIGNED_TX_INVALID`, with the service's own
diagnostic); a Scrolls or prover **outage** means the service is unreachable
(`SERVICE_UNAVAILABLE`). Collapsing them would tell a user to wait when they
need to fix their transaction.

#### How the prover call works

`charms spell prove --payload` was run once, locally, purely to read the wire
format it sends — not as a runtime dependency (Sam was explicit: the live path
calls the real server, not WSL). That capture, cross-checked against
`docs.charms.dev/reference/prover-api`, showed the request is close to the
YAML spell templates already in `charms-test/my-token/spells/`: a plain JSON
object, not pre-compiled CBOR. Two things were verified against real data
rather than assumed:

- **`dest` derivation** — `charms util dest --addr <cardano-addr>` is exactly
  bech32-decoding the address; `deriveCardanoDest` reproduced the CLI's output
  byte-for-byte for a real address this session.
- **Nonce precision** — a real nonce is a u64 (up to ~1.8×10¹⁹). Routing it
  through a JS `number` silently corrupts it above 2^53 — caught by testing
  against a real captured nonce, which a naive `Number()` turned from
  `13366537103519653124` into `13366537103519654000`. `BeamReceiveInput.nonce`
  and `ProveRequest`'s nonce are decimal strings end to end;
  `serializeProveRequest` splices the digits into the JSON as a raw integer
  literal so the value is never parsed by JS at all.

Bitcoin `dest` derivation (`deriveBitcoinDest`, via `bitcoinjs-lib`) is
standard and used elsewhere in this codebase, but — unlike the Cardano path —
was **not** independently re-verified against `charms util dest` this session.

### Demo mode

Exists for one thing: showing a team a genuine, explorer-verifiable Bitcoin
testnet transaction without depending on the parts of the real pipeline that
are not built (the placeholder builder, a chain observer, a live L2 block
producer — see "Why the rest is mocked" below). It is a deliberate hybrid, and
`lib/transfer/demo-service.ts`'s own module doc comment says so up front.

Real:

- **UTXO fetch, timelock script, PSBT construction, broadcast** —
  `@sundial-protocol/btc-locker` against `mempool.space/testnet/api`, the same
  library and endpoint the staking flow (`app/api/btc-staking/route.ts`)
  already uses in production. `initiate()` fetches the connected wallet's
  actual confirmed testnet UTXOs, derives a real CLTV timelock script address
  from that same wallet's own public key via `createTimelockScript` (identical
  call to the staking flow's, `DEMO_TIMELOCK_MINUTES` minutes out instead of
  30 days), and builds a real, spendable PSBT sending the quoted amount there.
  Self-custodial by construction — reclaimable by the same wallet once the
  lock expires, and there is nothing to configure: the destination address is
  derived per-request from `sourcePublicKey`
  (`hooks/dashboard/transfer-endpoints.ts`, threaded through
  `TransferInitiateRequest` — ignored by mock and live mode).
- **The wallet signature.** No new UI branch was needed for this:
  `transfer-progress.tsx`'s `signWithWallet()` already calls the real
  connector's `signPSBT()` whenever the response's `mode` is neither `"mock"`
  nor `"live"` — that branch existed but was unreachable before this mode,
  because nothing had ever populated `sourceUnsignedTx` with a real PSBT
  outside live mode's (never-built) beam-receive path.
  `finalizePsbtSafe` + raw-hex extraction is the same code live mode's
  Bitcoin-source signing already exercises.
- **The broadcast.** `submitSignedSource()` posts the signed hex to
  `mempool.space/testnet/api/tx` for real; the txid the UI shows and links to
  an explorer is whatever that endpoint actually returned, not a generated one.

Not real, on purpose — everything from `confirming` onward is
`mock-service.ts`'s own step timer, unmodified. There is no placeholder to
build, no proof to generate, no Scrolls signature, no L2 submission: this mode
does not attempt any of that, the same way live mode refuses rather than fakes
the pieces it cannot do.

**The timelock is not the real mechanism, and the signing panel says so.**
The actual Charms beam-send does not use a CLTV timelock at all — it sends to
a shared *always-succeeds* script address (no repo builds this) so the
beam-receive side can consume it later without a second signature from the
sender. A timelock is the opposite shape: spendable only by the original key,
and only after a delay. It was chosen anyway, deliberately, because it is the
one demo-worthy property this app can build entirely from an already-verified
staking-flow call: a script that visibly cannot be spent yet on screen, with
no separate address to configure or lose track of. `transfer-progress.tsx`
renders an explicit note in the signing panel whenever `mode === "demo"` so a
demo audience is not left thinking this is how beaming actually locks funds.

Threaded through `mock-service.ts` as two additive fields on its existing
record (`realUnsignedTx`, `isDemo`) and two optional parameters on its existing
`initiate`/`submitSignedSource`, rather than a parallel step machine — every
ordinary mock-mode call site is unaffected, since both are `undefined` unless
demo-service passes them.

### Mock mode

No transaction is built or broadcast, no proof is generated, no canister is
called, nothing reaches any ledger. The step machine advances on a timer.

Balances, addresses and wallet connections **are** real in both modes — they
come from the live Reown (Bitcoin), lucid (Cardano) and `/api/testnet/utxos`
(L2) paths.

## Why the rest is mocked

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
| Placeholder + collateral UTxOs | **A real L2 tx builder** — needs Cardano ledger protocol parameters for the network the L2 settles to (preprod, per Sam) | Beam spec §3.1: put the placeholder at an **always-succeeds script address**, not a user pubkey address. A script input needs no vkey witness, so the receive is authorized by the Scrolls signature alone and the user never co-signs. Not built — `BeamReceiveForm` takes an already-created placeholder as input. |
| `nonce` / commitment storage | **Transfer service** — durable store | The derivation is **not** faked: `deriveCommitment` is the real `SHA256(txid_reversed ‖ vout_le32 ‖ nonce_le64)` from `charms-test/scripts/beam_commit.py`. What is mocked is where it lives. |
| The lock transaction (for real value) | **eBTC-style vault app** | The `--app-bins` that burns on BTC and mints the bridged charm on the L2. Conceptually `CharmsDev/ebtc`; present in no local repo. **The single biggest build item.** `my-token` (a generic demo NFT app) is the only app available today — proving through it is real, but never moves real bridged BTC. |
| `confirming (N/6)` | **BTC mainnet watcher** | mempool.space **mainnet**, assembling `!bitcoin {tx, proof, headers}` from a merkleblock proof plus the chained headers. |
| `proving` | ~~charms prover~~ **done** | Real, as of this pass: `lib/transfer/charms-prover.ts` POSTs to the real Prover API and gets back a real transaction. ~2 proofs per beam; who pays is Sam's Succinct account unless `mock: true`. |
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
tested — and now, via `BeamReceiveForm`, a beam-receive can actually be
attempted for real; nobody has yet run it against a currently-valid placeholder
(the one captured demo state tried this session was stale — its L2 prev-tx was
not found, confirming it predates a testnet reset or similar).

Resolved: **the Sundial L2 testnet settles to Cardano preprod** (Sam,
2026-08-18). This is what makes placeholder-tx construction tractable —
preprod's protocol parameters (fetchable via Blockfrost, key already present as
`NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD`) are the correct ones, not a guess. Not yet
acted on: no placeholder builder exists yet, per the table above.

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

## Live-mode gaps that still matter

- **State is in memory.** Both orchestrators keep transfers in a `globalThis`
  Map, which dies with the process and, on serverless, between requests. This is
  the single biggest gap between "works on a long-lived server" and "works
  anywhere", and it applies to live mode too.
- **The queue id is not a transaction hash.** `/submit` returns its own queue
  id; live mode reports it under `sourceTxid` because that is the only handle
  the node gives, and does not link it to an explorer.
- **The node accepts any well-formed hex.** Its `/submit` check is
  `isHexString`, so a garbage-but-hex payload is enqueued and returns a queue
  id. Acceptance there is not validation.
