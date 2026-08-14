import type { SupportedChain } from "@/lib/multichain";
import type {
  MechanismFee,
  TransferMechanismId,
} from "@/lib/transfer/mechanisms";
import type { TransferRouteKind } from "@/lib/transfer/routes";
import type { TransferStep } from "@/lib/transfer/steps";
import type { ApiErrorResponse } from "../types";

// Transfer API types.
//
// One surface for every way value moves between the places a user holds it:
// an ordinary on-chain send, a send within the Sundial L2, and the cross-layer
// charms beam. Which one a request is comes from resolving its source and
// destination chains (lib/transfer/routes.ts), not from the caller declaring it.
//
// The `beam` route kind is the protocol specced in
// charms-test/docs/beam-to-l2-frontend-spec.md; these three endpoints are its
// §5 table generalized over the other route kinds.
//
// These routes are a thin façade, exactly like app/api/testnet/utxos: the
// browser never talks to the transfer service, the charms prover, the IC, or
// the L2 node directly. Three things in particular must never appear in a
// response body:
//
//   - the beam `nonce`. It is half of
//     `commitment = SHA256(placeholder_utxo ‖ nonce)` and whoever holds it can
//     claim the beam. Server-side only, forever.
//   - any signing key.
//   - `SUNDIAL_L2_NODE_URL` / the transfer service's own address.
//
// The browser's entire share of the state is a `transferId`.

export type TransferErrorCode =
  // Amount missing, non-numeric, at/below zero, or below the route's minimum.
  | "AMOUNT_INVALID"
  // Source or destination address is missing or malformed for its chain.
  | "ADDRESS_INVALID"
  // Source or destination is not a chain this app knows.
  | "CHAIN_INVALID"
  // The pair resolves to no route. `error` carries the reason from routes.ts.
  | "ROUTE_UNSUPPORTED"
  // The requested mechanism is unknown, not yet available, or does not carry
  // this direction. Separate from ROUTE_UNSUPPORTED because the pair routes
  // fine — it is the chosen mechanism that cannot do it.
  | "MECHANISM_UNAVAILABLE"
  // No transfer with that id. Also covers one lost to a restart while the mock
  // orchestrator is serving — see app/dashboard/transfer/README.md.
  | "TRANSFER_UNKNOWN"
  // The transfer is not at a step where this call makes sense (e.g. submitting
  // a signed source transaction twice).
  | "TRANSFER_STATE_INVALID"
  // `signedSourceTx` is missing or not hex.
  | "SIGNED_TX_INVALID"
  // Configured `TRANSFER_API_URL` could not be reached or answered unusably.
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL";

export interface TransferErrorResponse extends ApiErrorResponse {
  code: TransferErrorCode;
}

// What a transfer costs and how long it takes. The beam is 1:1 — bridged BTC is
// redeemable for native BTC at par — and so is every other route here, so there
// is no rate, only costs.
export interface TransferQuote {
  routeKind: TransferRouteKind;
  // The mechanism carrying this transfer, or null when the pair does not route.
  mechanism: TransferMechanismId | null;
  // Whole units leaving the source.
  amount: number;
  // Whole units arriving at the destination.
  receiveAmount: number;
  // Network fee on the source chain, in that chain's smallest unit. Null for
  // routes that carry no network fee.
  networkFee: number | null;
  // Unit label for `networkFee`, e.g. "sats". Null when there is no fee.
  networkFeeUnit: string | null;
  // A fee peculiar to the chosen mechanism, as opposed to the source chain's
  // network fee. Charms carries the Scrolls signing fee here; a mechanism with
  // no fee of its own reports null. Generic rather than a `scrollsFixedCost`
  // field, which would put one mechanism's economics in every quote.
  mechanismFee: MechanismFee | null;
  requiredConfirmations: number;
  etaLabel: string;
}

// POST /api/transfer/initiate
export interface TransferInitiateRequest {
  fromChain: SupportedChain;
  toChain: SupportedChain;
  fromAddress: string;
  toAddress: string;
  amount: number;
  // How the transfer is carried out. Optional: the server picks the default
  // for the resolved route's direction when it is omitted, and rejects one that
  // is unavailable or cannot carry that direction.
  mechanism?: TransferMechanismId;
}

export interface TransferInitiateSuccessResponse {
  transferId: string;
  // Unsigned source transaction for the user's wallet. Base64 PSBT for Bitcoin
  // sources, CBOR hex for Cardano-family ones.
  sourceUnsignedTx: string;
  // Beam only: the L2 UTxO the beam is committed to, as `<txhash>:<ix>`. Shown
  // for transparency; the nonce binding it to the commitment stays server-side.
  placeholderUtxo: string | null;
  quote: TransferQuote;
  // Present only while the mock orchestrator is serving. The real service omits
  // it, and the UI treats absence as "this is real": it will drive the wallet
  // rather than offering a simulated signature.
  mock?: true;
}

export type TransferInitiateResponse =
  | TransferInitiateSuccessResponse
  | TransferErrorResponse;

// POST /api/transfer/submit-signed-source
export interface TransferSubmitSignedSourceRequest {
  transferId: string;
  // Fully signed, finalized source transaction as raw hex. The service
  // broadcasts it — the browser does not, which is what lets the service watch
  // for confirmation from the moment it goes out.
  signedSourceTx: string;
}

export interface TransferSubmitSignedSourceSuccessResponse {
  transferId: string;
  step: TransferStep;
  sourceTxid: string;
}

export type TransferSubmitSignedSourceResponse =
  | TransferSubmitSignedSourceSuccessResponse
  | TransferErrorResponse;

// GET /api/transfer/status/:id
export interface TransferStatusSuccessResponse {
  transferId: string;
  step: TransferStep;
  fromChain: SupportedChain;
  toChain: SupportedChain;
  fromAddress: string;
  toAddress: string;
  // Confirmations seen so far, against the quote's `requiredConfirmations`.
  // Null before the source transaction is broadcast, or on routes that do not
  // wait for confirmations.
  confirmations: number | null;
  sourceTxid: string | null;
  // The unsigned source transaction, re-served while the transfer is still
  // waiting to be signed and null afterwards.
  //
  // The beam spec's §5 status shape does not include this, but without it a
  // refresh during `awaiting_signature` strands the transfer: the transaction
  // was returned once by `initiate` and is gone. The alternative — keeping it
  // in localStorage — would put flow state back in the browser, which the
  // spec's §4 exists to prevent. It is not a secret (it is unsigned, and the
  // user is about to see it anyway), so re-serving it is the cheaper fix.
  sourceUnsignedTx: string | null;
  // Destination-ledger txid, once the transfer has settled.
  destinationTxId: string | null;
  // Why the transfer failed. Only set when `step` is "failed".
  //
  // Named `failureReason` rather than `error` on purpose: `error` is already the
  // key that marks an API *error envelope*, and a success body carrying
  // `error: null` collides with that — any `"error" in payload` discriminant
  // then reads every successful status as a failed request.
  failureReason: string | null;
  quote: TransferQuote;
  mock?: true;
}

export type TransferStatusResponse =
  | TransferStatusSuccessResponse
  | TransferErrorResponse;
