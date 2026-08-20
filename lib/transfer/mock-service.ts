import { createHash, randomBytes } from "crypto";

import {
  type TransferInitiateRequest,
  type TransferInitiateSuccessResponse,
  type TransferQuote,
  type TransferStatusSuccessResponse,
  type TransferSubmitSignedSourceSuccessResponse,
} from "@/app/api/transfer/types";
import { chainConfigs, isBitcoinChain, type SupportedChain } from "@/lib/multichain";
import {
  defaultMechanismFor,
  resolveMechanismProfile,
  type TransferMechanismId,
} from "./mechanisms";
import { createdAtFromId, mintTransferId } from "./request-id";
import { resolveTransferRoute, type TransferRoute } from "./routes";
import { transferStepInfo, type TransferStep } from "./steps";

// Mock transfer service.
//
// ⚠ NOTHING HERE TOUCHES A CHAIN. No transaction is built or broadcast, no
// proof is generated, no canister is called, nothing reaches any ledger. The
// step machine advances on a timer. See app/dashboard/transfer/README.md for
// which real service replaces which piece.
//
// This module is the entire seam. The route handlers call it only when
// TRANSFER_API_URL is unset; setting that variable makes them proxy a real
// service instead, and nothing in this file runs.
//
// Two things here are deliberately NOT faked, because faking them would hide
// the parts most likely to be got wrong later:
//
//   - the beam commitment derivation, which is the real
//     SHA256(txid_reversed ‖ vout_le32 ‖ nonce_le64) from
//     charms-test/scripts/beam_commit.py.
//   - the secrecy boundary. The nonce is generated here and never leaves this
//     module, exactly as it must not in production.

// Plausible sat/vB × vsize for a Bitcoin transaction. Fixed, because a real
// estimate needs a fee oracle and a built transaction, and inventing a varying
// number would look more real than it is.
const MOCK_BTC_FEE_SATS = 2_400;
const MOCK_ADA_FEE_LOVELACE = 180_000;

interface TransferRecord {
  id: string;
  createdAt: number;
  request: TransferInitiateRequest;
  route: TransferRoute;
  // Beam only. Server-side only, forever: half of the commitment, and whoever
  // holds it can claim the beam.
  nonce: bigint | null;
  commitment: string | null;
  placeholderUtxo: string | null;
  collateralUtxo: string | null;
  // Set when the signed source transaction arrives; the step machine runs from
  // here.
  signedAt: number | null;
  sourceTxid: string | null;
  destinationTxId: string | null;
  // Demo mode only (lib/transfer/demo-service.ts): a real PSBT built from the
  // connected wallet's real testnet UTXOs, in place of mockUnsignedTx's fake
  // one. Stored, not just returned once from initiate(), so a poll mid
  // awaiting_signature re-serves the same real PSBT instead of a fresh fake.
  realUnsignedTx: string | null;
  // True once initiate() received a real unsigned tx. Read back by
  // statusFrom so a later poll still reports mode "demo" — getStatus never
  // sees demo-service, only this store, and mode "mock" from a later poll
  // would send the UI back to the simulated-signature branch mid-flow.
  isDemo: boolean;
}

// Mock-only store.
//
// Parked on globalThis rather than kept as a plain module-level Map for two
// reasons, both of which show up immediately without it: each route handler is
// bundled separately, so a module-level Map gives `initiate` and `status` a
// store each and nothing written by one is ever visible to the other; and dev
// hot-reload re-evaluates the module, silently dropping every in-flight
// transfer.
//
// A real deployment needs something durable regardless — this dies with the
// process, and on serverless it dies between requests. That is why lookups
// degrade to TRANSFER_UNKNOWN rather than pretending.
const globalForTransfer = globalThis as unknown as {
  __sundialTransferStore?: Map<string, TransferRecord>;
};

const store: Map<string, TransferRecord> = (globalForTransfer.__sundialTransferStore ??=
  new Map<string, TransferRecord>());

const randomTxid = (): string => randomBytes(32).toString("hex");

// The real derivation, from charms-test/scripts/beam_commit.py.
//
// The txid is reversed because charms' `UtxoId::to_bytes()` writes the hash in
// internal byte order, while the hex form everyone reads and pastes is the
// display order — the reversal is what reconciles the two. Getting this
// backwards produces a commitment that looks fine and never matches.
const deriveCommitment = (
  placeholderTxid: string,
  vout: number,
  nonce: bigint,
): string => {
  const txidBytes = Buffer.from(placeholderTxid, "hex").reverse();

  const voutBytes = Buffer.alloc(4);
  voutBytes.writeUInt32LE(vout);

  const nonceBytes = Buffer.alloc(8);
  nonceBytes.writeBigUInt64LE(nonce);

  return createHash("sha256")
    .update(Buffer.concat([txidBytes, voutBytes, nonceBytes]))
    .digest("hex");
};

// A syntactically plausible stand-in. Bitcoin sources carry the PSBT magic
// bytes so it reads as a PSBT in the UI; others are opaque hex. Neither is
// signable and neither is ever handed to a wallet: the `mock: true` flag on the
// initiate response tells the UI to offer a simulated signature instead of
// calling the connector.
const mockUnsignedTx = (record: TransferRecord): string => {
  const filler = createHash("sha256")
    .update(`${record.id}:${record.commitment ?? record.request.toAddress}`)
    .digest();

  if (isBitcoinChain(record.request.fromChain)) {
    const magic = Buffer.from([0x70, 0x73, 0x62, 0x74, 0xff, 0x01, 0x00]);
    return Buffer.concat([magic, filler, filler]).toString("base64");
  }
  return Buffer.concat([filler, filler]).toString("hex");
};

const feeFor = (
  chain: SupportedChain,
): { networkFee: number | null; networkFeeUnit: string | null } => {
  if (isBitcoinChain(chain)) {
    return { networkFee: MOCK_BTC_FEE_SATS, networkFeeUnit: "sats" };
  }
  if (chain === "ada" || chain === "ada_testnet") {
    return { networkFee: MOCK_ADA_FEE_LOVELACE, networkFeeUnit: "lovelace" };
  }
  // The L2 settles on its own ledger with no network fee.
  return { networkFee: null, networkFeeUnit: null };
};

// Defaulting rather than failing here keeps the mock forgiving; the route
// handler is where an unavailable or wrong-direction mechanism is rejected.
const mechanismFor = (
  request: TransferInitiateRequest,
  route: TransferRoute,
): TransferMechanismId | null =>
  route.direction
    ? (request.mechanism ?? defaultMechanismFor(route.direction, route.baseChain))
    : null;

const profileFor = (request: TransferInitiateRequest, route: TransferRoute) => {
  const id = mechanismFor(request, route);
  if (!id || !route.direction) return null;
  return resolveMechanismProfile(id, route.direction, request.fromChain);
};

const quoteFor = (
  request: TransferInitiateRequest,
  route: TransferRoute,
): TransferQuote => ({
  routeKind: route.kind,
  mechanism: mechanismFor(request, route),
  amount: request.amount,
  // Every route here is 1:1. Stated rather than implied.
  receiveAmount: request.amount,
  ...feeFor(request.fromChain),
  // Timing, confirmations and any extra fee all come from the mechanism's
  // profile now, not from the route: two mechanisms serving the same movement
  // do not share them.
  mechanismFee: profileFor(request, route)?.fee ?? null,
  requiredConfirmations: profileFor(request, route)?.requiredConfirmations ?? 0,
  etaLabel: profileFor(request, route)?.etaLabel ?? "—",
});

// Derived, never stored: a stored step would need a timer to advance it, and a
// serverless function has nowhere to keep one. Deriving from elapsed time also
// makes a page refresh resume at the right place for free.
//
// Walks the route's own step list, so a route that has no `confirming` or no
// `proving` simply never reports one.
const progressOf = (
  record: TransferRecord,
): { step: TransferStep; confirmations: number | null } => {
  const profile = profileFor(record.request, record.route);
  // A mechanism with no profile has no protocol to run. Unreachable in practice
  // — initiate refuses anything unavailable — but reporting "failed" beats
  // inventing a step sequence.
  if (!profile) return { step: "failed", confirmations: null };
  const { steps, requiredConfirmations } = profile;

  if (record.signedAt === null) {
    return { step: "awaiting_signature", confirmations: null };
  }

  // Routes without a `confirming` step never report a confirmation count at
  // all, rather than reporting zero — they are not waiting on confirmations, so
  // a count would imply a wait that is not happening.
  const hasConfirming = steps.includes("confirming");

  let remaining = Date.now() - record.signedAt;
  let passedConfirming = false;

  // Everything from the signature onward runs on the clock.
  const afterSignature = steps.slice(steps.indexOf("awaiting_signature") + 1);

  for (const step of afterSignature) {
    const info = transferStepInfo(step);
    if (info.isTerminal) break;

    // `confirming` dwells per confirmation, not once.
    const stepDuration =
      step === "confirming"
        ? info.mockDwellMs * Math.max(1, requiredConfirmations)
        : info.mockDwellMs;

    if (remaining < stepDuration) {
      if (step === "confirming") {
        return {
          step,
          confirmations: Math.floor(remaining / info.mockDwellMs),
        };
      }
      // Position relative to `confirming` decides the count: a step before it
      // has seen none, a step after it has seen them all. Reporting the full
      // count while still broadcasting would claim confirmations that have not
      // happened.
      return {
        step,
        confirmations: !hasConfirming
          ? null
          : passedConfirming
            ? requiredConfirmations
            : 0,
      };
    }

    remaining -= stepDuration;
    if (step === "confirming") passedConfirming = true;
  }

  return {
    step: "settled",
    confirmations: hasConfirming ? requiredConfirmations : null,
  };
};

export class TransferUnknownError extends Error {
  // True when the id parses as one we minted, so the miss is a lost record
  // rather than a bad id.
  readonly wasMinted: boolean;

  constructor(wasMinted: boolean) {
    super(
      wasMinted
        ? "This transfer is no longer available. The mock transfer service keeps transfers in memory, so a server restart clears them."
        : "No transfer with that id.",
    );
    this.name = "TransferUnknownError";
    this.wasMinted = wasMinted;
  }
}

export class TransferStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransferStateError";
  }
}

const require_ = (id: string): TransferRecord => {
  const record = store.get(id);
  if (!record) throw new TransferUnknownError(createdAtFromId(id) !== null);
  return record;
};

const statusFrom = (record: TransferRecord): TransferStatusSuccessResponse => {
  const { step, confirmations } = progressOf(record);

  return {
    transferId: record.id,
    step,
    fromChain: record.request.fromChain,
    toChain: record.request.toChain,
    fromAddress: record.request.fromAddress,
    toAddress: record.request.toAddress,
    confirmations,
    sourceTxid: record.sourceTxid,
    // Re-served only while it is still needed, so a refresh mid-signature can
    // pick the flow back up without the browser having stored anything. A demo
    // record re-serves its real PSBT here rather than a fresh fake one — the
    // wallet needs to sign the exact transaction that was quoted.
    sourceUnsignedTx:
      step === "awaiting_signature"
        ? (record.realUnsignedTx ?? mockUnsignedTx(record))
        : null,
    // Withheld until the transfer actually settles, so the UI cannot link to a
    // transaction that does not exist yet.
    destinationTxId: step === "settled" ? record.destinationTxId : null,
    failureReason: null,
    quote: quoteFor(record.request, record.route),
    mode: record.isDemo ? "demo" : "mock",
  };
};

export const initiate = async (
  request: TransferInitiateRequest,
  // Demo-only seam (lib/transfer/demo-service.ts): a real PSBT built from the
  // connected wallet's real testnet UTXOs. Undefined for every ordinary mock
  // caller, which is what keeps this file's own behavior unchanged for them.
  opts?: { realUnsignedTx?: string },
): Promise<TransferInitiateSuccessResponse> => {
  const route = resolveTransferRoute(request.fromChain, request.toChain);
  const createdAt = Date.now();

  const record: TransferRecord = {
    id: mintTransferId(createdAt),
    createdAt,
    request,
    route,
    nonce: null,
    commitment: null,
    placeholderUtxo: null,
    collateralUtxo: null,
    signedAt: null,
    sourceTxid: null,
    destinationTxId: randomTxid(),
    realUnsignedTx: opts?.realUnsignedTx ?? null,
    isDemo: opts?.realUnsignedTx !== undefined,
  };

  // Only the Charms beam commits to a destination UTxO; every other mechanism
  // sends straight to an address and has no placeholder, nonce or commitment.
  // Keyed on the mechanism rather than the route: a different peg-in mechanism
  // would not use a placeholder at all.
  if (mechanismFor(request, route) === "charms") {
    const placeholderTxid = randomTxid();
    const nonce = randomBytes(8).readBigUInt64LE();
    record.nonce = nonce;
    record.commitment = deriveCommitment(placeholderTxid, 0, nonce);
    record.placeholderUtxo = `${placeholderTxid}:0`;
    record.collateralUtxo = `${randomTxid()}:0`;
  }

  store.set(record.id, record);

  return {
    transferId: record.id,
    sourceUnsignedTx: record.realUnsignedTx ?? mockUnsignedTx(record),
    placeholderUtxo: record.placeholderUtxo,
    quote: quoteFor(request, route),
    mode: record.isDemo ? "demo" : "mock",
  };
};

export const submitSignedSource = async (
  transferId: string,
  _signedSourceTx: string,
  // Demo-only seam: the real txid a real broadcast returned, in place of a
  // random one. Undefined for every ordinary mock caller.
  opts?: { realTxid?: string },
): Promise<TransferSubmitSignedSourceSuccessResponse> => {
  const record = require_(transferId);

  if (record.signedAt !== null) {
    throw new TransferStateError(
      "A signed source transaction has already been submitted for this transfer.",
    );
  }

  record.signedAt = Date.now();
  record.sourceTxid = opts?.realTxid ?? randomTxid();

  return {
    transferId: record.id,
    step: progressOf(record).step,
    sourceTxid: record.sourceTxid,
  };
};

export const getStatus = async (
  transferId: string,
): Promise<TransferStatusSuccessResponse> => statusFrom(require_(transferId));

// Re-exported so the route handlers can label a chain in a validation message
// without importing the chain registry themselves.
export const chainName = (chain: SupportedChain): string =>
  chainConfigs[chain].name;
