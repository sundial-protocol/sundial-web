"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  L2BalanceCode,
  L2BalanceResponse,
} from "@/app/api/testnet/utxos/types";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

/**
 * Reads an address's spendable balance on the Sundial L2 and syncs it into
 * Dashboard context so any tab can read it.
 *
 * The balance comes from `/api/testnet/utxos`, which proxies the node's `/utxos`
 * endpoint — the browser never talks to the node directly. Pass a null or empty
 * address to idle (nothing is fetched and the context balance is cleared).
 *
 * `refresh()` is exposed because balances move in response to user actions the
 * page already knows about — a faucet claim, a deposit — and waiting on a poll
 * makes those feel broken.
 *
 * The returned `balance` is the real fetched amount plus
 * `demoL2Credit` — demo mode's fake transferred funds (see
 * lib/transfer/demo-service.ts and dashboard.tsx's own doc comment on
 * `creditDemoL2Transfer`), which is always 0 outside a settled demo transfer.
 * Layered on at read time rather than baked into the fetched value, so every
 * mounted instance of this hook — dashboard overview, staking, transfer —
 * picks up a new credit immediately when a demo transfer settles, without
 * waiting on its own next poll.
 */
export function useL2Balance(address: string | null | undefined) {
  const { setWalletBalance, demoL2Credit } = useDashboardContext();

  const [rawBalance, setRawBalance] = useState<number | null>(null);
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
      setRawBalance(null);
      setUtxoCount(null);
      setError(null);
      setErrorCode(null);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        const res = await fetch(
          `/api/testnet/utxos?address=${encodeURIComponent(trimmed)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as L2BalanceResponse;
        if (cancelled) return;

        if ("error" in data) {
          setError(data.error);
          setErrorCode(data.code);
          setRawBalance(null);
          setUtxoCount(null);
          return;
        }

        setRawBalance(data.balance);
        setUtxoCount(data.utxoCount);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch L2 balance:", err);
        setError("Could not reach the L2 balance service.");
        setErrorCode("NODE_UNAVAILABLE");
        setRawBalance(null);
        setUtxoCount(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [trimmed, reloadToken]);

  const balance =
    trimmed && rawBalance !== null ? rawBalance + demoL2Credit : null;

  // A separate effect from the fetch itself: this also has to fire when only
  // `demoL2Credit` changes, i.e. a demo transfer just settled and this
  // instance is not the one that credited it and is not about to re-fetch on
  // its own.
  useEffect(() => {
    setWalletBalanceRef.current("L2", balance);
  }, [balance]);

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
