import { isBitcoinChain, isSundialL2, type SupportedChain } from "@/lib/multichain";
import type { TransferStep } from "./steps";

// How a transfer is actually carried out.
//
// Called a mechanism rather than a bridge because not every option is one: a
// transfer between two wallets on the same network uses no bridge at all, and
// listing that as "a bridge" would misdescribe it. The UI labels the control
// "Route selection"; this is the set it selects from.
//
// A mechanism owns its *protocol*: the step sequence, how many confirmations it
// waits for, how long it takes, whether its authorization is a threshold
// signature, and any fee peculiar to it. Those used to hang off the route,
// which conflated "what movement is this" with "how is it carried out" — a
// seven-step beam is a Charms sequence, not a peg-in sequence, and Pogun's
// peg-in would look nothing like it. Routes now describe movement only.
//
// Support is declared per direction, because a mechanism can be ready one way
// and not the other: Charms carries peg-in today and is planned for peg-out.

export type TransferMechanismId = "direct" | "charms" | "pogun" | "bifrost";

export type TransferDirection =
  // Into the Sundial L2 from a base layer.
  | "peg_in"
  // Out of the Sundial L2 back to a base layer.
  | "peg_out"
  // Between wallets on one network — no crossing, so no bridge.
  | "same_layer";

export type MechanismStatus = "available" | "coming_soon";

// A fee peculiar to a mechanism, as opposed to the source chain's network fee.
export interface MechanismFee {
  amount: number;
  label: string;
  unit: string;
}

// The protocol a mechanism runs for one direction.
export interface MechanismProfile {
  steps: readonly TransferStep[];
  requiredConfirmations: number;
  etaLabel: string;
  // True when authorization is a threshold signature rather than the
  // destination ledger verifying the transfer itself. A property of the
  // mechanism, not of the movement: a non-Charms peg-in would not inherit it.
  isThresholdAuthorized: boolean;
  fee?: MechanismFee;
}

export interface MechanismDirectionSupport {
  status: MechanismStatus;
  // Base-layer chains this mechanism bridges to or from the Sundial L2. Null
  // means "not chain-specific" — used by `direct`, which works on whatever
  // network both sides are already on.
  //
  // Without this, Charms would be offered for an Ethereum peg-in the moment
  // that pair resolves, because nothing else says it is Bitcoin-only.
  chains: readonly SupportedChain[] | null;
  // Null for `direct`, whose settlement is whatever the source chain does
  // natively — see `nativeSettlement`.
  profile: MechanismProfile | null;
}

export interface TransferMechanism {
  id: TransferMechanismId;
  name: string;
  // One line on the mechanism. Omitted where there is nothing sourced to say —
  // better blank than invented.
  description?: string;
  // Directions this mechanism addresses. A missing key means it does not carry
  // that direction at all, which differs from "not yet".
  support: Partial<Record<TransferDirection, MechanismDirectionSupport>>;
}

// Shown wherever a not-yet-ready mechanism is named. A single constant rather
// than a per-entry reason: they are all pending for the same reason, and a
// free-text field per entry invites each one to word it slightly differently.
export const MECHANISM_COMING_SOON = "Coming soon";

// `scrolls_cardano.config().fixed_cost` as of the beam spec's writing (§6.1).
// The real service reads this live from the canister rather than trusting a
// constant — the canister can change it. Lives with the Charms profile because
// it is a Charms fee, not a peg-in fee.
export const SCROLLS_FIXED_COST = 420_000;

const CHARMS_BEAM_PROFILE: MechanismProfile = {
  steps: [
    "placeholder",
    "awaiting_signature",
    "confirming",
    "proving",
    "scrolls_sign",
    "submitting",
    "settled",
  ],
  // Bitcoin finality is an accumulated-work target, roughly six mainnet blocks.
  requiredConfirmations: 6,
  etaLabel: "~1 hour",
  isThresholdAuthorized: true,
  fee: {
    amount: SCROLLS_FIXED_COST,
    label: "Scrolls signing fee",
    unit: "L2 base units",
  },
};

// Bitcoin chains a Bitcoin-anchored bridge can work with. Named rather than
// inlined so adding a chain to a bridge is one edit in one place.
const BITCOIN_CHAINS: readonly SupportedChain[] = ["btc", "btc_testnet"];

const MECHANISMS: readonly TransferMechanism[] = [
  {
    id: "direct",
    name: "Direct transfer",
    description:
      "An ordinary transaction on the network itself. No bridge is involved.",
    support: {
      same_layer: { status: "available", chains: null, profile: null },
    },
  },
  {
    id: "charms",
    name: "Charms Beaming",
    description:
      "Beams a charm onto the Sundial L2, authorized by a Scrolls ICP threshold signature.",
    support: {
      peg_in: {
        status: "available",
        chains: BITCOIN_CHAINS,
        profile: CHARMS_BEAM_PROFILE,
      },
      // Planned but unbuilt: the beam spec covers the deposit leg and states
      // the withdraw leg is out of scope. No profile, because the protocol does
      // not exist to describe — reversing the peg-in steps would be an invented
      // claim about something nobody has designed.
      peg_out: {
        status: "coming_soon",
        chains: BITCOIN_CHAINS,
        profile: null,
      },
    },
  },
  {
    id: "pogun",
    name: "Pogun",
    // Recorded as a BitVM-based Bitcoin bridge on a Q4 2026 roadmap. That came
    // from search-indexed coverage rather than a primary source, so it is kept
    // to the one claim that was actually corroborated.
    description: "BitVM-based Bitcoin bridge.",
    // Listed both ways because nothing known excludes either, not because
    // two-way support is confirmed. Bitcoin-scoped on the same basis — it is
    // described as a Bitcoin bridge.
    support: {
      peg_in: { status: "coming_soon", chains: BITCOIN_CHAINS, profile: null },
      peg_out: { status: "coming_soon", chains: BITCOIN_CHAINS, profile: null },
    },
  },
  {
    id: "bifrost",
    name: "Bifrost",
    // Deliberately no description: nothing in this repo, the charms-test docs
    // or the Sundial notes says what this is, and a plausible-sounding guess
    // about a bridge's mechanism is worse than an admitted blank. `chains: null`
    // for the same reason — asserting a chain scope would be a guess too.
    support: {
      peg_in: { status: "coming_soon", chains: null, profile: null },
      peg_out: { status: "coming_soon", chains: null, profile: null },
    },
  },
] as const;

export const transferMechanisms = MECHANISMS;

const byId = new Map(MECHANISMS.map((mechanism) => [mechanism.id, mechanism]));

export const transferMechanism = (
  id: TransferMechanismId,
): TransferMechanism | undefined => byId.get(id);

export const isKnownMechanismId = (
  value: unknown,
): value is TransferMechanismId =>
  typeof value === "string" && byId.has(value as TransferMechanismId);

// Undefined when the mechanism does not address this direction at all.
export const mechanismSupport = (
  id: TransferMechanismId,
  direction: TransferDirection,
): MechanismDirectionSupport | undefined => byId.get(id)?.support[direction];

export const mechanismSupportsDirection = (
  id: TransferMechanismId,
  direction: TransferDirection,
): boolean => mechanismSupport(id, direction) !== undefined;

// Whether a mechanism can carry this direction on this base-layer chain.
// `baseChain` is null for same-layer transfers, where chain scope does not
// apply.
export const mechanismCovers = (
  id: TransferMechanismId,
  direction: TransferDirection,
  baseChain: SupportedChain | null,
): boolean => {
  const support = mechanismSupport(id, direction);
  if (!support) return false;
  if (support.chains === null || baseChain === null) return true;
  return support.chains.includes(baseChain);
};

export const isMechanismAvailableFor = (
  id: TransferMechanismId,
  direction: TransferDirection,
  baseChain: SupportedChain | null,
): boolean =>
  mechanismCovers(id, direction, baseChain) &&
  mechanismSupport(id, direction)?.status === "available";

export const mechanismStatusFor = (
  id: TransferMechanismId,
  direction: TransferDirection,
): MechanismStatus | undefined => mechanismSupport(id, direction)?.status;

// Options for a direction on a given base chain, in registry order.
export const mechanismsFor = (
  direction: TransferDirection,
  baseChain: SupportedChain | null,
): TransferMechanism[] =>
  MECHANISMS.filter((mechanism) =>
    mechanismCovers(mechanism.id, direction, baseChain),
  );

// The option to preselect: the first available one, falling back to the first
// listed so a direction with nothing ready still shows a coherent selection
// rather than an empty control.
export const defaultMechanismFor = (
  direction: TransferDirection,
  baseChain: SupportedChain | null,
): TransferMechanismId | null => {
  const options = mechanismsFor(direction, baseChain);
  return (
    options.find((m) => isMechanismAvailableFor(m.id, direction, baseChain))
      ?.id ??
    options[0]?.id ??
    null
  );
};

// How a chain settles its own transactions.
//
// This is what `direct` runs, and it belongs to the chain rather than to the
// mechanism: an L2 send and a Bitcoin send differ because the ledgers differ,
// not because a different mechanism was chosen.
export const nativeSettlement = (chain: SupportedChain): MechanismProfile =>
  isSundialL2(chain)
    ? {
        steps: ["awaiting_signature", "submitting", "settled"],
        requiredConfirmations: 0,
        etaLabel: "seconds",
        isThresholdAuthorized: false,
      }
    : {
        steps: ["awaiting_signature", "broadcasting", "confirming", "settled"],
        requiredConfirmations: 1,
        etaLabel: isBitcoinChain(chain) ? "~10 minutes" : "~1 minute",
        isThresholdAuthorized: false,
      };

// The protocol a given transfer will actually run: the mechanism's own profile,
// or the source chain's native settlement when the mechanism is `direct`.
//
// Null when the mechanism has no profile for this direction — a planned one
// nobody has built. Callers must treat that as "cannot describe or run this
// yet" rather than substituting a default.
export const resolveMechanismProfile = (
  id: TransferMechanismId,
  direction: TransferDirection,
  fromChain: SupportedChain,
): MechanismProfile | null =>
  id === "direct"
    ? nativeSettlement(fromChain)
    : (mechanismSupport(id, direction)?.profile ?? null);
