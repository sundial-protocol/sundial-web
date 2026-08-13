import type { ApiErrorResponse } from "../types";

// Bridge (peg-in) API types.
//
// Wire contract for materializing bridged BTC on the Sundial L2 by consuming a
// placeholder UTxO, authorized by a `scrolls_cardano` ICP threshold signature.
// Mirrors §5 of charms-test/docs/beam-to-l2-frontend-spec.md.
//
// These routes are a thin façade, exactly like app/api/testnet/utxos: the
// browser never talks to the Bridging Service, the charms prover, the IC, or
// the L2 node directly. Three things in particular must never appear in a
// response body:
//
//   - the `nonce`. It is half of `commitment = SHA256(placeholder_utxo ‖ nonce)`
//     and whoever holds it can claim the beam. Server-side only, forever.
//   - any signing key.
//   - `SUNDIAL_L2_NODE_URL` / the Bridging Service's own address.
//
// The browser's entire share of the state is a `bridgeRequestId`.

// The peg-in step machine. Ordering, labels and terminality live in
// lib/bridge/steps.ts, which both the routes and the stepper UI read so they
// cannot drift apart.
export type BridgeStep =
  // Bridging Service is creating the placeholder + collateral UTxOs on the L2.
  | "placeholder"
  // Waiting for the user to sign and broadcast the beam-send on the source chain.
  | "awaiting_source_lock"
  // Source tx seen; accumulating confirmations toward the finality-work target.
  | "confirming"
  // Generating the beam-receive spell proof via the charms prover.
  | "proving"
  // Submitting the receive tx to `scrolls_cardano.sign` for threshold signing.
  | "scrolls_sign"
  // Signed tx handed to the L2 node's `POST /submit`.
  | "submitting"
  // Block producer applied it; the charm is spendable. Terminal.
  | "applied"
  // Terminal failure; `error` carries the reason.
  | "failed";

export type BridgeErrorCode =
  // Amount missing, non-numeric, or at/below zero.
  | "AMOUNT_INVALID"
  // `l2DestAddr` is not a bech32 payment address.
  | "ADDRESS_INVALID"
  // Asset is not one this bridge handles.
  | "ASSET_UNSUPPORTED"
  // No request with that id. Also covers a request lost to a restart while the
  // mock orchestrator is serving — see app/dashboard/bridge/README.md.
  | "REQUEST_UNKNOWN"
  // The request is not at a step where this call makes sense (e.g. submitting a
  // signed source tx twice).
  | "REQUEST_STATE_INVALID"
  // `signedSourceTx` is missing or not hex.
  | "SIGNED_TX_INVALID"
  // Configured `BRIDGE_API_URL` could not be reached or answered unusably.
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL";

export interface BridgeErrorResponse extends ApiErrorResponse {
  code: BridgeErrorCode;
}

// The only asset this bridge moves today. A union rather than a bare string so
// adding a second source asset is a compile error everywhere it matters.
export type BridgeAsset = "BTC";

// What the user is quoted before committing. The beam is 1:1 — bridged BTC is
// redeemable for native BTC at par — so there is no rate here, only costs.
export interface BridgeQuote {
  // Whole BTC leaving the source chain.
  amount: number;
  // Whole bridged BTC arriving on the L2. Equal to `amount`; carried explicitly
  // so the UI states the 1:1 rather than implying it.
  receiveAmount: number;
  // Estimated Bitcoin miner fee for the beam-send, in satoshis.
  minerFeeSats: number;
  // `scrolls_cardano.config().fixed_cost`, in L2 base units. Paid to the Scrolls
  // fee address, which the receive tx must carry as an output at index
  // `spell.tx.outs.len()` or signing is refused.
  scrollsFixedCost: number;
  // Confirmations needed before the receive can be proved. ~6 on mainnet.
  requiredConfirmations: number;
}

// POST /api/bridge/initiate
export interface BridgeInitiateRequest {
  asset: BridgeAsset;
  // Whole BTC, as typed. Validated server-side.
  amount: number;
  // Bech32 L2 address that will hold the bridged BTC.
  l2DestAddr: string;
}

export interface BridgeInitiateSuccessResponse {
  bridgeRequestId: string;
  // Unsigned beam-send for the user's wallet. Base64 PSBT for a BTC source.
  sourceUnsignedPsbt: string;
  // The L2 UTxO the beam is committed to, as `<txhash>:<ix>`. Shown for
  // transparency; the `nonce` binding it to the commitment stays server-side.
  placeholderUtxo: string;
  quote: BridgeQuote;
  // Present only while the mock orchestrator is serving. The real Bridging
  // Service omits it, and the UI treats absence as "this is real": it will
  // drive the wallet rather than offering a simulated signature.
  mock?: true;
}

export type BridgeInitiateResponse =
  | BridgeInitiateSuccessResponse
  | BridgeErrorResponse;

// POST /api/bridge/submit-signed-source
export interface BridgeSubmitSignedSourceRequest {
  bridgeRequestId: string;
  // Fully signed, finalized source transaction as raw hex. The service
  // broadcasts it — the browser does not, which is what lets the service watch
  // for finality from the moment it goes out.
  signedSourceTx: string;
}

export interface BridgeSubmitSignedSourceSuccessResponse {
  bridgeRequestId: string;
  // The step the request moved to. Normally "confirming".
  step: BridgeStep;
  // Source-chain txid, once broadcast.
  sourceTxid: string;
}

export type BridgeSubmitSignedSourceResponse =
  | BridgeSubmitSignedSourceSuccessResponse
  | BridgeErrorResponse;

// GET /api/bridge/status/:id
export interface BridgeStatusSuccessResponse {
  bridgeRequestId: string;
  step: BridgeStep;
  // Confirmations seen so far, against `requiredConfirmations`. Null before the
  // source tx is broadcast.
  confirmations: number | null;
  requiredConfirmations: number;
  sourceTxid: string | null;
  // The unsigned beam-send, re-served while the request is still waiting to be
  // signed and null afterwards.
  //
  // Spec §5's status shape does not include this, but without it a refresh
  // during `awaiting_source_lock` strands the request: the PSBT was returned
  // once by `initiate` and is gone. The alternative — keeping it in
  // localStorage — would put flow state back in the browser, which §4 exists to
  // prevent. It is not a secret (it is unsigned, and the user is about to see
  // it anyway), so re-serving it is the cheaper fix.
  sourceUnsignedPsbt: string | null;
  // L2 txid of the applied receive, once the block producer has taken it.
  l2TxId: string | null;
  // Why the bridge failed. Only set when `step` is "failed".
  //
  // Named `failureReason` rather than spec §5's `error` on purpose: `error` is
  // already the key that marks an API *error envelope*, and a success body
  // carrying `error: null` collides with that — any `"error" in payload`
  // discriminant then reads every successful status as a failed request.
  failureReason: string | null;
  quote: BridgeQuote;
  mock?: true;
}

export type BridgeStatusResponse =
  | BridgeStatusSuccessResponse
  | BridgeErrorResponse;

// Confirmations required before the beam-receive can be proved. Spec §3.4: BTC
// finality is an accumulated-work target, roughly six mainnet blocks.
export const REQUIRED_CONFIRMATIONS = 6;

// `scrolls_cardano.config().fixed_cost` as of the spec's writing (§6.1). The
// real service reads this live from the canister rather than trusting a
// constant — the canister can change it.
export const SCROLLS_FIXED_COST = 420_000;
