"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useLocalStorage } from "usehooks-ts";

import BtcHoldings from "@/components/btc/btc-holdings";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { useL2Balance } from "@/hooks/dashboard/l2-balance";
import { useWalletBalance } from "@/hooks/dashboard/wallet-balance";
import type { BtcHolding } from "@/lib/btc-sources";
import type { SupportedChain } from "@/lib/multichain";
import L2AddressForm from "./l2-address-form";

// Wires each BTC source to its balance and hands the set to the presentational
// holdings component, which sums them into one BTC figure and offers the split.
//
// Adding another bridged source is: register it in lib/btc-sources.ts, resolve
// its balance here, push a BtcHolding. The total, breakdown and chips follow.

const L2_ADDRESS_STORAGE_KEY = "sundial:l2-address";

export default function DashboardBtcHoldings({
  onExpandedChange,
}: {
  onExpandedChange?: (expanded: boolean) => void;
} = {}) {
  const { address: btcAddress, isConnected } = useAppKitAccount();
  const { walletBalances } = useDashboardContext();

  // --- Native BTC, on the Bitcoin network -----------------------------------

  // Pick the network from the address itself so a mainnet or testnet wallet
  // both resolve, rather than pinning one and silently failing on the other.
  const chain: SupportedChain = btcAddress?.startsWith("tb1")
    ? "btc_testnet"
    : "btc";

  // Called for its side effect: it fetches and writes the raw balance into
  // context. We read the raw value below rather than this hook's return, which
  // is `availableBalance` - a fee reserve subtracted for transaction building.
  // That is right for a staking form and wrong for "what do I hold".
  const { isFetchingBalance } = useWalletBalance({
    selectedChain: chain,
    btcAddress: btcAddress ?? "",
    cardanoBalance: undefined,
  });

  // --- Bridged BTC, on the Sundial L2 ---------------------------------------

  // Persisted so a page reload does not cost the user their address again.
  const [l2Address, setL2Address] = useLocalStorage(L2_ADDRESS_STORAGE_KEY, "");
  const l2 = useL2Balance(l2Address);

  const holdings: BtcHolding[] = [
    {
      sourceId: "bitcoin-l1",
      // Null rather than zero when no wallet is connected: an unknown balance
      // and an empty one are different facts, and the total says which it has.
      amount: isConnected ? walletBalances.BTC : null,
      isLoading: isFetchingBalance,
    },
    {
      sourceId: "sundial-l2",
      amount: l2Address ? l2.balance : null,
      isLoading: l2.isLoading,
    },
  ];

  return (
    <BtcHoldings
      holdings={holdings}
      onExpandedChange={onExpandedChange}
      controls={{
        "bitcoin-l1": <ConnectButton size="sm" />,
        "sundial-l2": (
          <L2AddressForm
            address={l2Address}
            onAddressChange={setL2Address}
            onRefresh={l2.refresh}
            isLoading={l2.isLoading}
            error={l2.error}
            utxoCount={l2.utxoCount}
          />
        ),
      }}
    />
  );
}
