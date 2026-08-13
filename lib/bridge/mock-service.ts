import { createHash, randomBytes } from "crypto";

import {
  REQUIRED_CONFIRMATIONS,
  SCROLLS_FIXED_COST,
  type BridgeInitiateRequest,
  type BridgeInitiateSuccessResponse,
  type BridgeQuote,
  type BridgeStatusSuccessResponse,
  type BridgeStep,
  type BridgeSubmitSignedSourceSuccessResponse,
} from "@/app/api/bridge/types";

// Mock Bridging Service.
//
// ⚠ NOTHING HERE TOUCHES A CHAIN. No L2 UTxO is created, no Bitcoin transaction
// is built or broadcast, no proof is generated, no canister is called. The step
// machine advances on a timer. See app/dashboard/bridge/README.md for which
// real service replaces which piece.
//
// It exists because the Bridging Service does not exist anywhere yet, and four
// separate things block a real beam today (the L2 block producer is down, the
// eBTC-style vault app is unwritten, testnet4 BTC cannot reach the finality-work
// target, and the orchestrator itself is unbuilt). Building the UI and the wire
// contract against a mock is the same staging the Solstice work in
// prompts/solstice/ already uses.
//
// This module is the entire seam. The route handlers call it only when
// BRIDGE_API_URL is unset; setting that variable makes them proxy a real
// service instead, and nothing in this file runs.
//
// Two things here are deliberately NOT faked, because faking them would hide
// the parts most likely to be got wrong later:
//
//   - the commitment derivation, which is the real
//     SHA256(txid_reversed ‖ vout_le32 ‖ nonce_le64) from scripts/beam_commit.py.
//   - the secrecy boundary. The nonce is generated here and never leaves this
//     module, exactly as it must not in production.

// How long the mock dwells in each non-terminal step once the source tx is
// "broadcast". Compressed hard: the real flow is dominated by ~6 mainnet blocks,
// which is about an hour.
const CONFIRMATION_INTERVAL_MS = 4_000;
const PROVING_MS = 8_000;
const SCROLLS_SIGN_MS = 4_000;
const SUBMITTING_MS = 4_000;

// Plausible sat/vB × vsize for a beam-send. Fixed, because a real estimate
// needs a fee oracle and a built transaction, and inventing a varying number
// would look more real than it is.
const MOCK_MINER_FEE_SATS = 2_400;

interface BridgeRecord {
  id: string;
  createdAt: number;
  amount: number;
  l2DestAddr: string;
  // Server-side only, forever. Half of the commitment; whoever holds it can
  // claim the beam.
  nonce: bigint;
  commitment: string;
  placeholderUtxo: string;
  collateralUtxo: string;
  // Set when the signed source tx arrives; the step machine runs from here.
  signedAt: number | null;
  sourceTxid: string | null;
  l2TxId: string | null;
}

// Mock-only store.
//
// Parked on globalThis rather than kept as a plain module-level Map for two
// reasons, both of which show up immediately without it: each route handler is
// bundled separately, so a module-level Map gives `initiate` and `status` a
// store each and nothing written by one is ever visible to the other; and dev
// hot-reload re-evaluates the module, silently dropping every in-flight request.
//
// A real deployment needs something durable regardless — this dies with the
// process, and on serverless it dies between requests. That is why lookups
// degrade to REQUEST_UNKNOWN rather than pretending.
const globalForBridge = globalThis as unknown as {
  __sundialBridgeStore?: Map<string, BridgeRecord>;
};

const store: Map<string, BridgeRecord> = (globalForBridge.__sundialBridgeStore ??=
  new Map<string, BridgeRecord>());

const randomTxid = (): string => randomBytes(32).toString("hex");

// `brg_<createdAt base36>_<random>`. The timestamp is encoded so a lookup miss
// can tell "never existed" from "existed, and this process no longer has it" —
// the second is a restart, and the UI says so instead of blaming the user.
const mintRequestId = (createdAt: number): string =>
  `brg_${createdAt.toString(36)}_${randomBytes(9).toString("hex")}`;

// Epoch ms for 2020-01-01. Anything decoding to earlier than this is arbitrary
// base36 that happens to parse, not an id we minted — without the floor, a
// string like "brg_zzzzz_x" decodes to 1971 and gets told its request expired.
const PLAUSIBLE_EPOCH_FLOOR_MS = 1_577_836_800_000;

const createdAtFromId = (id: string): number | null => {
  const [prefix, part] = id.split("_");
  if (prefix !== "brg" || !part) return null;
  const parsed = Number.parseInt(part, 36);
  if (!Number.isFinite(parsed)) return null;
  // Allow a little slack ahead of now for clock skew between processes.
  const ceiling = Date.now() + 60_000;
  return parsed >= PLAUSIBLE_EPOCH_FLOOR_MS && parsed <= ceiling ? parsed : null;
};

// The real derivation, from scripts/beam_commit.py.
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

// A syntactically plausible stand-in carrying the PSBT magic bytes, so it reads
// as a PSBT in the UI. It is not signable and is never handed to a wallet: the
// `mock: true` flag on the initiate response tells the UI to offer a simulated
// signature instead of calling the connector.
const mockPsbt = (record: BridgeRecord): string => {
  const magic = Buffer.from([0x70, 0x73, 0x62, 0x74, 0xff, 0x01, 0x00]);
  const filler = createHash("sha256")
    .update(`${record.id}:${record.commitment}`)
    .digest();
  return Buffer.concat([magic, filler, filler]).toString("base64");
};

const quoteFor = (amount: number): BridgeQuote => ({
  amount,
  // The beam is 1:1. Stated rather than implied.
  receiveAmount: amount,
  minerFeeSats: MOCK_MINER_FEE_SATS,
  scrollsFixedCost: SCROLLS_FIXED_COST,
  requiredConfirmations: REQUIRED_CONFIRMATIONS,
});

// Derived, never stored: a stored step would need a timer to advance it, and a
// serverless function has nowhere to keep one. Deriving from elapsed time also
// makes a page refresh resume at the right place for free.
const progressOf = (
  record: BridgeRecord,
): { step: BridgeStep; confirmations: number | null } => {
  if (record.signedAt === null) {
    return { step: "awaiting_source_lock", confirmations: null };
  }

  const elapsed = Date.now() - record.signedAt;

  const confirmingMs = CONFIRMATION_INTERVAL_MS * REQUIRED_CONFIRMATIONS;
  if (elapsed < confirmingMs) {
    return {
      step: "confirming",
      confirmations: Math.floor(elapsed / CONFIRMATION_INTERVAL_MS),
    };
  }

  const afterConfirming = elapsed - confirmingMs;
  if (afterConfirming < PROVING_MS) {
    return { step: "proving", confirmations: REQUIRED_CONFIRMATIONS };
  }
  if (afterConfirming < PROVING_MS + SCROLLS_SIGN_MS) {
    return { step: "scrolls_sign", confirmations: REQUIRED_CONFIRMATIONS };
  }
  if (afterConfirming < PROVING_MS + SCROLLS_SIGN_MS + SUBMITTING_MS) {
    return { step: "submitting", confirmations: REQUIRED_CONFIRMATIONS };
  }

  return { step: "applied", confirmations: REQUIRED_CONFIRMATIONS };
};

export class BridgeRequestUnknownError extends Error {
  // True when the id parses as one we minted, so the miss is a lost record
  // rather than a bad id.
  readonly wasMinted: boolean;

  constructor(wasMinted: boolean) {
    super(
      wasMinted
        ? "This bridge request is no longer available. The mock bridging service keeps requests in memory, so a server restart clears them."
        : "No bridge request with that id.",
    );
    this.name = "BridgeRequestUnknownError";
    this.wasMinted = wasMinted;
  }
}

export class BridgeRequestStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BridgeRequestStateError";
  }
}

const require_ = (id: string): BridgeRecord => {
  const record = store.get(id);
  if (!record) throw new BridgeRequestUnknownError(createdAtFromId(id) !== null);
  return record;
};

// Step 1–2 of the protocol: create the placeholder + collateral, pick a nonce,
// derive the commitment, and build the beam-send for the user to sign.
export const initiate = async (
  request: BridgeInitiateRequest,
): Promise<BridgeInitiateSuccessResponse> => {
  const createdAt = Date.now();
  const placeholderTxid = randomTxid();
  const nonce = randomBytes(8).readBigUInt64LE();

  const record: BridgeRecord = {
    id: mintRequestId(createdAt),
    createdAt,
    amount: request.amount,
    l2DestAddr: request.l2DestAddr,
    nonce,
    commitment: deriveCommitment(placeholderTxid, 0, nonce),
    placeholderUtxo: `${placeholderTxid}:0`,
    collateralUtxo: `${randomTxid()}:0`,
    signedAt: null,
    sourceTxid: null,
    l2TxId: null,
  };

  store.set(record.id, record);

  return {
    bridgeRequestId: record.id,
    sourceUnsignedPsbt: mockPsbt(record),
    placeholderUtxo: record.placeholderUtxo,
    quote: quoteFor(record.amount),
    mock: true,
  };
};

// Step 3: the signed beam-send comes back and the service broadcasts it. From
// here the flow is server-driven and the browser only polls.
export const submitSignedSource = async (
  bridgeRequestId: string,
  _signedSourceTx: string,
): Promise<BridgeSubmitSignedSourceSuccessResponse> => {
  const record = require_(bridgeRequestId);

  if (record.signedAt !== null) {
    throw new BridgeRequestStateError(
      "A signed source transaction has already been submitted for this request.",
    );
  }

  record.signedAt = Date.now();
  record.sourceTxid = randomTxid();
  record.l2TxId = randomTxid();

  return {
    bridgeRequestId: record.id,
    step: "confirming",
    sourceTxid: record.sourceTxid,
  };
};

export const getStatus = async (
  bridgeRequestId: string,
): Promise<BridgeStatusSuccessResponse> => {
  const record = require_(bridgeRequestId);
  const { step, confirmations } = progressOf(record);

  return {
    bridgeRequestId: record.id,
    step,
    confirmations,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    sourceTxid: record.sourceTxid,
    // Re-served only while it is still needed, so a refresh mid-signature can
    // pick the flow back up without the browser having stored anything.
    sourceUnsignedPsbt:
      step === "awaiting_source_lock" ? mockPsbt(record) : null,
    // Withheld until the receive is actually applied, so the UI cannot link to
    // a transaction that does not exist yet.
    l2TxId: step === "applied" ? record.l2TxId : null,
    failureReason: null,
    quote: quoteFor(record.amount),
    mock: true,
  };
};
