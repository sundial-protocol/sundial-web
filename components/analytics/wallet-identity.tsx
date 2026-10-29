"use client";

import { useEffect, useRef } from "react";
import { useAppKitAccount, useWalletInfo } from "@reown/appkit/react";
import { fetchWalletId, identify, resetIdentity, track } from "@/lib/analytics";

// Identifies the visitor in PostHog when a Bitcoin wallet connects, and
// starts a fresh anonymous ID when it disconnects or switches account, so two
// wallets used in one browser stay two people.
export function WalletIdentity() {
  const { address, isConnected } = useAppKitAccount({ namespace: "bip122" });
  const { walletInfo } = useWalletInfo();
  const current = useRef<string | null>(null);
  // Bumped on every change, so a lookup that returns after the wallet has
  // switched or disconnected is ignored.
  const generation = useRef(0);

  useEffect(() => {
    const next = isConnected && address ? address : null;
    if (next === current.current) return;

    const run = ++generation.current;
    if (current.current) resetIdentity();
    current.current = next;
    if (!next) return;

    const walletName = walletInfo?.name;
    fetchWalletId(next).then((id) => {
      if (run !== generation.current) return;
      if (id) identify(id);
      // Counted even when identification fails, as an anonymous connection.
      track("wallet_connected", { wallet_name: walletName, identified: !!id });
    });
  }, [address, isConnected, walletInfo?.name]);

  // Invalidate any pending lookup when the component unmounts.
  useEffect(() => () => void generation.current++, []);

  return null;
}
