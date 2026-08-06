// Where BTC can be held.
//
// Users are shown one unified BTC total; the per-source split is an option they
// open, not the default reading. That is the product stance — bridged BTC is
// still BTC — and this module encodes it so components do not each re-decide.
//
// This is a registry rather than a `"L1" | "L2"` union so further bridged forms
// (another Sundial instance, BTC bridged onto a different chain, a wrapped
// representation) are additive. Supporting a new one means: add an entry here,
// and supply a hook that produces a BtcHolding for it. No component changes —
// the total, the breakdown rows and the chips are all driven off this table.

export type BtcSourceKind =
  // BTC on the Bitcoin network itself.
  | "native"
  // BTC represented on another chain, redeemable for native BTC.
  | "bridged";

export interface BtcSource {
  id: BtcSourceId;
  // Where it lives, for breakdown rows: "Bitcoin network", "Sundial L2".
  venue: string;
  // Compact chip label. Kept short — it sits inline next to a number.
  badge: string;
  kind: BtcSourceKind;
  // Longer explanation, surfaced as the chip's tooltip.
  description: string;
  // Display precision for a figure from this source. The Bitcoin network
  // settles in satoshis (8dp); the Sundial L2 ledger is 6dp, so an L2 balance
  // cannot express anything finer than 0.000001 BTC — 100 sats. Rendering an
  // L2 figure at 8dp would imply precision the ledger does not have, which is
  // why this is per-source rather than one global constant.
  decimals: number;
  // Order within the breakdown. Native first, then bridged.
  order: number;
}

// Every layer denominates in BTC. Bridged BTC is redeemable 1:1, so a separate
// ticker per venue would imply an exchange rate that does not exist.
export const BTC_UNIT = "BTC";

const sources = {
  "bitcoin-l1": {
    id: "bitcoin-l1",
    venue: "Bitcoin network",
    badge: "L1",
    kind: "native",
    description: "Native BTC held on the Bitcoin network.",
    decimals: 8,
    order: 0,
  },
  "sundial-l2": {
    id: "sundial-l2",
    venue: "Sundial L2",
    badge: "L2",
    kind: "bridged",
    description:
      "BTC bridged to the Sundial L2, redeemable 1:1 for native BTC.",
    decimals: 6,
    order: 1,
  },
} as const satisfies Record<string, Omit<BtcSource, "id"> & { id: string }>;

export type BtcSourceId = keyof typeof sources;

export const btcSources: Record<BtcSourceId, BtcSource> = sources;

export const listBtcSources = (): BtcSource[] =>
  Object.values(btcSources).sort((a, b) => a.order - b.order);

// A balance from one source. `amount` is whole BTC; null means not yet known —
// wallet not connected, still loading, or the lookup failed. Null is kept
// distinct from zero because they are different facts about a user's holdings.
export interface BtcHolding {
  sourceId: BtcSourceId;
  amount: number | null;
  isLoading?: boolean;
}

export interface BtcTotal {
  // Sum across sources whose amount is known.
  amount: number;
  // False when at least one source is unknown, so the total understates the
  // real holding. Callers must surface this rather than print a bare number —
  // silently summing over a disconnected wallet is how a total starts lying.
  isComplete: boolean;
  // Sources still unknown, for explaining an incomplete total.
  unknown: BtcSource[];
  // True while any contributing source is still resolving.
  isLoading: boolean;
}

// Precision of a summed figure is the finest of its parts: an exact 6dp L2
// amount added to an exact 8dp L1 amount is exact at 8dp.
export const totalDecimals = (): number =>
  Math.max(...listBtcSources().map((s) => s.decimals));

export const sumBtcHoldings = (holdings: readonly BtcHolding[]): BtcTotal => {
  let amount = 0;
  const unknown: BtcSource[] = [];
  let isLoading = false;

  for (const holding of holdings) {
    const source = btcSources[holding.sourceId];
    if (holding.isLoading) isLoading = true;
    if (holding.amount === null) {
      unknown.push(source);
      continue;
    }
    amount += holding.amount;
  }

  return {
    amount,
    isComplete: unknown.length === 0,
    unknown,
    isLoading,
  };
};

// Display precision, separate from ledger precision.
//
// A source's `decimals` is what it can represent; this is what is worth showing
// at a glance. The goal is a roughly constant *width* across magnitudes, since
// these figures sit in a narrow sidebar column. Never exceeds `maxDecimals`, so
// a figure is never shown to precision its source does not have.
//
// At or above 1, decimal places do that directly. Below 1, they do not: fixing
// the decimal count either wastes the width budget on leading zeros or, for a
// balance like 0.00296188 BTC, spends every digit on them. So below 1 the
// leading zeros are counted and a fixed number of significant digits allowed
// after them — 0.00296188 renders "0.002962", the same width as "442.6091".
//
// The clamp to `maxDecimals` is what stops this collapsing a real balance to a
// bare "0": the smallest amount a source can represent has its last significant
// digit at exactly `maxDecimals`, so it always survives.
const SIGNIFICANT_DIGITS = 4;

const displayDecimals = (value: number, maxDecimals: number): number => {
  const magnitude = Math.abs(value);
  if (magnitude === 0) return 0;
  if (magnitude >= 1000) return Math.min(2, maxDecimals);
  if (magnitude >= 1) return Math.min(4, maxDecimals);

  // Zeros between the decimal point and the first significant digit.
  const leadingZeros = Math.ceil(-Math.log10(magnitude)) - 1;
  return Math.min(maxDecimals, leadingZeros + SIGNIFICANT_DIGITS);
};

// Formats whole BTC for display, rounded per the taper above. Summing floats
// can leave artifacts a few places past the last significant digit; rounding
// clears those too. Trailing zeros are dropped, so 1.25 stays "1.25".
export const formatBtc = (value: number, maxDecimals: number): string =>
  value.toLocaleString(undefined, {
    maximumFractionDigits: displayDecimals(value, maxDecimals),
  });

// The unrounded figure at the source's own precision, for tooltips — the
// display value is rounded, so the exact one stays reachable on hover.
export const formatBtcExact = (value: number, decimals: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: decimals });
