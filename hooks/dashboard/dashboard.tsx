"use client";

import { useState, useEffect } from "react";
import { SupportedChain } from "@/lib/multichain";
import usePrices from "./prices";
import { yieldFromProvider, YieldOpportunity } from "./yield-opportunities";

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
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    holdings: { BTC: 0, ADA: 0 },
    staking: {
      BTC: { staked: 0, yield: 0, positions: [] },
      ADA: { staked: 0, yield: 0, positions: [] },
    },
  });
  const [walletBalances, setWalletBalances] = useState<WalletBalances>({
    BTC: null,
    ADA: null,
  });

  const setWalletBalance = (asset: "BTC" | "ADA", balance: number | null) => {
    setWalletBalances((prev) => ({ ...prev, [asset]: balance }));
  };
  const [selectedYieldProvider, setSelectedYieldProvider] =
    useState<YieldOpportunity | null>(null);
  const calculations = usePortfolioCalculations(
    portfolioData,
    selectedYieldProvider,
  );
  const [earningsData] = useState<EarningsData[]>(() =>
    generateEarningsData(
      mockPortfolioData.staking.ADA.staked,
      mockPortfolioData.staking.BTC.staked,
      selectedYieldProvider,
    ),
  );
  const [transactions, setTransactions] = useState<LoggedTx[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update staking amounts after successful transactions
  const updateStakedAmount = (
    chain: SupportedChain,
    amount: number,
    type: "deposit" | "withdraw",
    _txHash?: string,
  ) => {
    setPortfolioData((prev) => {
      // Map chain to the correct asset key, handling testnet cases
      let asset: "BTC" | "ADA";
      if (chain === "btc" || chain === "btc_testnet") {
        asset = "BTC";
      } else if (chain === "ada") {
        asset = "ADA";
      } else {
        console.warn(`Unknown chain: ${chain}, defaulting to BTC`);
        asset = "BTC";
      }

      const multiplier = type === "deposit" ? 1 : -1;
      const amountChange = amount * multiplier;

      console.log(
        `Dashboard update - Chain: ${chain}, Asset: ${asset}, Amount: ${amount}, Type: ${type}, Change: ${amountChange}`,
      );

      // Update holdings
      const newHoldings = {
        ...prev.holdings,
        [asset]: Math.max(0, prev.holdings[asset] + amountChange),
      };

      // Update staking
      const newStaking = {
        ...prev.staking,
        [asset]: {
          ...(prev.staking[asset] || { staked: 0, yield: 0, positions: [] }),
          staked: Math.max(
            0,
            (prev.staking[asset]?.staked || 0) + amountChange,
          ),
          yield: yieldFromProvider(
            (prev.staking[asset]?.staked || 0) + amountChange,
            selectedYieldProvider,
          ),
        },
      };

      console.log(`Updated staking for ${asset}:`, {
        oldStaked: prev.staking[asset]?.staked || 0,
        newStaked: newStaking[asset].staked,
        oldHoldings: prev.holdings[asset],
        newHoldings: newHoldings[asset],
      });

      return {
        ...prev,
        holdings: newHoldings,
        staking: newStaking,
      };
    });
  };

  const addPendingTransaction = (
    chain: SupportedChain | string,
    amount: number,
    type: TransactionType,
    extraData?: {
      loanId?: string;
      collateral?: { asset: string; amount: number };
      interestRate?: number;
      details?: string;
    },
  ) => {
    const transactionId = `tx-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Calculate USD value
    let usdValue = amount;
    const chainLower = chain.toLowerCase();
    if (chainLower === "btc") {
      usdValue = amount * 52000;
    } else if (chainLower === "ada") {
      usdValue = amount * 0.35;
    }

    const newTx: LoggedTx = {
      id: transactionId,
      type,
      asset: chainLower,
      amount,
      timestamp: new Date(),
      status: "pending",
      usdValue,
      // Add lending-specific fields if provided
      ...(extraData?.loanId && { loanId: extraData.loanId }),
      ...(extraData?.collateral && { collateral: extraData.collateral }),
      ...(extraData?.interestRate && { interestRate: extraData.interestRate }),
      ...(extraData?.details && { details: extraData.details }),
    };

    setTransactions((prev) => [newTx, ...prev]);

    console.log("Added pending transaction:", newTx);
    return transactionId;
  };

  // Function to update transaction status
  const updateTransactionStatus = (
    transactionId: string,
    status: "completed" | "failed",
    txHash?: string,
    extraData?: { locktime?: number; [key: string]: any },
  ) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          const updatedTx = {
            ...tx,
            status,
            txHash: status === "completed" ? txHash : tx.txHash,
            ...(extraData || {}), // Spread any extra data like locktime
          };

          console.log("Updated transaction status:", {
            transactionId,
            status,
            txHash,
            extraData,
            previousStatus: tx.status,
          });

          return updatedTx;
        }
        return tx;
      }),
    );
  };

  // Function to remove a transaction (for cleanup)
  const removeTransaction = (transactionId: string) => {
    setTransactions((prev) => {
      const filtered = prev.filter((tx) => tx.id !== transactionId);
      console.log("Removed transaction:", transactionId);
      return filtered;
    });
  };

  //  Transaction helper functions for lending
  const getTransactionsByType = (
    type: TransactionType | TransactionType[],
  ): LoggedTx[] => {
    const types = Array.isArray(type) ? type : [type];
    return transactions.filter((tx) => types.includes(tx.type));
  };

  const getTransactionsByLoanId = (loanId: string): LendingTransaction[] => {
    return transactions.filter(
      (tx): tx is LendingTransaction => "loanId" in tx && tx.loanId === loanId,
    );
  };

  const getStakingTransactions = (): StakingTransaction[] => {
    return transactions.filter((tx): tx is StakingTransaction =>
      ["deposit", "withdraw", "stake", "unstake", "reward"].includes(tx.type),
    );
  };

  const getLendingTransactions = (): LendingTransaction[] => {
    return transactions.filter((tx): tx is LendingTransaction =>
      [
        "loan_created",
        "loan_payment",
        "loan_extended",
        "loan_refinanced",
        "loan_closed",
      ].includes(tx.type),
    );
  };

  //  Refresh function to simulate data fetching
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you'd fetch fresh data here
      console.log("📊 Dashboard data refreshed");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh data";
      setError(errorMessage);
      console.error("Failed to refresh dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up old failed transactions (optional)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      setTransactions((prev) => {
        const filtered = prev.filter((tx) => {
          const isOld = now.getTime() - tx.timestamp.getTime() > 10 * 60 * 1000; // 10 minutes
          const shouldRemove = isOld && tx.status === "failed";

          if (shouldRemove) {
            console.log("Cleaning up old failed transaction:", tx.id);
          }

          return !shouldRemove;
        });

        return filtered;
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  // Computed values for easy access
  const pendingTransactions = transactions.filter(
    (tx) => tx.status === "pending",
  );
  const completedTransactions = transactions.filter(
    (tx) => tx.status === "completed",
  );
  const failedTransactions = transactions.filter(
    (tx) => tx.status === "failed",
  );

  return {
    portfolioData,
    earningsData,
    calculations,
    updateStakedAmount,
    error,
    isLoading,

    // Transaction-related return
    transactions,
    pendingTransactions,
    completedTransactions,
    failedTransactions,
    addPendingTransaction,
    updateTransactionStatus,
    removeTransaction,

    //  Lending-specific helper functions
    getTransactionsByType,
    getTransactionsByLoanId,
    getStakingTransactions,
    getLendingTransactions,
    refreshData,

    // Yield Provider Selection
    selectedYieldProvider,
    setSelectedYieldProvider,

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
