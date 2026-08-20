"use client";

import { useEffect, useMemo, useState } from "react";

import type { TransferInitiateRequest } from "@/app/api/transfer/types";
import type {
  TransferEndpoint,
  TransferEndpointId,
  TransferEndpointsResult,
} from "@/hooks/dashboard/transfer-endpoints";
import { chainConfigs, type SupportedChain } from "@/lib/multichain";
import {
  defaultMechanismFor,
  isMechanismAvailableFor,
  mechanismsFor,
  resolveMechanismProfile,
  type MechanismProfile,
  type TransferMechanism,
  type TransferMechanismId,
} from "@/lib/transfer/mechanisms";
import { resolveTransferRoute, type TransferRoute } from "@/lib/transfer/routes";

/**
 * The state of a transfer being composed.
 *
 * Lifted out of the form because the route summary is a sibling card, not a
 * child — the same shape `deposit.tsx` uses, where the tab owns the amount and
 * chain so both the staking form and the summary card can read them. Keeping it
 * here rather than prop-drilling a dozen values through the tab keeps the two
 * cards genuinely in sync: they derive from one object, so they cannot disagree
 * about which route is being described.
 */

// Estimates only, matched to the mock service's fixed numbers. Labelled as
// estimates in the UI because a real figure needs a fee oracle and a built
// transaction, and a precise-looking invented number is worse than an admitted
// approximation.
const ESTIMATED_BTC_FEE_SATS = 2_400;
const ESTIMATED_ADA_FEE_LOVELACE = 180_000;

export interface TransferComposer {
  fromId: TransferEndpointId;
  toId: TransferEndpointId;
  setFromId: (id: TransferEndpointId) => void;
  setToId: (id: TransferEndpointId) => void;

  amount: string;
  setAmount: (value: string) => void;

  customChain: SupportedChain;
  setCustomChain: (chain: SupportedChain) => void;
  customAddress: string;
  setCustomAddress: (value: string) => void;

  from: TransferEndpoint | undefined;
  to: TransferEndpoint | undefined;
  sourceEndpoints: TransferEndpoint[];
  destinationEndpoints: TransferEndpoint[];

  route: TransferRoute;
  estimatedFee: { fee: number | null; unit: string | null };

  // How the transfer is carried out. The options depend on the direction of
  // travel, so this is the *effective* selection: if the user's last pick does
  // not carry the current direction, it falls back rather than leaving the
  // control showing something the route cannot use.
  mechanismId: TransferMechanismId | null;
  setMechanismId: (id: TransferMechanismId) => void;
  mechanismOptions: TransferMechanism[];
  // The protocol the chosen mechanism will run: steps, confirmations, timing,
  // trust model, its own fee. Null when nothing is selected or the selection
  // has no profile yet (a planned mechanism nobody has built).
  profile: MechanismProfile | null;

  exceedsBalance: boolean;
  canSwap: boolean;
  isReady: boolean;
  swap: () => void;

  formError: string | null;
  setFormError: (message: string | null) => void;
  // Validates and returns the request to send, or null after setting formError.
  build: () => TransferInitiateRequest | null;
}

export function useTransferComposer(
  registry: TransferEndpointsResult,
): TransferComposer {
  const { endpoints, byId } = registry;

  const [fromId, setFromId] = useState<TransferEndpointId>("btc");
  const [toId, setToId] = useState<TransferEndpointId>("l2");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // A destination that is not one of the user's own places.
  //
  // Without it the picker can only express "between my wallets", which leaves
  // same-chain sends unreachable — the one L2 endpoint would have to be both
  // sides at once — and offers no way to pay anyone else. The network is picked
  // explicitly rather than inferred from the address prefix because `addr_test1`
  // is ambiguous between Cardano Preprod and the Sundial L2, and guessing wrong
  // there sends funds to a chain the recipient is not on.
  const [customChain, setCustomChain] = useState<SupportedChain>("sundial_l2");
  const [customAddress, setCustomAddress] = useState("");
  const [preferredMechanismId, setMechanismId] =
    useState<TransferMechanismId | null>(null);

  const customEndpoint: TransferEndpoint = useMemo(() => {
    const trimmed = customAddress.trim();
    return {
      id: "custom",
      chain: customChain,
      label: "Another address",
      walletName: null,
      address: trimmed || null,
      // A destination-only endpoint has no signing key to read.
      publicKey: null,
      // Not ours to read, and reading it would be a needless lookup against an
      // address the user only wants to send to.
      balance: null,
      isLoadingBalance: false,
      isConnected: Boolean(trimmed),
      blockedReason: trimmed ? null : "Enter a destination address.",
      isManuallyAddressed: true,
      symbol: chainConfigs[customChain].symbol,
      decimals: chainConfigs[customChain].decimals,
    };
  }, [customChain, customAddress]);

  // You can send *to* an address you do not control, but not *from* one, so the
  // custom endpoint is a destination only.
  const sourceEndpoints = endpoints;
  const destinationEndpoints = useMemo(
    () => [...endpoints, customEndpoint],
    [endpoints, customEndpoint],
  );

  const from = byId(fromId);
  const to =
    toId === "custom"
      ? customEndpoint
      : destinationEndpoints.find((e) => e.id === toId);

  // Picking the same place on both sides is not a transfer. Nudging the other
  // side away is friendlier than disabling the choice and leaving the user to
  // work out why.
  useEffect(() => {
    if (fromId === toId) {
      const fallback = endpoints.find((e) => e.id !== fromId);
      if (fallback) setToId(fallback.id);
    }
  }, [fromId, toId, endpoints]);

  const route = useMemo(
    () =>
      from && to
        ? resolveTransferRoute(from.chain, to.chain)
        : resolveTransferRoute("btc", "btc"),
    [from, to],
  );

  const mechanismOptions = useMemo(
    () =>
      route.direction ? mechanismsFor(route.direction, route.baseChain) : [],
    [route.direction, route.baseChain],
  );

  // Derived rather than corrected in an effect: an effect that rewrites the
  // selection whenever the direction changes fights the user's own click and
  // can loop. Deriving means the control simply never shows an option the
  // current direction cannot use.
  const mechanismId = useMemo(() => {
    if (!route.direction) return null;
    if (
      preferredMechanismId &&
      mechanismOptions.some((m: TransferMechanism) => m.id === preferredMechanismId)
    ) {
      return preferredMechanismId;
    }
    return defaultMechanismFor(route.direction, route.baseChain);
  }, [route.direction, route.baseChain, preferredMechanismId, mechanismOptions]);

  const profile = useMemo(
    () =>
      mechanismId && route.direction && from
        ? resolveMechanismProfile(mechanismId, route.direction, from.chain)
        : null,
    [mechanismId, route.direction, from],
  );

  const estimatedFee = useMemo(() => {
    if (!from) return { fee: null, unit: null };
    if (from.chain === "btc" || from.chain === "btc_testnet") {
      return { fee: ESTIMATED_BTC_FEE_SATS, unit: "sats" };
    }
    if (from.chain === "ada" || from.chain === "ada_testnet") {
      return { fee: ESTIMATED_ADA_FEE_LOVELACE, unit: "lovelace" };
    }
    return { fee: null, unit: null };
  }, [from]);

  const parsed = Number(amount);
  const hasAmount =
    amount.trim() !== "" && Number.isFinite(parsed) && parsed > 0;
  const exceedsBalance =
    from?.balance !== null && from?.balance !== undefined && hasAmount
      ? parsed > from.balance
      : false;

  // Swapping is only meaningful if the destination could actually be spent
  // from: it has an address, and it is one of the user's own places. A pasted
  // address is a destination only — there are no keys for it here.
  const canSwap = toId !== "custom" && Boolean(to?.address);

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
    setFormError(null);
  };

  const isReady =
    route.kind !== "unsupported" &&
    // A route is only ready if some mechanism can actually carry it.
    (!route.direction ||
      (mechanismId !== null &&
        isMechanismAvailableFor(
          mechanismId,
          route.direction,
          route.baseChain,
        ))) &&
    Boolean(from?.address) &&
    Boolean(to?.address) &&
    hasAmount &&
    !exceedsBalance;

  const build = (): TransferInitiateRequest | null => {
    setFormError(null);

    if (!from || !to) return null;
    if (route.kind === "unsupported") return null;

    if (!from.address) {
      setFormError(from.blockedReason ?? "The source is not available.");
      return null;
    }
    if (!to.address) {
      setFormError(to.blockedReason ?? "The destination is not available.");
      return null;
    }
    if (!hasAmount) {
      setFormError("Enter an amount to transfer.");
      return null;
    }
    const minimum = chainConfigs[from.chain].minDeposit;
    if (parsed < minimum) {
      setFormError(
        `The minimum transfer from ${from.label} is ${minimum} ${from.symbol}.`,
      );
      return null;
    }
    if (exceedsBalance) {
      setFormError("That is more than the available balance.");
      return null;
    }

    if (
      route.direction &&
      (mechanismId === null ||
        !isMechanismAvailableFor(
          mechanismId,
          route.direction,
          route.baseChain,
        ))
    ) {
      setFormError("No transfer route is available for this direction yet.");
      return null;
    }

    return {
      fromChain: from.chain,
      toChain: to.chain,
      fromAddress: from.address,
      toAddress: to.address,
      amount: parsed,
      ...(mechanismId ? { mechanism: mechanismId } : {}),
      // Harmless outside demo mode — mock and live both ignore it. Demo mode
      // needs it to build a timelock script the way the staking flow already
      // does; see hooks/dashboard/transfer-endpoints.ts's own doc comment.
      ...(from.publicKey ? { sourcePublicKey: from.publicKey } : {}),
    };
  };

  return {
    fromId,
    toId,
    setFromId,
    setToId,
    amount,
    setAmount,
    customChain,
    setCustomChain,
    customAddress,
    setCustomAddress,
    from,
    to,
    sourceEndpoints,
    destinationEndpoints,
    route,
    estimatedFee,
    mechanismId,
    setMechanismId,
    mechanismOptions,
    profile,
    exceedsBalance,
    canSwap,
    isReady,
    swap,
    formError,
    setFormError,
    build,
  };
}

export default useTransferComposer;
