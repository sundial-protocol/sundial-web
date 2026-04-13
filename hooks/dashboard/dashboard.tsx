"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { SupportedChain } from "@/lib/multichain";
import usePrices, { DEFAULT_PRICES, PricesMap } from "./prices";
import { yieldFromProvider, YieldOpportunity } from "./yield-opportunities";
import { useUserDeposits } from "./use-user-deposits";

// Enhanced transaction types to include lending
export type TransactionType =
  | "deposit"
  | "withdraw"
  | "stake"
  | "unstake"
  | "reward"
  | "loan_created"
  | "loan_payment"
  | "loan_extended"
  | "loan_refinanced"
  | "loan_closed";

export interface LoggedTx {
  id: string;
  type: TransactionType; // Enhanced to include lending types
  asset: string; // "btc", "ada", "usdc", etc.
  amount: number;
  txHash?: string; // Optional for pending transactions
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  usdValue?: number;

  // Lending-specific fields (optional for backward compatibility)
  loanId?: string;
  collateral?: {
    asset: string;
    amount: number;
  };
  interestRate?: number;
  details?: string;
}

// New lending-specific transaction type guards
export interface StakingTransaction extends LoggedTx {
  type: "deposit" | "withdraw" | "stake" | "unstake" | "reward";
  chain?: string;
}

export interface LendingTransaction extends LoggedTx {
  type:
    | "loan_created"
    | "loan_payment"
    | "loan_extended"
    | "loan_refinanced"
    | "loan_closed";
  loanId: string; // Required for lending transactions
  collateral?: {
    asset: string;
    amount: number;
  };
  interestRate?: number;
  details?: string;
}

export type RiskEval = "Zero" | "Low" | "Medium" | "High";

export interface ActiveProgram {
  program_id: string;
  provider_id: string;
  name?: string;
  expected_yield_bps?: number;
  min_lock_ms?: number;
  program_vault_address?: string;
}

// Types
export interface PortfolioData {
  // Core Holdings (source of truth)
  holdings: {
    BTC: number;
    ADA: number;
  };

  // Staking Information
  staking: {
    BTC: {
      staked: number;
      yield: number; // Annual yield percentage
      positions: StakingPosition[];
    };
    ADA: {
      staked: number;
      yield: number;
      positions: StakingPosition[];
    };
  };

  performance?: {
    dailyChange: {
      BTC: number;
      ADA: number;
    };
    lastUpdate: Date;
  };
}

export type PortfolioCalculations = ReturnType<typeof usePortfolioCalculations>;

export interface StakingPosition {
  id: string;
  type: string; // "Bitcoin Staking", "Liquid Staking", etc.
  amount: number;
  apy: number;
  risk: RiskEval;
  lockPeriod: string;
  startDate: Date;
}

export interface EarningsData {
  month: string;
  btcEarnings: number | null;
  adaEarnings: number | null;
  total: number | null;
  btcProjected: number | null;
  adaProjected: number | null;
  totalProjected: number | null;
  type: "historical" | "current" | "projected";
}

export function generateEarningsData(
  adaValue: number,
  btcValue: number,
  provider: YieldOpportunity | null,
): EarningsData[] {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  const data: EarningsData[] = [];
  let btc = btcValue;

  // Generate 12 months of data (6 historical, 6 projected from today)
  for (let i = -6; i <= 6; i++) {
    const date = new Date(currentYear, currentMonth + i, 1);
    const monthName = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const isHistorical = i < 0;
    const isCurrent = i === 0;

    if (isHistorical) {
      // Historical months - no earnings (user hasn't invested yet)
      data.push({
        month: monthName,
        btcEarnings: 0,
        adaEarnings: 0,
        total: 0,
        btcProjected: null,
        adaProjected: null,
        totalProjected: null,
        type: "historical",
      });
    } else if (isCurrent) {
      data.push({
        month: monthName,
        btcEarnings: 0,
        adaEarnings: 0,
        total: 0,
        btcProjected: 0,
        adaProjected: 0,
        totalProjected: 0,
        type: "current",
      });
    } else {
      btc = btc + yieldFromProvider(btc, provider);

      data.push({
        month: monthName,
        btcEarnings: null,
        adaEarnings: null,
        total: null,
        btcProjected: btc,
        adaProjected: adaValue,
        totalProjected: btc + adaValue,
        type: "projected",
      });
    }
  }

  return data;
}

// Custom Hooks
export type WalletBalances = {
  BTC: number | null;
  ADA: number | null;
};

export function useDashboardData() {
  // ── Wallet address (drives server fetch) ────────────────────────────────
  const { address: btcAddress } = useAppKitAccount({ namespace: "bip122" });

  // ── Server-derived portfolio data ────────────────────────────────────────
  const {
    deposits,
    portfolioData,
    serverTransactions,
    activeLocktime,
    isLoading,
    error,
    refetch,
  } = useUserDeposits(btcAddress);

  // ── Local optimistic pending/failed transactions (shown until server confirms) ─
  const [pendingTxs, setPendingTxs] = useState<LoggedTx[]>([]);

  // Merge: show pending/failed local txs on top of server-sourced history
  const transactions: LoggedTx[] = [
    ...pendingTxs.filter((tx) => tx.status !== "completed"),
    ...serverTransactions,
  ];

  // ── Wallet balances ──────────────────────────────────────────────────────
  const [walletBalances, setWalletBalances] = useState<WalletBalances>({
    BTC: null,
    ADA: null,
  });
  const setWalletBalance = (asset: "BTC" | "ADA", balance: number | null) => {
    setWalletBalances((prev) => ({ ...prev, [asset]: balance }));
  };

  // ── Yield provider & active program ─────────────────────────────────────
  const [selectedYieldProvider, setSelectedYieldProvider] =
    useState<YieldOpportunity | null>(null);
  const [activeProgram, setActiveProgram] = useState<ActiveProgram | null>(null);
  const clearActiveProgram = () => setActiveProgram(null);

  // ── Derived calculations ─────────────────────────────────────────────────
  const calculations = usePortfolioCalculations(portfolioData, selectedYieldProvider);

  // ── updateStakedAmount: triggers a server refetch instead of local mutation ─
  const updateStakedAmount = useCallback(
    (
      _chain: SupportedChain,
      _amount: number,
      _type: "deposit" | "withdraw",
      _txHash?: string,
    ) => {
      // Schedule a refetch after a short delay to give the indexer time to pick
      // up the broadcast. The PSBT signing step already updated the optimistic
      // pending tx; the server response will replace it once it propagates.
      setTimeout(refetch, 3000);
    },
    [refetch],
  );

  // ── Refresh (exposed to consumers, e.g. for pull-to-refresh) ────────────
  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  // ── addPendingTransaction: optimistic UI during signing ─────────────────
  const addPendingTransaction = useCallback(
    (
      chain: SupportedChain | string,
      amount: number,
      type: TransactionType,
      extraData?: {
        loanId?: string;
        collateral?: { asset: string; amount: number };
        interestRate?: number;
        details?: string;
      },
    ): string => {
      const transactionId = `tx-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newTx: LoggedTx = {
        id: transactionId,
        type,
        asset: chain.toLowerCase(),
        amount,
        timestamp: new Date(),
        status: "pending",
        ...(extraData?.loanId && { loanId: extraData.loanId }),
        ...(extraData?.collateral && { collateral: extraData.collateral }),
        ...(extraData?.interestRate && { interestRate: extraData.interestRate }),
        ...(extraData?.details && { details: extraData.details }),
      };

      setPendingTxs((prev) => [newTx, ...prev]);
      return transactionId;
    },
    [],
  );

  // ── updateTransactionStatus: updates local pending tx + triggers refetch on success ─
  const updateTransactionStatus = useCallback(
    (
      transactionId: string,
      status: "completed" | "failed",
      txHash?: string,
      extraData?: { locktime?: number; [key: string]: any },
    ) => {
      setPendingTxs((prev) =>
        prev.map((tx) =>
          tx.id === transactionId
            ? {
                ...tx,
                status,
                txHash: status === "completed" ? txHash : tx.txHash,
                ...(extraData || {}),
              }
            : tx,
        ),
      );

      // On success, schedule a refetch so the server deposit replaces the local pending tx
      if (status === "completed") {
        setTimeout(refetch, 3000);
      }
    },
    [refetch],
  );

  const removeTransaction = useCallback((transactionId: string) => {
    setPendingTxs((prev) => prev.filter((tx) => tx.id !== transactionId));
  }, []);

  // ── Transaction helper functions ─────────────────────────────────────────
  const getTransactionsByType = useCallback(
    (type: TransactionType | TransactionType[]): LoggedTx[] => {
      const types = Array.isArray(type) ? type : [type];
      return transactions.filter((tx) => types.includes(tx.type));
    },
    [transactions],
  );

  const getTransactionsByLoanId = useCallback(
    (loanId: string): LendingTransaction[] =>
      transactions.filter(
        (tx): tx is LendingTransaction =>
          "loanId" in tx && tx.loanId === loanId,
      ),
    [transactions],
  );

  const getStakingTransactions = useCallback(
    (): StakingTransaction[] =>
      transactions.filter((tx): tx is StakingTransaction =>
        ["deposit", "withdraw", "stake", "unstake", "reward"].includes(tx.type),
      ),
    [transactions],
  );

  const getLendingTransactions = useCallback(
    (): LendingTransaction[] =>
      transactions.filter((tx): tx is LendingTransaction =>
        [
          "loan_created",
          "loan_payment",
          "loan_extended",
          "loan_refinanced",
          "loan_closed",
        ].includes(tx.type),
      ),
    [transactions],
  );

  // Clean up old failed/completed pending txs after 10 minutes
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      setPendingTxs((prev) =>
        prev.filter((tx) => {
          const ageMs = now.getTime() - tx.timestamp.getTime();
          return !(ageMs > 10 * 60 * 1000 && tx.status !== "pending");
        }),
      );
    }, 60_000);
    return () => clearInterval(cleanup);
  }, []);

  // Computed slices
  const pendingTransactions = transactions.filter((tx) => tx.status === "pending");
  const completedTransactions = transactions.filter((tx) => tx.status === "completed");
  const failedTransactions = transactions.filter((tx) => tx.status === "failed");

  return {
    // Server-derived portfolio
    portfolioData,
    deposits,
    activeLocktime,
    calculations,
    isLoading,
    error,
    refreshData,
    updateStakedAmount,

    // Transactions (server history + local pending overlay)
    transactions,
    pendingTransactions,
    completedTransactions,
    failedTransactions,
    addPendingTransaction,
    updateTransactionStatus,
    removeTransaction,
    getTransactionsByType,
    getTransactionsByLoanId,
    getStakingTransactions,
    getLendingTransactions,

    // Yield provider & active program
    selectedYieldProvider,
    setSelectedYieldProvider,
    activeProgram,
    setActiveProgram,
    clearActiveProgram,

    // Wallet balances
    walletBalances,
    setWalletBalance,
  };
}

export function usePortfolioCalculations(
  portfolioData: PortfolioData,
  selectedYieldProvider?: YieldOpportunity | null,
) {
  const { convert } = usePrices();

  const adaRewards = 0;
  const btcRewards = yieldFromProvider(
    convert(portfolioData.holdings.BTC, "BTC", "USD") +
      convert(portfolioData.holdings.ADA, "ADA", "USD"),
    selectedYieldProvider ?? null, // can be undefined - if so coerce to null
  );

  return {
    // USD Values (computed on demand)
    totalValue:
      convert(portfolioData.holdings.BTC, "BTC", "USD") +
      convert(portfolioData.holdings.ADA, "ADA", "USD"),

    btcValue: convert(portfolioData.holdings.BTC, "BTC", "USD"),
    adaValue: convert(portfolioData.holdings.ADA, "ADA", "USD"),

    // Staking Summary
    totalStakedValue:
      convert(portfolioData.staking.BTC.staked, "BTC", "USD") +
      convert(portfolioData.staking.ADA.staked, "ADA", "USD"),

    // Monthly Rewards (computed)
    monthlyRewards: {
      BTC: btcRewards,
      ADA: adaRewards,
      total: btcRewards + adaRewards,
    },

    // Asset Allocation
    allocation: {
      btcPercent:
        (portfolioData.holdings.BTC /
          (portfolioData.holdings.BTC + portfolioData.holdings.ADA)) *
        100,
      adaPercent:
        (portfolioData.holdings.ADA /
          (portfolioData.holdings.BTC + portfolioData.holdings.ADA)) *
        100,
    },
  };
}

// EXISTING: Utility functions (unchanged)
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatAssetAmount(
  amount: number,
  asset: "BTC" | "ADA",
): string {
  const decimals = asset === "BTC" ? 6 : 2;
  return `${amount.toFixed(decimals)} ${asset}`;
}

export function getAssetPrice(asset: "BTC" | "ADA"): number {
  // Mock prices - in a real app, fetch from price API
  const prices = {
    BTC: 52000,
    ADA: 1.2,
  };
  return prices[asset];
}

// EXISTING: Mock data (unchanged)
export const mockPortfolioData: PortfolioData = {
  holdings: {
    BTC: 0,
    ADA: 0,
  },
  staking: {
    BTC: {
      staked: 0,
      yield: 0,
      positions: [],
    },
    ADA: {
      staked: 0,
      yield: 0,
      positions: [],
    },
  },
  performance: {
    dailyChange: {
      BTC: 0,
      ADA: 0,
    },
    lastUpdate: new Date(0),
  },
};

export const mockEarningsData: EarningsData[] = [
  // Historical data (before today) - empty earnings
  {
    month: "Oct 2024",
    btcEarnings: 0,
    adaEarnings: 0,
    total: 0,
    btcProjected: null,
    adaProjected: null,
    totalProjected: null,
    type: "historical",
  },
  {
    month: "Nov 2024",
    btcEarnings: 0,
    adaEarnings: 0,
    total: 0,
    btcProjected: null,
    adaProjected: null,
    totalProjected: null,
    type: "historical",
  },
  {
    month: "Dec 2024",
    btcEarnings: 0,
    adaEarnings: 0,
    total: 0,
    btcProjected: null,
    adaProjected: null,
    totalProjected: null,
    type: "historical",
  },
  {
    month: "Jan 2025",
    btcEarnings: 0,
    adaEarnings: 0,
    total: 0,
    btcProjected: null,
    adaProjected: null,
    totalProjected: null,
    type: "historical",
  },
  {
    month: "Feb 2025",
    btcEarnings: 0,
    adaEarnings: 0,
    total: 0,
    btcProjected: null,
    adaProjected: null,
    totalProjected: null,
    type: "historical",
  },
  {
    month: "Mar 2025",
    btcEarnings: 0,
    adaEarnings: 0,
    total: 0,
    btcProjected: null,
    adaProjected: null,
    totalProjected: null,
    type: "historical",
  },

  // Today and forward - projected earnings only
  {
    month: "Oct 2025",
    btcEarnings: 0,
    adaEarnings: 0,
    total: 0,
    btcProjected: 270,
    adaProjected: 85,
    totalProjected: 355,
    type: "current",
  },
  {
    month: "Nov 2025",
    btcEarnings: null,
    adaEarnings: null,
    total: null,
    btcProjected: 285,
    adaProjected: 92,
    totalProjected: 377,
    type: "projected",
  },
  {
    month: "Dec 2025",
    btcEarnings: null,
    adaEarnings: null,
    total: null,
    btcProjected: 300,
    adaProjected: 98,
    totalProjected: 398,
    type: "projected",
  },
  {
    month: "Jan 2026",
    btcEarnings: null,
    adaEarnings: null,
    total: null,
    btcProjected: 315,
    adaProjected: 105,
    totalProjected: 420,
    type: "projected",
  },
  {
    month: "Feb 2026",
    btcEarnings: null,
    adaEarnings: null,
    total: null,
    btcProjected: 330,
    adaProjected: 112,
    totalProjected: 442,
    type: "projected",
  },
  {
    month: "Mar 2026",
    btcEarnings: null,
    adaEarnings: null,
    total: null,
    btcProjected: 345,
    adaProjected: 118,
    totalProjected: 463,
    type: "projected",
  },
];
