"use client";

import { useState } from "react";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";

export function getLockPeriod(locktimeMs: number): string {
  if (locktimeMs <= 0) {
    return "None";
  }

  const days = locktimeMs / (1000 * 60 * 60 * 24);

  if (days < 1) {
    const hours = Math.round(locktimeMs / (1000 * 60 * 60));
    return hours === 1 ? "1 hour" : `${hours} hours`;
  } else if (days < 7) {
    return days === 1 ? "1 day" : `${Math.round(days)} days`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  } else {
    const years = Math.round(days / 365);
    return years === 1 ? "1 year" : `${years} years`;
  }
}

export interface YieldOpportunity {
  // basic info
  id: number;
  name: string;
  description: string;
  provider: string;
  totalLocked: number;

  // tags
  type: "staking" | "lending" | "liquidity" | "alternative";
  risk: "Low" | "Medium" | "High"; // Or use RiskEval if you want to keep it consistent

  // yield details
  apy: number;
  minAmount: number;
  payments: number; // Number of payments per year (for lending)

  // blockchain details
  publicKey: string; // Public key for the provider
  locktime: number; // unix duration for lockup in milliseconds
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
    maxMinAmount?: number,
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
    sortBy: "apy" | "totalLocked" | "minAmount" | "name" = "apy",
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
    description: "Stake your Bitcoin with trusted validators and earn rewards",
    provider: "Sundial Network",
    totalLocked: 1250000,
    type: "staking",
    risk: "Low",
    apy: 3.5,
    minAmount: 0.01,
    payments: 12, // Number of payments per year
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
  },
  {
    id: 2,
    name: "Liquid Staking",
    description: "Stake Bitcoin and receive liquid tokens for DeFi",
    provider: "Sundial Protocol",
    totalLocked: 850000,
    type: "staking",
    risk: "Low",
    apy: 3.2,
    minAmount: 0.001,
    payments: 12, // Number of payments per year
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
  },
  {
    id: 3,
    name: "BTC Lending Pool",
    description: "Lend Bitcoin to borrowers and earn interest",
    provider: "DeFi Lending",
    totalLocked: 500000,
    type: "lending",
    risk: "Medium",
    apy: 5.3,
    minAmount: 0.1,
    payments: 12, // Number of payments per year (for lending)
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
  },
  {
    id: 4,
    name: "BTC-USDC LP",
    description: "Provide liquidity and earn trading fees",
    provider: "DEX Protocol",
    totalLocked: 300000,
    type: "liquidity",
    risk: "High",
    apy: 7.7,
    minAmount: 0.05,
    payments: 365, // Daily rewards
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
  },
  {
    id: 5,
    name: "Real Estate Token",
    description: "Invest in tokenized real estate assets",
    provider: "RealFi",
    totalLocked: 750000,
    type: "alternative",
    risk: "Medium",
    apy: 4.8,
    minAmount: 0.5,
    payments: 4, // Quarterly payments
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
  },
];

export function yieldFromProvider(
  principal: number,
  provider: YieldOpportunity | null,
  fullProjection: boolean = false,
) {
  if (!provider) {
    console.log("No yield provider selected, returning 0 yield");
    return 0;
  }
  return yieldFromApy(
    provider.apy,
    principal,
    fullProjection ? 1 : provider.payments,
  );
}

export function yieldFromApy(
  apy: number,
  principal: number,
  paymentsPerYear: number = 12,
) {
  return (apy / 100 / paymentsPerYear) * principal;
}
