import {
  chainConfigs,
  isBitcoinChain,
  isSundialL2,
  type SupportedChain,
} from "@/lib/multichain";
import type { TransferDirection } from "./mechanisms";

// What movement a pair of chains represents.
//
// Movement only. How it is carried out — steps, confirmations, timing, trust
// model, mechanism-specific fees — belongs to the mechanism
// (lib/transfer/mechanisms.ts), because those differ between two mechanisms
// serving the same movement. Keeping them here made `beam` mean both "a peg-in"
// and "the Charms protocol", which holds only while there is exactly one
// mechanism per direction.
//
// Every pair resolves to something; "unsupported" is a first-class answer with
// a reason attached, not a gap.
//
// Shared by the client (to describe the transfer as the user picks) and the
// server (to re-resolve it at initiate, since the client's answer is not
// trusted).

export type TransferRouteKind =
  // Into the Sundial L2 from a base layer.
  | "peg_in"
  // Out of the Sundial L2 back to a base layer.
  | "peg_out"
  // Between wallets on one network.
  | "same_layer"
  // No route exists. `unavailableReason` says why.
  | "unsupported";

export interface TransferRoute {
  kind: TransferRouteKind;
  // Short badge text, e.g. "Peg-in".
  label: string;
  // One line on what the movement does.
  description: string;
  // Which way value is travelling, or null when the pair does not route.
  direction: TransferDirection | null;
  // The base-layer side of a cross-layer movement, which is what decides
  // whether a given mechanism can carry it. Null for same-layer transfers and
  // for pairs that do not route.
  baseChain: SupportedChain | null;
  // Set only when kind is "unsupported".
  unavailableReason?: string;
}

const unsupported = (reason: string): TransferRoute => ({
  kind: "unsupported",
  label: "No route",
  description: "This pair cannot be transferred between.",
  direction: null,
  baseChain: null,
  unavailableReason: reason,
});

// Bitcoin mainnet and testnet are separate networks; so are Cardano mainnet and
// preprod. Mixing them is a common and expensive mistake, so it gets its own
// message rather than a generic "no route".
const isTestnetChain = (chain: SupportedChain): boolean =>
  chain === "btc_testnet" || chain === "ada_testnet" || chain === "sundial_l2";

export const resolveTransferRoute = (
  from: SupportedChain,
  to: SupportedChain,
): TransferRoute => {
  const fromName = chainConfigs[from].name;
  const toName = chainConfigs[to].name;

  if (from === to) {
    return {
      kind: "same_layer",
      label: "Same-network transfer",
      description: isSundialL2(from)
        ? `Move bridged BTC between accounts on the ${fromName} ledger.`
        : `An ordinary ${fromName} transaction.`,
      direction: "same_layer",
      baseChain: null,
    };
  }

  // Peg-in: a base layer → the L2.
  if (isBitcoinChain(from) && isSundialL2(to)) {
    return {
      kind: "peg_in",
      label: "Peg-in",
      description: `Lock ${fromName} and materialize bridged BTC on the ${toName}.`,
      direction: "peg_in",
      baseChain: from,
    };
  }

  // Peg-out: the L2 → a base layer. A real direction; whether anything carries
  // it is the mechanism's business, not this function's.
  if (isSundialL2(from) && isBitcoinChain(to)) {
    return {
      kind: "peg_out",
      label: "Peg-out",
      description: `Redeem bridged BTC on the ${fromName} back to native ${toName}.`,
      direction: "peg_out",
      baseChain: to,
    };
  }

  // Cardano is a settlement layer here, not a transfer counterparty for BTC.
  if (
    (from === "ada" || from === "ada_testnet") !==
    (to === "ada" || to === "ada_testnet")
  ) {
    return unsupported(
      `There is no route between ${fromName} and ${toName}. They hold different assets.`,
    );
  }

  if (isTestnetChain(from) !== isTestnetChain(to)) {
    return unsupported(
      `${fromName} and ${toName} are different networks. Value cannot move between a test network and a live one.`,
    );
  }

  return unsupported(`There is no route between ${fromName} and ${toName}.`);
};

export const isRoutable = (route: TransferRoute): boolean =>
  route.kind !== "unsupported";
