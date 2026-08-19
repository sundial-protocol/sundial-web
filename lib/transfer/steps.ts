// Step machines for transfers.
//
// Different routes are different protocols and genuinely have different steps:
// a charms beam waits on Bitcoin finality and two proofs, an ordinary on-chain
// send waits on a broadcast, an L2 send waits on a block producer. One flat
// step list would either invent steps that never happen for a route or omit
// ones that do, and a progress track that lies about where a user's money is
// is worse than no progress track.
//
// So steps live here as a vocabulary, and lib/transfer/routes.ts composes the
// ordered subset each route actually goes through. Both the route handlers and
// the progress UI read this, so they cannot drift.

export type TransferStep =
  // Building the destination placeholder + collateral UTxOs on the L2. Beam only.
  | "placeholder"
  // Waiting for the user to sign in their wallet.
  | "awaiting_signature"
  // Signed transaction going out to the network.
  | "broadcasting"
  // Accumulating confirmations.
  | "confirming"
  // Generating the beam-receive spell proof. Beam only.
  | "proving"
  // Threshold-signing via scrolls_cardano. Beam only.
  | "scrolls_sign"
  // Handing the signed transaction to the destination ledger.
  | "submitting"
  // Terminal success: spendable at the destination.
  | "settled"
  // Terminal failure; `failureReason` carries the detail.
  | "failed";

export interface TransferStepInfo {
  id: TransferStep;
  // Present-tense label shown in the track.
  label: string;
  // One line explaining what is happening, shown for the active step only.
  detail: string;
  isTerminal: boolean;
  // True when the step advances only because the *user* acts, not because the
  // service makes progress. Polling one of these is pointless: no amount of
  // asking changes an answer that is waiting on a human.
  isUserBlocked: boolean;
  // How long the mock orchestrator dwells here. Ignored once a real service
  // answers, which reports its own step.
  mockDwellMs: number;
}

const STEPS: Record<TransferStep, TransferStepInfo> = {
  placeholder: {
    id: "placeholder",
    label: "Preparing destination",
    detail:
      "Building the destination UTxO and its collateral on the Sundial L2.",
    isTerminal: false,
    isUserBlocked: false,
    mockDwellMs: 0,
  },
  awaiting_signature: {
    id: "awaiting_signature",
    label: "Awaiting your signature",
    detail: "Sign in your wallet to authorize the transfer.",
    isTerminal: false,
    isUserBlocked: true,
    // Driven by the user, not the clock.
    mockDwellMs: 0,
  },
  broadcasting: {
    id: "broadcasting",
    label: "Broadcasting",
    detail: "Sending the signed transaction to the network.",
    isTerminal: false,
    isUserBlocked: false,
    mockDwellMs: 3_000,
  },
  confirming: {
    id: "confirming",
    label: "Confirming",
    detail: "Waiting for the network to confirm the transaction.",
    isTerminal: false,
    isUserBlocked: false,
    // Per confirmation, not for the whole step — see routes.ts.
    mockDwellMs: 4_000,
  },
  proving: {
    id: "proving",
    label: "Proving the receive",
    detail: "Generating the beam-receive spell proof.",
    isTerminal: false,
    isUserBlocked: false,
    mockDwellMs: 8_000,
  },
  scrolls_sign: {
    id: "scrolls_sign",
    label: "Threshold signing",
    detail:
      "Scrolls re-verifies the proof from the transaction alone and threshold-signs it.",
    isTerminal: false,
    isUserBlocked: false,
    mockDwellMs: 4_000,
  },
  submitting: {
    id: "submitting",
    label: "Submitting",
    detail: "Handing the signed transaction to the destination ledger.",
    isTerminal: false,
    isUserBlocked: false,
    mockDwellMs: 4_000,
  },
  settled: {
    id: "settled",
    label: "Settled",
    detail: "The funds are spendable at the destination.",
    isTerminal: true,
    isUserBlocked: false,
    mockDwellMs: 0,
  },
  failed: {
    id: "failed",
    label: "Failed",
    detail: "The transfer could not be completed.",
    isTerminal: true,
    isUserBlocked: false,
    mockDwellMs: 0,
  },
};

export const transferStepInfo = (step: TransferStep): TransferStepInfo =>
  STEPS[step];

export const isTerminalTransferStep = (step: TransferStep): boolean =>
  STEPS[step].isTerminal;

export const isUserBlockedTransferStep = (step: TransferStep): boolean =>
  STEPS[step].isUserBlocked;

// Whether asking the service again could ever return something different.
// Terminal steps are done; user-blocked steps change only when this client
// acts, and it refreshes itself when it does.
export const isPollableTransferStep = (step: TransferStep): boolean =>
  !STEPS[step].isTerminal && !STEPS[step].isUserBlocked;
