"use client";

import { useState, useEffect } from "react";
import { SupportedChain } from "@/lib/multichain";
import usePrices, {
  convertWithPrices,
  DEFAULT_PRICES,
  PricesMap,
} from "./prices";
import { getYield } from "./get-yield";

export interface LoggedTx {
  id: string;
  type: "deposit" | "withdraw" | "stake" | "unstake" | "reward";
  asset: string; // "btc", "ada", etc.
  amount: number;
  txHash?: string; // Optional for pending transactions
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  usdValue?: number;
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
  priceMap: PricesMap
): EarningsData[] {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  const data: EarningsData[] = [];
  let ada = convertWithPrices(adaValue, "USD", "ADA", priceMap);

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
      ada =
        ada +
        convertWithPrices(getYield(ada + btcValue), "USD", "ADA", priceMap);

      data.push({
        month: monthName,
        btcEarnings: null,
        adaEarnings: null,
        total: null,
        btcProjected: btcValue,
        adaProjected: ada,
        totalProjected: btcValue + ada,
        type: "projected",
      });
    }
  }

  return data;
}

// Custom Hooks
export function useDashboardData() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    holdings: { BTC: 0, ADA: 0 },
    staking: {
      BTC: { staked: 0, yield: 0, positions: [] },
      ADA: { staked: 0, yield: 0, positions: [] },
    },
  });
  const calculations = usePortfolioCalculations(portfolioData);
  const [earningsData, setEarningsData] = useState<EarningsData[]>(() =>
    generateEarningsData(
      mockPortfolioData.staking.ADA.staked,
      mockPortfolioData.staking.BTC.staked,
      DEFAULT_PRICES
    )
  );
  const [transactions, setTransactions] = useState<LoggedTx[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update staking amounts after successful transactions
  const updateStakedAmount = (
    chain: SupportedChain,
    amount: number,
    type: "deposit" | "withdraw",
    txHash?: string
  ) => {
    setPortfolioData((prev) => {
      const asset = chain.toUpperCase() as "BTC" | "ADA";
      const multiplier = type === "deposit" ? 1 : -1;
      const amountChange = amount * multiplier;

      // Update holdings
      const newHoldings = {
        ...prev.holdings,
        [asset]: Math.max(0, prev.holdings[asset] + amountChange),
      };

      // Update staking
      const newStaking = {
        ...prev.staking,
        [asset]: {
          ...prev.staking[asset],
          staked: Math.max(0, prev.staking[asset].staked + amountChange),
          yield: getYield(prev.staking[asset].staked + amountChange), // Your yield calculation logic
        },
      };

      return {
        ...prev,
        holdings: newHoldings,
        staking: newStaking,
      };
    });
  };

  // Function to add pending transaction (called when transaction is initiated)
  const addPendingTransaction = (
    chain: SupportedChain,
    amount: number,
    type: "deposit" | "withdraw"
  ) => {
    const transactionId = `tx-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newTx: LoggedTx = {
      id: transactionId,
      type,
      asset: chain,
      amount,
      timestamp: new Date(),
      status: "pending",
      usdValue: amount * (chain === "btc" ? 52000 : 0.35), // Calculate USD value
      // txHash is undefined for pending transactions
    };

    setTransactions((prev) => [newTx, ...prev]);

    console.log("Added pending transaction:", newTx);
    return transactionId;
  };

  // Function to update transaction status
  const updateTransactionStatus = (
    transactionId: string,
    status: "completed" | "failed",
    txHash?: string
  ) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          const updatedTx = {
            ...tx,
            status,
            txHash: status === "completed" ? txHash : tx.txHash,
          };

          console.log("Updated transaction status:", {
            transactionId,
            status,
            txHash,
            previousStatus: tx.status,
          });

          return updatedTx;
        }
        return tx;
      })
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
    (tx) => tx.status === "pending"
  );
  const completedTransactions = transactions.filter(
    (tx) => tx.status === "completed"
  );
  const failedTransactions = transactions.filter(
    (tx) => tx.status === "failed"
  );

  return {
    portfolioData,
    earningsData,
    calculations,
    updateStakedAmount,
    error,
    isLoading,

    // Transaction-related returns
    transactions,
    pendingTransactions,
    completedTransactions,
    failedTransactions,
    addPendingTransaction,
    updateTransactionStatus,
    removeTransaction,
  };
}

export function usePortfolioCalculations(portfolioData: PortfolioData) {
  const { convert, prices } = usePrices();
  const btcRewards = 0;
  const adaRewards = getYield(
    convert(portfolioData.holdings.BTC, "BTC", "USD") +
      convert(portfolioData.holdings.ADA, "ADA", "USD")
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

// Utility functions
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
  asset: "BTC" | "ADA"
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

// Start everything at 0
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
