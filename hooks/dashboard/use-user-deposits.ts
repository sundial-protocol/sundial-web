"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserDeposit, DepositStatus } from "@/app/api/user-deposits/types";
import type { PortfolioData, StakingPosition, LoggedTx } from "./dashboard";
import { getLockPeriod } from "./yield-opportunities";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

/**
 * Statuses where funds are still actively staked or being processed.
 * WITHDRAWAL_CONFIRMED is excluded — those funds have returned to the user.
 */
const ACTIVE_STATUSES: DepositStatus[] = [
  "DEPOSIT_SEEN",
  "DEPOSIT_CONFIRMED",
  "PROVIDER_CLAIM_SEEN",
  "PROVIDER_CLAIM_CONFIRMED",
  "DISTRIBUTION_SEEN",
  "DISTRIBUTION_CONFIRMED",
  "WITHDRAWAL_SEEN",
];

function depositToTxStatus(
  status: DepositStatus,
): "pending" | "completed" | "failed" {
  if (status === "INTENT_CREATED" || status === "DEPOSIT_SEEN") return "pending";
  return "completed";
}

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

function depositToLoggedTx(d: UserDeposit): LoggedTx {
  return {
    id: d.deposit_id,
    // A deposit that has been fully withdrawn is a "withdraw" type in the history
    type: d.status === "WITHDRAWAL_CONFIRMED" ? "withdraw" : "deposit",
    asset: "btc",
    amount: d.amount_sats / 1e8,
    timestamp: new Date(d.created_at),
    status: depositToTxStatus(d.status),
    details: d.status,
    txHash: d.tx_hash ?? undefined,
  };
}

function depositsToPortfolioData(deposits: UserDeposit[]): PortfolioData {
  const activeDeposits = deposits.filter((d) =>
    ACTIVE_STATUSES.includes(d.status),
  );

  const totalStakedBtc = activeDeposits.reduce(
    (sum, d) => sum + d.amount_sats / 1e8,
    0,
  );

  const positions: StakingPosition[] = activeDeposits.map((d) => ({
    id: d.deposit_id,
    type: "Bitcoin Staking",
    amount: d.amount_sats / 1e8,
    // APY is driven by selectedYieldProvider in calculations; alpha_bps is escrow allocation, not APY
    apy: 0,
    risk: "Low" as const,
    lockPeriod: getLockPeriod(d.lock_ms / 1000),
    startDate: new Date(d.created_at),
  }));

  return {
    holdings: { BTC: totalStakedBtc, ADA: 0 },
    staking: {
      BTC: { staked: totalStakedBtc, yield: 0, positions },
      ADA: { staked: 0, yield: 0, positions: [] },
    },
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUserDeposits(btcAddress: string | undefined) {
  const [deposits, setDeposits] = useState<UserDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    if (!btcAddress) {
      setDeposits([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/user-deposits?address=${encodeURIComponent(btcAddress)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).error ?? "Failed to load deposits");
      }
      setDeposits(data as UserDeposit[]);
    } catch (err: any) {
      console.error("useUserDeposits: failed to fetch deposits:", err);
      setError(err.message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [btcAddress]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Derived values
  const portfolioData = depositsToPortfolioData(deposits);
  const serverTransactions: LoggedTx[] = deposits.map(depositToLoggedTx);

  // lock_ms / 1000 → seconds for the most recent active deposit.
  // Used to pre-fill the locktime for withdrawal PSBT construction.
  const activeDeposits = deposits.filter((d) =>
    ACTIVE_STATUSES.includes(d.status),
  );
  const activeLocktime =
    activeDeposits.length > 0
      ? activeDeposits[activeDeposits.length - 1].lock_ms / 1000
      : null;

  return {
    deposits,
    portfolioData,
    serverTransactions,
    activeLocktime,
    isLoading,
    error,
    refetch: fetchDeposits,
  };
}
