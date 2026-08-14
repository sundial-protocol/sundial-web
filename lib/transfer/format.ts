import { formatBtc } from "@/lib/btc-sources";

// Amount formatting for the transfer UI.
//
// The taper inside `formatBtc` — fewer decimals as magnitude grows, more
// significant digits below 1, clamped to the source's own precision — is
// generic numeric formatting. Nothing about it is Bitcoin-specific beyond its
// name, so ADA and L2 amounts reuse it rather than growing a second rounding
// rule that can quietly disagree with the first.
export const formatUnits = formatBtc;

// Shortens an address for display while keeping both ends, which is what people
// actually check against a wallet. Never truncates something already short
// enough to read whole.
export const shortenAddress = (address: string, edge = 8): string =>
  address.length <= edge * 2 + 3
    ? address
    : `${address.slice(0, edge)}…${address.slice(-edge)}`;
