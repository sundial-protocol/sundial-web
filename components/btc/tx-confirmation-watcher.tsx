"use client";

import { useEffect, useRef } from "react";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { useToast } from "@/components/ui/toast";
import {
  chainConfigs,
  isBitcoinChain,
  type SupportedChain,
} from "@/lib/multichain";

// Bitcoin blocks come roughly every ten minutes, so checking every 15 seconds
// shows a confirmation soon after it happens without hammering mempool.space.
const POLL_INTERVAL_MS = 15_000;

const esploraBase = (chain: SupportedChain) =>
  chain === "btc_testnet"
    ? "https://mempool.space/testnet/api"
    : "https://mempool.space/api";

// Moves broadcast Bitcoin transactions from pending to completed once they are
// mined. Rendered once inside the dashboard, so it keeps watching whichever tab
// the user moves to, and the History tab and the stake form both read the
// result from the same transaction list.
//
// A transaction mempool.space has never seen stays pending rather than failing:
// it may still be propagating, and a "failed" label for a transaction that later
// confirms would be worse than a slow one.
export function TxConfirmationWatcher() {
  const { transactions, updateTransactionStatus, refreshWalletBalances } =
    useDashboardContext();
  const { addToast } = useToast();

  // The interval reads the latest list through a ref instead of restarting on
  // every change to it.
  const transactionsRef = useRef(transactions);
  transactionsRef.current = transactions;

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const waiting = transactionsRef.current.filter(
        (tx) =>
          tx.status === "pending" &&
          tx.txHash &&
          isBitcoinChain(tx.asset as SupportedChain),
      );

      for (const tx of waiting) {
        try {
          const res = await fetch(
            `${esploraBase(tx.asset as SupportedChain)}/tx/${tx.txHash}/status`,
          );
          if (!res.ok || cancelled) continue;
          const status: { confirmed: boolean; block_height?: number } =
            await res.json();
          if (!status.confirmed || cancelled) continue;

          updateTransactionStatus(tx.id, "completed", tx.txHash, {
            blockHeight: status.block_height,
          });
          refreshWalletBalances();
          addToast({
            type: "success",
            title: "Transaction confirmed",
            message: `Your ${tx.type} of ${tx.amount} ${
              chainConfigs[tx.asset as SupportedChain]?.symbol ?? ""
            } was confirmed${
              status.block_height ? ` in block ${status.block_height}` : ""
            }.`,
          });
        } catch {
          // Network error: try again on the next tick.
        }
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
