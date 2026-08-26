"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  L2BalanceCode,
  L2BalanceResponse,
} from "@/app/api/l2/utxos/types";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

/**
 * Reads an address's spendable balance on the Sundial L2 and syncs it into
 * Dashboard context so any tab can read it.
 *
 * The balance comes from `/api/l2/utxos`, which proxies the node's `/utxos`
 * endpoint - the browser never talks to the node directly. Pass a null or empty
 * address to idle (nothing is fetched and the context balance is cleared).
 *
 * `refresh()` is exposed because balances move in response to user actions the
 * page already knows about - a faucet claim, a deposit - and waiting on a poll
 * makes those feel broken.
 */
export function useL2Balance(address: string | null | undefined) {
  const { setWalletBalance } = useDashboardContext();

  const [balance, setBalance] = useState<number | null>(null);
  const [utxoCount, setUtxoCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<L2BalanceCode | null>(null);

  // Bumping this re-runs the effect below; it is how `refresh()` works without
  // duplicating the fetch or racing the effect's own cancellation guard.
  const [reloadToken, setReloadToken] = useState(0);
  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  // Held in a ref so the effect does not depend on the context setter's
  // identity, which changes on every dashboard render.
  const setWalletBalanceRef = useRef(setWalletBalance);
  setWalletBalanceRef.current = setWalletBalance;

  const trimmed = address?.trim() ?? "";

  useEffect(() => {
    if (!trimmed) {
      setBalance(null);
      setUtxoCount(null);
      setError(null);
      setErrorCode(null);
      setWalletBalanceRef.current("L2", null);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        const res = await fetch(
          `/api/l2/utxos?address=${encodeURIComponent(trimmed)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as L2BalanceResponse;
        if (cancelled) return;

        if ("error" in data) {
          setError(data.error);
          setErrorCode(data.code);
          setBalance(null);
          setUtxoCount(null);
          setWalletBalanceRef.current("L2", null);
          return;
        }

        setBalance(data.balance);
        setUtxoCount(data.utxoCount);
        setWalletBalanceRef.current("L2", data.balance);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch L2 balance:", err);
        setError("Could not reach the L2 balance service.");
        setErrorCode("NODE_UNAVAILABLE");
        setBalance(null);
        setUtxoCount(null);
        setWalletBalanceRef.current("L2", null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [trimmed, reloadToken]);

  return {
    balance,
    utxoCount,
    isLoading,
    error,
    errorCode,
    refresh,
  };
}

export default useL2Balance;
