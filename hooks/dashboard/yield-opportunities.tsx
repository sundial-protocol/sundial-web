"use client";

import { useState } from "react";

export interface YieldOpportunity {
  id: number;
  name: string;
  type: "staking" | "lending" | "liquidity" | "alternative";
  apy: number;
  risk: "Low" | "Medium" | "High"; // Or use RiskEval if you want to keep it consistent
  lockPeriod: string;
  minAmount: number;
  totalLocked: number;
  description: string;
  provider: string;
}

export function useYieldOpportunities() {
  const [opportunities, setOpportunities] =
    useState<YieldOpportunity[]>(yieldOpportunities);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterOpportunities = (
    type?: "staking" | "lending" | "liquidity" | "alternative",
    risk?: "Low" | "Medium" | "High",
    minAPY?: number,
    maxMinAmount?: number
  ) => {
    return opportunities.filter((opportunity) => {
      if (type && opportunity.type !== type) return false;
      if (risk && opportunity.risk !== risk) return false;
      if (minAPY && opportunity.apy < minAPY) return false;
      if (maxMinAmount && opportunity.minAmount > maxMinAmount) return false;
      return true;
    });
  };

  const sortOpportunities = (
    sortBy: "apy" | "totalLocked" | "minAmount" | "name" = "apy"
  ) => {
    return [...opportunities].sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy;
        case "totalLocked":
          return b.totalLocked - a.totalLocked;
        case "minAmount":
          return a.minAmount - b.minAmount;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  return {
    opportunities,
    isLoading,
    error,
    filterOpportunities,
    sortOpportunities,
  };
}

// Mock yield opportunities data
const yieldOpportunities: YieldOpportunity[] = [
  {
    id: 1,
    name: "Bitcoin Staking",
    type: "staking",
    apy: 8.5,
    risk: "Low",
    lockPeriod: "7 days",
    minAmount: 0.01,
    totalLocked: 1250000,
    description: "Stake your Bitcoin with trusted validators and earn rewards",
    provider: "Sundial Network",
  },
  {
    id: 2,
    name: "Liquid Staking",
    type: "staking",
    apy: 7.2,
    risk: "Low",
    lockPeriod: "None",
    minAmount: 0.001,
    totalLocked: 850000,
    description: "Stake Bitcoin and receive liquid tokens for DeFi",
    provider: "Sundial Protocol",
  },
  {
    id: 3,
    name: "BTC Lending Pool",
    type: "lending",
    apy: 12.3,
    risk: "Medium",
    lockPeriod: "30 days",
    minAmount: 0.1,
    totalLocked: 500000,
    description: "Lend Bitcoin to borrowers and earn interest",
    provider: "DeFi Lending",
  },
  {
    id: 4,
    name: "BTC-USDC LP",
    type: "liquidity",
    apy: 15.7,
    risk: "High",
    lockPeriod: "None",
    minAmount: 0.05,
    totalLocked: 300000,
    description: "Provide liquidity and earn trading fees",
    provider: "DEX Protocol",
  },
  {
    id: 5,
    name: "Real Estate Token",
    type: "alternative",
    apy: 9.8,
    risk: "Medium",
    lockPeriod: "1 year",
    minAmount: 0.5,
    totalLocked: 750000,
    description: "Invest in tokenized real estate assets",
    provider: "RealFi",
  },
];
