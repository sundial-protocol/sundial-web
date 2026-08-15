"use client";

import { useMemo } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useLocalStorage } from "usehooks-ts";

import { useCardanoWallet } from "@/lib/wallet/cardano/context";
import { useClientMounted } from "@/lib/wallet/bitcoin/mount";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { useL2Balance } from "@/hooks/dashboard/l2-balance";
import {
  BTC_CHAIN_ID_TESTNET,
  chainConfigs,
  type SupportedChain,
} from "@/lib/multichain";

/**
 * The places a user can move value from and to.
 *
 * Built from what is actually connected rather than from a static list, because
 * the transfer UI's whole premise is "between your wallets" — a picker offering
 * a wallet that is not connected, with no balance and no address, is offering
 * something that cannot be transacted.
 *
 * Endpoints are still listed while disconnected, but flagged: seeing that
 * Cardano is an option and needs connecting is useful, whereas hiding it
 * entirely makes the app look like it does not support Cardano at all.
 *
 * The Sundial L2 has no wallet integration yet — it is addressed by pasting a
 * bech32 account, held in the same localStorage key the staking form and the
 * balance card use, so an address entered anywhere works everywhere.
 */

// Shared with app/dashboard/deposit/l2-staking-form.tsx.
const L2_ADDRESS_STORAGE_KEY = "sundial:l2-address";

export type TransferEndpointId = "btc" | "ada" | "l2" | "custom";

export interface TransferEndpoint {
  id: TransferEndpointId;
  chain: SupportedChain;
  // "Bitcoin", "Cardano", "Sundial L2".
  label: string;
  // The wallet providing it, when one does. Null for the L2 and for a pasted
  // address.
  walletName: string | null;
  address: string | null;
  // Whole units. Null when unknown — not connected, still loading, or the
  // lookup failed. Kept distinct from zero, which is a different fact.
  balance: number | null;
  isLoadingBalance: boolean;
  isConnected: boolean;
  // Why it cannot be used right now, if it cannot.
  blockedReason: string | null;
  // True when the address is typed into the form rather than supplied by a
  // wallet. Such an endpoint must stay selectable while its address is still
  // empty — the input that fills it only appears once it is selected, so
  // gating selection on having an address locks the user out of ever entering
  // one.
  isManuallyAddressed: boolean;
  // Ticker and precision, from the chain registry.
  symbol: string;
  decimals: number;
}

export interface TransferEndpointsResult {
  endpoints: TransferEndpoint[];
  // Endpoints that can currently be a source: connected, with an address.
  sources: TransferEndpoint[];
  byId: (id: TransferEndpointId) => TransferEndpoint | undefined;
  l2Address: string;
  setL2Address: (value: string) => void;
}

export function useTransferEndpoints(): TransferEndpointsResult {
  // Nothing the browser knows privately may reach the first client render.
  //
  // Both the AppKit store and localStorage are restored before React hydrates,
  // so reading them straight away answers questions the server could not have
  // answered — which wallet is connected, which Bitcoin network it is on, which
  // L2 address was saved. The server rendered "Bitcoin"; the client would
  // render "Bitcoin Testnet"; React calls that a hydration failure and throws
  // the tree away. So the first client render repeats the server's answer —
  // disconnected, mainnet defaults — and the mount effect re-renders with the
  // truth a tick later.
  const mounted = useClientMounted();

  const { address: walletBtcAddress, isConnected: isBtcWalletConnected } =
    useAppKitAccount({ namespace: "bip122" });
  const { caipNetworkId } = useAppKitNetwork();
  const cardano = useCardanoWallet();
  const { walletBalances } = useDashboardContext();

  const isBtcConnected = mounted && isBtcWalletConnected;
  const btcAddress = mounted ? walletBtcAddress : undefined;

  const [storedL2Address, setL2Address] = useLocalStorage(
    L2_ADDRESS_STORAGE_KEY,
    "",
  );
  const l2Address = mounted ? storedL2Address : "";
  const { balance: l2Balance, isLoading: isL2Loading } =
    useL2Balance(l2Address);

  // Which Bitcoin network the connected wallet is actually on. Getting this
  // from the wallet rather than assuming mainnet matters: an address pasted or
  // derived for the wrong network is the classic way to lose funds, and the
  // route resolver refuses cross-network pairs only if it is told the truth.
  const btcChain: SupportedChain = useMemo(
    () =>
      mounted &&
      typeof caipNetworkId === "string" &&
      caipNetworkId.includes(BTC_CHAIN_ID_TESTNET)
        ? "btc_testnet"
        : "btc",
    [mounted, caipNetworkId],
  );

  // Safe to read unguarded: the Cardano wallet lives in a React context whose
  // default is "Mainnet" on both sides, and is only filled in by an effect
  // after hydration.
  const adaChain: SupportedChain =
    cardano.network === "Mainnet" ? "ada" : "ada_testnet";

  return useMemo(() => {
    const endpoints: TransferEndpoint[] = [
      {
        id: "btc",
        chain: btcChain,
        label: chainConfigs[btcChain].name,
        walletName: isBtcConnected ? "Bitcoin wallet" : null,
        address: isBtcConnected ? (btcAddress ?? null) : null,
        balance: isBtcConnected ? walletBalances.BTC : null,
        isLoadingBalance: false,
        isConnected: isBtcConnected,
        blockedReason: isBtcConnected ? null : "Connect a Bitcoin wallet.",
        isManuallyAddressed: false,
        symbol: chainConfigs[btcChain].symbol,
        decimals: chainConfigs[btcChain].decimals,
      },
      {
        id: "ada",
        chain: adaChain,
        label: chainConfigs[adaChain].name,
        walletName: cardano.isConnected
          ? cardano.selectedWallet || "Cardano wallet"
          : null,
        address: cardano.isConnected
          ? (cardano.changeAddress ?? cardano.defaultAddress ?? null)
          : null,
        balance: cardano.isConnected ? walletBalances.ADA : null,
        isLoadingBalance: cardano.isConnecting,
        isConnected: cardano.isConnected,
        blockedReason: cardano.isConnected ? null : "Connect a Cardano wallet.",
        isManuallyAddressed: false,
        symbol: chainConfigs[adaChain].symbol,
        decimals: chainConfigs[adaChain].decimals,
      },
      {
        id: "l2",
        chain: "sundial_l2",
        label: chainConfigs.sundial_l2.name,
        // No wallet integration exists for the L2 yet, so it is addressed by
        // hand. Saying so is better than showing an empty wallet slot.
        walletName: null,
        address: l2Address.trim() || null,
        balance: l2Address.trim() ? l2Balance : null,
        isLoadingBalance: isL2Loading,
        isConnected: Boolean(l2Address.trim()),
        blockedReason: l2Address.trim()
          ? null
          : "Add your Sundial L2 account address.",
        isManuallyAddressed: true,
        symbol: chainConfigs.sundial_l2.symbol,
        decimals: chainConfigs.sundial_l2.decimals,
      },
    ];

    return {
      endpoints,
      sources: endpoints.filter((e) => e.isConnected && e.address),
      byId: (id: TransferEndpointId) => endpoints.find((e) => e.id === id),
      l2Address,
      setL2Address,
    };
  }, [
    btcChain,
    adaChain,
    btcAddress,
    isBtcConnected,
    cardano.isConnected,
    cardano.isConnecting,
    cardano.selectedWallet,
    cardano.changeAddress,
    cardano.defaultAddress,
    walletBalances.BTC,
    walletBalances.ADA,
    l2Address,
    l2Balance,
    isL2Loading,
    setL2Address,
  ]);
}

export default useTransferEndpoints;
