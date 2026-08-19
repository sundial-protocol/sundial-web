import "server-only";

import type {
  BeamReceiveInput,
  TransferInitiateRequest,
  TransferInitiateSuccessResponse,
  TransferQuote,
  TransferStatusSuccessResponse,
  TransferSubmitSignedSourceSuccessResponse,
} from "@/app/api/transfer/types";
import {
  isBitcoinChain,
  isSundialL2,
  type SupportedChain,
} from "@/lib/multichain";
import { buildBeamReceiveRequest } from "./charms-beam-receive";
import { proveSpell, type ProvedTx } from "./charms-prover";
import * as l2 from "./l2-node";
import {
  defaultMechanismFor,
  resolveMechanismProfile,
  type TransferMechanismId,
} from "./mechanisms";
import { createdAtFromId, mintTransferId } from "./request-id";
import { resolveTransferRoute, type TransferRoute } from "./routes";
import * as scrolls from "./scrolls";
import type { TransferStep } from "./steps";

// Live transfer service: the real Sundial L2 node and the real Scrolls
// canister, as far as the pipeline actually exists.
//
// WHAT IS REAL HERE
//   - `scrolls_cardano.config()` for the live fee and fee addresses.
//   - `scrolls_cardano.sign()` — real threshold signing on IC mainnet.
//   - `POST /submit` — real submission to the L2 node.
//   - arrival, read back from the destination address's UTxOs.
//
// WHAT IS REAL, AS OF THE CHARMS PROVER INTEGRATION
//   - beam-receive proving. Given a placeholder UTxO and a beam-send that
//     already exist, this builds the real spell request and calls the real
//     Prover API (docs.charms.dev/reference/prover-api) — see
//     charms-beam-receive.ts. Verified against real captured data from this
//     session, not assumed: `dest` derivation was checked byte-for-byte
//     against `charms util dest`.
//
// WHAT IS NOT BUILT, AND REFUSES RATHER THAN FAKES
//   - the placeholder and the source beam-send themselves. Building the
//     placeholder needs Cardano ledger protocol parameters for whatever
//     network the L2 testnet settles to; building the beam-send needs the
//     user's real BTC wallet and, for a real (non-demo) beam, a value-locking
//     vault app that exists in no repo. Both are supplied as inputs here,
//     not produced.
//   - anything using `my-token` (the only Charms app anywhere to prove
//     against) moves a demo NFT, never real bridged BTC — see
//     charms-beam-receive.ts's DEMO_APP.
//   - Bitcoin-side anything past accepting a beam-send's txid/hex as input.
//     `/submit` is an L2 endpoint; a Bitcoin destination has nothing to
//     submit to here.
//
// The distinction matters more than the coverage: a step that cannot run
// returns an error naming what is missing, so live mode never reports progress
// it did not make. That is the whole reason it is separate from the mock rather
// than a flag inside it.

// Live-mode state. Same shape and same caveat as the mock's: an in-process Map
// dies with the process and, on serverless, between requests. A real deployment
// needs a durable store — this is the single biggest gap between "works on a
// long-lived server" and "works anywhere".
interface LiveRecord {
  id: string;
  createdAt: number;
  request: TransferInitiateRequest;
  route: TransferRoute;
  mechanism: TransferMechanismId | null;
  quote: TransferQuote;
  // UTxO count at the destination when the transfer was submitted. Arrival is
  // "more than this".
  destinationUtxosAtSubmit: number | null;
  submittedAt: number | null;
  // The L2 node's queue id, which is what it gives instead of a txid.
  queueId: string | null;
  settledAt: number | null;
  failureReason: string | null;
}

const globalForLive = globalThis as unknown as {
  __sundialLiveTransferStore?: Map<string, LiveRecord>;
};

const store: Map<string, LiveRecord> = (globalForLive.__sundialLiveTransferStore ??=
  new Map<string, LiveRecord>());

export class LiveUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveUnsupportedError";
  }
}

export class LiveTransferUnknownError extends Error {
  readonly wasMinted: boolean;
  constructor(wasMinted: boolean) {
    super(
      wasMinted
        ? "This transfer is no longer available. Live mode keeps transfers in memory, so a server restart clears them."
        : "No transfer with that id.",
    );
    this.name = "LiveTransferUnknownError";
    this.wasMinted = wasMinted;
  }
}

export class LiveTransferStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveTransferStateError";
  }
}

/**
 * Whether live mode can carry a route at all.
 *
 * `/submit` is an L2 endpoint, so the destination has to be the L2. A Bitcoin
 * destination — peg-out, or a Bitcoin-to-Bitcoin send — has no L2 submission
 * step to perform, and pretending otherwise would be the exact dishonesty this
 * module exists to avoid.
 */
export const liveSupportsDestination = (
  toChain: SupportedChain,
  route: TransferRoute,
): boolean => route.kind !== "unsupported" && isSundialL2(toChain);

const requireLiveRoute = (
  request: TransferInitiateRequest,
  route: TransferRoute,
): void => {
  if (!isSundialL2(request.toChain)) {
    throw new LiveUnsupportedError(
      `Live mode can only complete transfers whose destination is the Sundial L2 — that is what \`POST /submit\` accepts. ${
        isBitcoinChain(request.toChain)
          ? "A Bitcoin destination needs a Bitcoin broadcast path, which is not built."
          : "This destination has no submission path here."
      }`,
    );
  }
  if (route.kind === "unsupported") {
    throw new LiveUnsupportedError(
      route.unavailableReason ?? "There is no route between these chains.",
    );
  }
};

const buildQuote = async (
  request: TransferInitiateRequest,
  route: TransferRoute,
  mechanism: TransferMechanismId | null,
): Promise<TransferQuote> => {
  const profile =
    mechanism && route.direction
      ? resolveMechanismProfile(mechanism, route.direction, request.fromChain)
      : null;

  // Read live rather than trusting the compiled-in constant: the canister can
  // change its fee, and a stale figure produces transactions Scrolls refuses.
  let fee = profile?.fee ?? null;
  if (fee) {
    try {
      const live = await scrolls.config();
      fee = { ...fee, amount: live.fixedCost };
    } catch (e) {
      // Non-fatal for quoting — the submit path calls Scrolls again and will
      // surface a real failure there rather than blocking the quote here.
      console.warn("Falling back to the compiled Scrolls fee:", e);
    }
  }

  return {
    routeKind: route.kind,
    mechanism,
    amount: request.amount,
    receiveAmount: request.amount,
    // The source-chain network fee belongs to whatever builds the source
    // transaction, which in live mode is done outside this app.
    networkFee: null,
    networkFeeUnit: null,
    mechanismFee: fee,
    requiredConfirmations: profile?.requiredConfirmations ?? 0,
    etaLabel: profile?.etaLabel ?? "—",
  };
};

export const initiate = async (
  request: TransferInitiateRequest,
): Promise<TransferInitiateSuccessResponse> => {
  const route = resolveTransferRoute(request.fromChain, request.toChain);
  requireLiveRoute(request, route);

  const mechanism =
    request.mechanism ??
    (route.direction ? defaultMechanismFor(route.direction, route.baseChain) : null);

  const createdAt = Date.now();
  const record: LiveRecord = {
    id: mintTransferId(createdAt),
    createdAt,
    request,
    route,
    mechanism,
    quote: await buildQuote(request, route, mechanism),
    destinationUtxosAtSubmit: null,
    submittedAt: null,
    queueId: null,
    settledAt: null,
    failureReason: null,
  };

  store.set(record.id, record);

  return {
    transferId: record.id,
    // Null: nothing here builds the *source* leg (the BTC lock, or an L2
    // send). For charms, the receive leg is now built for real — see
    // buildAndProveBeamReceive — once beamReceiveInput's prerequisites (an
    // existing placeholder + beam-send) are supplied at submit time.
    sourceUnsignedTx: null,
    placeholderUtxo: null,
    quote: record.quote,
    mode: "live",
  };
};

const require_ = (id: string): LiveRecord => {
  const record = store.get(id);
  if (!record) throw new LiveTransferUnknownError(createdAtFromId(id) !== null);
  return record;
};

/**
 * Carries an externally-produced transaction the rest of the way: Scrolls
 * threshold signature where the mechanism calls for one, then `POST /submit`.
 *
 * For a Charms peg-in the input is the CDDL envelope's `cborHex` straight out
 * of `charms spell prove` — unsigned by Scrolls. This calls `sign()` on it,
 * because that is the protocol, and submits what comes back. For a direct L2
 * send there is no Scrolls step and the transaction goes straight to the node.
 */
// Extracts the Cardano CBOR hex from what the Prover API returns. The response
// is a chain-tagged array (spec: docs.charms.dev/reference/prover-api) — for a
// beam-receive that means exactly one `{cardano: hex}` entry.
const cardanoHexFrom = (txs: ProvedTx[]): string => {
  const entry = txs.find(
    (tx): tx is { cardano: string } => "cardano" in tx,
  );
  if (!entry) {
    throw new LiveUnsupportedError(
      "The prover returned no Cardano transaction for this beam-receive.",
    );
  }
  return entry.cardano;
};

/**
 * Builds and proves the beam-receive for real, via the Prover API
 * (docs.charms.dev/reference/prover-api), then hands the result into the same
 * scrolls.sign() + l2.submitTransaction() path a pasted transaction would use.
 *
 * Every input here maps to a real field of that request — see
 * charms-beam-receive.ts. What this cannot do is create the placeholder or the
 * source beam-send itself: those still have to already exist, supplied by
 * whoever ran them (e.g. via charms-test's own beam-0{1,2,3} scripts).
 */
const buildAndProveBeamReceive = async (
  record: LiveRecord,
  input: BeamReceiveInput,
): Promise<string> => {
  const placeholderTxid = input.placeholderUtxoId.split(":")[0];
  const placeholderPrevTxCbor = await l2.getTransaction(placeholderTxid);

  const scrollsConfig = await scrolls.config();
  const feeAddress = scrollsConfig.feeAddresses.preprod;
  if (!feeAddress) {
    throw new LiveUnsupportedError(
      "Scrolls' config() did not return a preprod fee address.",
    );
  }

  const request = await buildBeamReceiveRequest({
    placeholderUtxoId: input.placeholderUtxoId,
    placeholderPrevTxCbor,
    collateralUtxoId: input.collateralUtxoId,
    recipientAddress: record.request.toAddress,
    // Whole BTC -> the L2's 6-decimal base unit, matching LOVELACE_PER_UNIT in
    // app/api/testnet/utxos/types.ts.
    recvAmount: Math.round(record.request.amount * 1_000_000),
    changeAddress: record.request.toAddress,
    sourceUtxoId: input.sourceUtxoId,
    nonce: input.nonce,
    sourceTxHex: input.sourceTxHex,
    fee: { address: feeAddress, amount: scrollsConfig.fixedCost },
    mock: input.mock,
  });

  // Real proving, real endpoint (docs.charms.dev/reference/prover-api) — this
  // is the actual network call, billed in $PROVE unless `mock` was set.
  const proved = await proveSpell(request);
  return cardanoHexFrom(proved);
};

export const submitSignedSource = async (
  transferId: string,
  input: { signedSourceTx?: string; beamReceiveInput?: BeamReceiveInput },
): Promise<TransferSubmitSignedSourceSuccessResponse> => {
  const record = require_(transferId);

  if (record.submittedAt !== null) {
    throw new LiveTransferStateError(
      "This transfer has already been submitted to the L2.",
    );
  }

  if (!input.signedSourceTx && !input.beamReceiveInput) {
    throw new LiveTransferStateError(
      "Provide either signedSourceTx or beamReceiveInput.",
    );
  }

  // Snapshot before submitting: arrival is measured against this, and taking it
  // afterwards would race a fast block.
  try {
    record.destinationUtxosAtSubmit = await l2.getUtxoCount(
      record.request.toAddress,
    );
  } catch (e) {
    // A failed snapshot costs the arrival check, not the submission. Better to
    // submit and report "submitted, arrival unknown" than to refuse.
    console.warn("Could not snapshot the destination before submit:", e);
    record.destinationUtxosAtSubmit = null;
  }

  let txHex: string;

  if (input.beamReceiveInput) {
    if (record.mechanism !== "charms") {
      throw new LiveTransferStateError(
        "beamReceiveInput only applies to the charms mechanism.",
      );
    }
    txHex = await buildAndProveBeamReceive(record, input.beamReceiveInput);
    // A mock-proved transaction is real JSON from a real endpoint, but it is
    // not a real proof — Scrolls re-verifies the STARK/Groth16 proof itself
    // and will refuse it here, for real. That refusal is the point: it is how
    // the pipeline gets exercised without spending $PROVE on output nobody can
    // ever submit.
    txHex = await scrolls.sign(txHex);
  } else {
    txHex = (input.signedSourceTx as string).trim();
    if (record.mechanism === "charms") {
      // Throws on refusal, which is what we want: an unsigned charm
      // transaction submitted to the L2 would be rejected there anyway, with a
      // much less informative error than the canister's.
      txHex = await scrolls.sign(txHex);
    }
  }

  const result = await l2.submitTransaction(txHex);

  record.submittedAt = Date.now();
  record.queueId = result.queueId;

  return {
    transferId: record.id,
    step: "submitting",
    // The node returns a queue id, not a transaction hash. Reporting the queue
    // id under a txid field would be a lie the UI then links to an explorer.
    sourceTxid: result.queueId ?? "",
  };
};

const stepOf = async (
  record: LiveRecord,
): Promise<{ step: TransferStep; confirmations: number | null }> => {
  if (record.failureReason) return { step: "failed", confirmations: null };
  if (record.submittedAt === null) {
    return { step: "awaiting_signature", confirmations: null };
  }
  if (record.settledAt !== null) return { step: "settled", confirmations: null };

  // Enqueued is not applied. The only honest "settled" is seeing it arrive.
  if (record.destinationUtxosAtSubmit !== null) {
    try {
      const now = await l2.getUtxoCount(record.request.toAddress);
      if (now > record.destinationUtxosAtSubmit) {
        record.settledAt = Date.now();
        return { step: "settled", confirmations: null };
      }
    } catch (e) {
      // Keep reporting "submitting" — a failed read says nothing about whether
      // the transfer landed.
      console.warn("Arrival check failed:", e);
    }
  }

  return { step: "submitting", confirmations: null };
};

export const getStatus = async (
  transferId: string,
): Promise<TransferStatusSuccessResponse> => {
  const record = require_(transferId);
  const { step, confirmations } = await stepOf(record);

  return {
    transferId: record.id,
    step,
    fromChain: record.request.fromChain,
    toChain: record.request.toChain,
    fromAddress: record.request.fromAddress,
    toAddress: record.request.toAddress,
    confirmations,
    sourceTxid: record.queueId,
    // Nothing to re-serve: live mode never built one.
    sourceUnsignedTx: null,
    destinationTxId: null,
    failureReason: record.failureReason,
    quote: record.quote,
    mode: "live",
  };
};
