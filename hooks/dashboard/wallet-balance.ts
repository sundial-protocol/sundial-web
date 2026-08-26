"use client";

import { useState, useEffect } from "react";
import {
  SupportedChain,
  chainConfigs,
  isBitcoinChain,
  isSundialL2,
} from "@/lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

// Flat fee reserves subtracted from wallet balance to ensure txs don't fail
const BTC_FEE_RESERVE = 0.00006; // 6000 sats - covers fee + dust for typical staking tx
const ADA_FEE_RESERVE = 0.5; // 0.5 ADA - covers tx fee + min-UTXO
// One base unit at the L2's 6dp. L2 transfers carry no Bitcoin fee, so this is
// a rounding guard rather than a real reserve.
const L2_FEE_RESERVE = 0.000001;

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
  // Bitcoin networks only. The Sundial L2 holds BTC but has no mempool.space
  // presence, so it must never reach the fetch below - its balance comes from
  // useL2Balance, which writes into the same context under the "L2" key.
  const isBtc = isBitcoinChain(selectedChain);

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
    : isSundialL2(selectedChain)
      ? walletBalances.L2
      : selectedChain === "ada" || selectedChain === "ada_testnet"
        ? walletBalances.ADA
        : null;

  // Pick the reserve per chain rather than "BTC or else ADA". The L2 needs its
  // own: it is not a Bitcoin chain, so the old fallback would have subtracted
  // the 0.5 ADA reserve from a BTC-denominated balance and zeroed out anything
  // under half a BTC.
  const feeReserve = isBtc
    ? BTC_FEE_RESERVE
    : isSundialL2(selectedChain)
      ? L2_FEE_RESERVE
      : ADA_FEE_RESERVE;

  const availableBalance: number | null =
    rawBalance !== null ? Math.max(0, rawBalance - feeReserve) : null;

  return { availableBalance, isFetchingBalance };
}
