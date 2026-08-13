import type { BridgeStep } from "@/app/api/bridge/types";

// The peg-in step machine, in one place.
//
// Both the route handlers and the stepper UI read this. That is the point: a
// stepper that renders its own copy of the step order drifts silently the first
// time the protocol gains a step, and the failure mode is a progress bar that
// lies about where a user's money is.
//
// Order here is the protocol order from beam-to-l2-frontend-spec.md §3, which
// is also the order §4 asks the stepper to display.

export interface BridgeStepInfo {
  id: BridgeStep;
  // Present-tense label for the step while it is the active one.
  label: string;
  // One line explaining what is happening, for the active step only.
  detail: string;
  // Terminal steps end the flow and stop polling.
  isTerminal: boolean;
  // Excluded from the rendered progress track. "failed" can be reached from any
  // step, so it has no fixed position to draw.
  isOffTrack?: boolean;
}

const STEP_LIST: readonly BridgeStepInfo[] = [
  {
    id: "placeholder",
    label: "Creating placeholder",
    detail:
      "Building the destination UTxO and its collateral on the Sundial L2.",
    isTerminal: false,
  },
  {
    id: "awaiting_source_lock",
    label: "Awaiting your signature",
    detail:
      "Sign the beam-send in your wallet. It locks the BTC and commits to your placeholder.",
    isTerminal: false,
  },
  {
    id: "confirming",
    label: "Confirming on Bitcoin",
    detail:
      "Accumulating proof-of-work until the lock is final enough to prove against.",
    isTerminal: false,
  },
  {
    id: "proving",
    label: "Proving the receive",
    detail: "Generating the beam-receive spell proof.",
    isTerminal: false,
  },
  {
    id: "scrolls_sign",
    label: "Threshold signing",
    detail:
      "Scrolls re-verifies the proof from the transaction alone and threshold-signs it.",
    isTerminal: false,
  },
  {
    id: "submitting",
    label: "Submitting to the L2",
    detail: "Handing the signed transaction to the Sundial L2 node.",
    isTerminal: false,
  },
  {
    id: "applied",
    label: "Bridged",
    detail: "The block producer applied it. Your bridged BTC is spendable.",
    isTerminal: true,
  },
  {
    id: "failed",
    label: "Failed",
    detail: "The bridge could not be completed.",
    isTerminal: true,
    isOffTrack: true,
  },
] as const;

export const bridgeSteps = STEP_LIST;

// Steps drawn in the progress track, in order.
export const trackedBridgeSteps: readonly BridgeStepInfo[] = STEP_LIST.filter(
  (step) => !step.isOffTrack,
);

const byId = new Map(STEP_LIST.map((step) => [step.id, step]));

export const bridgeStepInfo = (step: BridgeStep): BridgeStepInfo => {
  const info = byId.get(step);
  // Unreachable while `BridgeStep` and STEP_LIST agree; throwing rather than
  // returning a placeholder means adding a step without a label fails loudly in
  // dev instead of rendering an unnamed blank in the track.
  if (!info) throw new Error(`Unknown bridge step: ${step}`);
  return info;
};

export const isTerminalBridgeStep = (step: BridgeStep): boolean =>
  bridgeStepInfo(step).isTerminal;

// Position within the drawn track. Off-track steps ("failed") return -1, so
// callers must handle them separately rather than getting a plausible index.
export const bridgeStepIndex = (step: BridgeStep): number =>
  trackedBridgeSteps.findIndex((s) => s.id === step);
