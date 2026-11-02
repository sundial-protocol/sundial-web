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
// Each status check is abandoned after this long, so one stalled request can't
// hold up the others or the next round.
const STATUS_TIMEOUT_MS = 10_000;

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
  // Transactions already announced, so a confirmation is reported once even if
  // the list hasn't re-rendered with the new status by the next check.
  const announced = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const waiting = transactionsRef.current.filter(
        (tx) =>
          tx.status === "pending" &&
          tx.txHash &&
          !announced.current.has(tx.id) &&
          isBitcoinChain(tx.asset as SupportedChain),
      );

      for (const tx of waiting) {
        try {
          const res = await fetch(
            `${esploraBase(tx.asset as SupportedChain)}/tx/${tx.txHash}/status`,
            { signal: AbortSignal.timeout(STATUS_TIMEOUT_MS) },
          );
          if (!res.ok || cancelled) continue;
          const status: { confirmed: boolean; block_height?: number } =
            await res.json();
          if (!status.confirmed || cancelled) continue;

          announced.current.add(tx.id);
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
          // Network error or timeout: try again on the next tick.
        }
      }
    };

    // Each check is scheduled after the previous one finishes, not on a fixed
    // interval, so a slow mempool.space response can't overlap the next check.
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      await check();
      if (!cancelled) timer = setTimeout(loop, POLL_INTERVAL_MS);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
