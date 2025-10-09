"use client";

import { useState, useEffect } from "react";

export type RiskEval = "Zero" | "Low" | "Medium" | "High";

// Types
export interface PortfolioData {
  totalBTC: number;
  totalStaked: number;
  totalLocked: number;
  totalValue: number;
  monthlyRewards: number;
  dailyChange: number;
  dailyChangePercent: number;
  positions: Position[];
}

export interface Position {
  type: string;
  amount: number;
  value: number;
  apy: number;
  risk: RiskEval;
  lockPeriod: string;
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

export function generateEarningsData(): EarningsData[] {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  const data: EarningsData[] = [];

  // Generate 12 months of data (6 historical, 6 projected from today)
  for (let i = -6; i < 6; i++) {
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
        btcEarnings: 1000,
        adaEarnings: 0,
        total: 1000,
        btcProjected: null,
        adaProjected: null,
        totalProjected: null,
        type: "historical",
      });
    } else {
      data.push({
        month: monthName,
        btcEarnings: null,
        adaEarnings: null,
        total: null,
        btcProjected: 2000,
        adaProjected: 0,
        totalProjected: 2000,
        type: isCurrent ? "current" : "projected",
      });
    }
  }

  return data;
}

// Custom Hooks
export function useDashboardData() {
  const [portfolioData, setPortfolioData] =
    useState<PortfolioData>(mockPortfolioData);
  const [earningsData, setEarningsData] = useState<EarningsData[]>(
    generateEarningsData()
  ); // Use dynamic function
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fetch from your API here
        // const data = await fetch('/api/dashboard').then(res => res.json());
        // setPortfolioData(data.portfolio);
        // setEarningsData(data.earnings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    portfolioData,
    earningsData,
    isLoading,
    error,
    refetch: () => {
      // Trigger data refetch
      setIsLoading(true);
      // ... refetch logic
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

// Mock Data
export const mockPortfolioData: PortfolioData = {
  totalValue: 125000,
  totalBTC: 2.45,
  totalStaked: 1.8,
  totalLocked: 0.65,
  dailyChange: 2850,
  dailyChangePercent: 2.3,
  monthlyRewards: 325,
  positions: [
    {
      type: "Staked",
      amount: 1.8,
      value: 72000,
      apy: 8.5,
      risk: "Low",
      lockPeriod: "7 days",
    },
    {
      type: "Liquid Staking",
      amount: 0.65,
      value: 26000,
      apy: 7.2,
      risk: "Low",
      lockPeriod: "None",
    },
    {
      type: "Lending",
      amount: 0.5,
      value: 20000,
      apy: 12.3,
      risk: "Medium",
      lockPeriod: "30 days",
    },
    {
      type: "Available",
      amount: 0.5,
      value: 20000,
      apy: 0,
      risk: "Zero",
      lockPeriod: "None",
    },
  ],
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
    btcEarnings: null,
    adaEarnings: null,
    total: null,
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
