"use client";

import { useEffect, useRef } from "react";
import { useAppKitAccount, useWalletInfo } from "@reown/appkit/react";
import { identifyWallet, resetIdentity, track } from "@/lib/analytics";

// Identifies the visitor in PostHog when a Bitcoin wallet connects, and
// starts a fresh anonymous ID when it disconnects, so two wallets used in
// one browser stay two people.
export function WalletIdentity() {
  const { address, isConnected } = useAppKitAccount({ namespace: "bip122" });
  const { walletInfo } = useWalletInfo();
  const identified = useRef<string | null>(null);

  useEffect(() => {
    if (isConnected && address && identified.current !== address) {
      identified.current = address;
      identifyWallet(address)
        .then((ok) => {
          if (ok) track("wallet_connected", { wallet_name: walletInfo?.name });
        })
        .catch(() => {});
    } else if (!isConnected && identified.current) {
      identified.current = null;
      resetIdentity();
    }
  }, [address, isConnected, walletInfo?.name]);

  return null;
}
