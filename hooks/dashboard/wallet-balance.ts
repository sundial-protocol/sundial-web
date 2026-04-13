"use client";

import { useState, useEffect } from "react";
import { SupportedChain, chainConfigs } from "@/lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

// Flat fee reserves subtracted from wallet balance to ensure txs don't fail
const BTC_FEE_RESERVE = 0.00006; // 6000 sats — covers fee + dust for typical staking tx
const ADA_FEE_RESERVE = 0.5; // 0.5 ADA — covers tx fee + min-UTXO

/**
 * Syncs wallet balances into Dashboard context so any tab can read them.
 *
 * Call once from a component that has access to the connected wallet addresses.
 * Returns the available balance for the currently selected chain plus a loading flag.
 */
export function useWalletBalance({
  selectedChain,
  btcAddress,
  cardanoBalance,
}: {
  selectedChain: SupportedChain;
  btcAddress: string;
  cardanoBalance: number | undefined;
}) {
  const { walletBalances, setWalletBalance } = useDashboardContext();
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  const config = chainConfigs[selectedChain];
  const isBtc = selectedChain === "btc" || selectedChain === "btc_testnet";

  // Fetch BTC balance from mempool.space when address is available
  useEffect(() => {
    if (
      !isBtc ||
      !btcAddress ||
      !config ||
      !btcAddress.startsWith(config.addressPrefix)
    ) {
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      setIsFetchingBalance(true);
      try {
        const isTestnet = selectedChain === "btc_testnet";
        const baseUrl = isTestnet
          ? "https://mempool.space/testnet/api"
          : "https://mempool.space/api";
        const res = await fetch(
          `${baseUrl}/address/${encodeURIComponent(btcAddress)}`,
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          const funded = data.chain_stats?.funded_txo_sum ?? 0;
          const spent = data.chain_stats?.spent_txo_sum ?? 0;
          const mempoolFunded = data.mempool_stats?.funded_txo_sum ?? 0;
          const mempoolSpent = data.mempool_stats?.spent_txo_sum ?? 0;
          const balanceSats = funded - spent + mempoolFunded - mempoolSpent;
          setWalletBalance("BTC", balanceSats / 1e8);
        }
      } catch (err) {
        console.error("Failed to fetch BTC balance:", err);
      }
      if (!cancelled) setIsFetchingBalance(false);
    };

    fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [btcAddress, selectedChain]);

  // Sync Cardano wallet balance into dashboard state
  useEffect(() => {
    if (
      (selectedChain === "ada" || selectedChain === "ada_testnet") &&
      cardanoBalance != null
    ) {
      setWalletBalance("ADA", cardanoBalance);
    }
  }, [cardanoBalance, selectedChain]);

  // Derive the spendable balance (raw minus flat fee reserve)
  const rawBalance: number | null = isBtc
    ? walletBalances.BTC
    : selectedChain === "ada" || selectedChain === "ada_testnet"
      ? walletBalances.ADA
      : null;

  const availableBalance: number | null =
    rawBalance !== null
      ? Math.max(0, rawBalance - (isBtc ? BTC_FEE_RESERVE : ADA_FEE_RESERVE))
      : null;

  return { availableBalance, isFetchingBalance };
}
