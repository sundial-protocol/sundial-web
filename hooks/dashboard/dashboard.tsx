"use client";

import { useState, useEffect } from "react";
import { LoggedTx } from "./tx-history";
import { SupportedChain } from "@/lib/multichain";

export type RiskEval = "Zero" | "Low" | "Medium" | "High";

// Types
export interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  btcValue: number;
  adaValue: number;
  btcChange: number;
  adaChange: number;
  btcChangePercent: number;
  adaChangePercent: number;
  // Add staking-specific fields
  totalBTC: number;
  totalStaked: number;
  currentYield: number;
  monthlyRewards: number;
  positions: Array<{
    type: string;
    amount: number;
    value: number;
    apy: number;
    risk: string;
    lockPeriod: string;
  }>;
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
  currentStaked: number = 0
): EarningsData[] {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  const data: EarningsData[] = [];

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
      // Calculate projected earnings based on current staked amount
      const monthsFromNow = i;
      const baseYield = 0.085; // 8.5% annual
      const monthlyYield = baseYield / 12;
      const btcPrice = 52000;

      const monthlyEarnings =
        currentStaked > 0
          ? Math.round(currentStaked * monthlyYield * btcPrice)
          : 0;

      const btcProjected = Math.round(monthlyEarnings * 0.9); // 90% BTC
      const adaProjected = Math.round(monthlyEarnings * 0.1); // 10% ADA

      data.push({
        month: monthName,
        btcEarnings: null,
        adaEarnings: null,
        total: null,
        btcProjected,
        adaProjected,
        totalProjected: btcProjected + adaProjected,
        type: "projected",
      });
    }
  }

  return data;
}

// Custom Hooks
export function useDashboardData() {
  const [portfolioData, setPortfolioData] =
    useState<PortfolioData>(mockPortfolioData);
  const [earningsData, setEarningsData] = useState<EarningsData[]>(() =>
    generateEarningsData(mockPortfolioData.totalStaked)
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
      const multiplier = type === "deposit" ? 1 : -1;
      const amountChange = amount * multiplier;

      // Calculate new staked amounts
      const newTotalStaked = Math.max(0, prev.totalStaked + amountChange);
      const newTotalBTC = chain === "btc" ? newTotalStaked : prev.totalBTC;

      // Calculate new yield based on staked amount (simple linear relationship)
      const newYield =
        newTotalStaked > 0 ? Math.min(0.085 + newTotalStaked * 0.001, 0.12) : 0;

      // Calculate new values
      const btcPrice = 52000; // Mock BTC price
      const newBtcValue = newTotalBTC * btcPrice;
      const newTotalValue = newBtcValue + prev.adaValue;
      const newMonthlyRewards = newTotalStaked * newYield * (btcPrice / 12);

      // Update positions
      let newPositions = [...prev.positions];

      if (type === "deposit" && amount > 0) {
        // Add or update position
        const existingIndex = newPositions.findIndex(
          (p) => p.type === "Bitcoin Staking"
        );

        if (existingIndex >= 0) {
          newPositions[existingIndex] = {
            ...newPositions[existingIndex],
            amount: newPositions[existingIndex].amount + amount,
            value: (newPositions[existingIndex].amount + amount) * btcPrice,
          };
        } else {
          newPositions.push({
            type: "Bitcoin Staking",
            amount: amount,
            value: amount * btcPrice,
            apy: newYield * 100,
            risk: "Low",
            lockPeriod: "7 days",
          });
        }
      } else if (type === "withdraw") {
        // Reduce or remove positions
        newPositions = newPositions
          .map((pos) => {
            if (pos.type === "Bitcoin Staking" && pos.amount > 0) {
              const newAmount = Math.max(0, pos.amount - amount);
              return {
                ...pos,
                amount: newAmount,
                value: newAmount * btcPrice,
              };
            }
            return pos;
          })
          .filter((pos) => pos.amount > 0); // Remove positions with 0 amount
      }

      return {
        ...prev,
        totalStaked: newTotalStaked,
        totalBTC: newTotalBTC,
        currentYield: newYield,
        monthlyRewards: newMonthlyRewards,
        btcValue: newBtcValue,
        totalValue: newTotalValue,
        positions: newPositions,
        // Update daily change to reflect the transaction
        dailyChange: prev.dailyChange + amountChange * btcPrice,
        dailyChangePercent:
          newTotalValue > 0
            ? ((amountChange * btcPrice) / newTotalValue) * 100
            : 0,
      };
    });

    // Add transaction to history
    if (txHash) {
      const transaction: LoggedTx = {
        id: `tx-${Date.now()}`,
        type,
        asset: chain,
        amount,
        txHash,
        timestamp: new Date(),
        status: "completed",
      };

      setTransactions((prev) => [transaction, ...prev]);
    }

    // Regenerate earnings data with new projections
    setEarningsData(generateEarningsData());
  };

  // Function to add pending transaction (called when transaction is initiated)
  const addPendingTransaction = (
    chain: SupportedChain,
    amount: number,
    type: "deposit" | "withdraw"
  ) => {
    const transaction: LoggedTx = {
      id: `pending-${Date.now()}`,
      type,
      asset: chain,
      amount,
      txHash: "pending",
      timestamp: new Date(),
      status: "pending",
    };

    setTransactions((prev) => [transaction, ...prev]);
    return transaction.id;
  };

  // Function to update transaction status
  const updateTransactionStatus = (
    transactionId: string,
    status: "completed" | "failed",
    txHash?: string
  ) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? { ...tx, status, ...(txHash && { txHash }) }
          : tx
      )
    );
  };

  const refetch = () => {
    setIsLoading(true);
    // Simulate API refetch
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return {
    portfolioData,
    earningsData,
    transactions,
    isLoading,
    error,
    updateStakedAmount,
    addPendingTransaction,
    updateTransactionStatus,
    refetch,
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

// Mock Data
export const mockPortfolioData: PortfolioData = {
  totalValue: 0,
  dailyChange: 0,
  dailyChangePercent: 0,
  btcValue: 0,
  adaValue: 0,
  btcChange: 0,
  adaChange: 0,
  btcChangePercent: 0,
  adaChangePercent: 0,
  // Staking data - all starting at 0
  totalBTC: 0,
  totalStaked: 0,
  currentYield: 0,
  monthlyRewards: 0,
  positions: [], // Empty positions array
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
