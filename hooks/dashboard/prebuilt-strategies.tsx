"import client";
import { useState } from "react";
import { RiskEval } from "./dashboard";

export interface PrebuiltStrategy {
  id: number;
  name: string;
  description: string;
  risk: RiskEval;
  expectedAPY: number;
  minAmount: number;
  timeHorizon: string;
  popularity: number;
  allocation: Array<{
    type: string;
    percentage: number;
    apy: number;
  }>;
  features: string[];
  totalUsers: number;
  totalLocked: number;
  performance: {
    "1M": number;
    "3M": number;
    "6M": number;
    "1Y": number;
  };
}

// Mock data for prebuilt strategies
export const mockPrebuiltStrategies: PrebuiltStrategy[] = [
  {
    id: 1,
    name: "Conservative Income",
    description:
      "Stable yield focused on preservation of capital with steady returns from established protocols",
    risk: "Low",
    expectedAPY: 4.2,
    minAmount: 1000,
    timeHorizon: "6+ months",
    popularity: 85,
    allocation: [
      { type: "Liquid Staking (stETH)", percentage: 45, apy: 4.1 },
      { type: "USDC Lending (Aave)", percentage: 35, apy: 4.5 },
      { type: "Government Bond Tokens", percentage: 20, apy: 3.8 },
    ],
    features: [
      "Low volatility",
      "Daily yield accrual",
      "Instant liquidity",
      "Insurance covered",
      "Battle-tested protocols",
    ],
    totalUsers: 12847,
    totalLocked: 45620000,
    performance: {
      "1M": 0.35,
      "3M": 1.05,
      "6M": 2.1,
      "1Y": 4.2,
    },
  },
  {
    id: 2,
    name: "Balanced Growth",
    description:
      "Diversified approach balancing stable yields with moderate growth opportunities",
    risk: "Medium",
    expectedAPY: 6.8,
    minAmount: 2500,
    timeHorizon: "3-12 months",
    popularity: 92,
    allocation: [
      { type: "DeFi Blue Chips", percentage: 40, apy: 7.2 },
      { type: "Liquid Staking", percentage: 25, apy: 4.1 },
      { type: "Yield Farming (Curve)", percentage: 20, apy: 8.5 },
      { type: "Stablecoin Lending", percentage: 15, apy: 5.1 },
    ],
    features: [
      "Auto-rebalancing",
      "Diversified exposure",
      "Moderate volatility",
      "Professional management",
      "Tax-optimized",
    ],
    totalUsers: 23156,
    totalLocked: 127850000,
    performance: {
      "1M": 0.57,
      "3M": 1.7,
      "6M": 3.4,
      "1Y": 6.8,
    },
  },
  {
    id: 3,
    name: "DeFi Alpha Hunter",
    description:
      "Aggressive strategy targeting high-yield opportunities in emerging DeFi protocols",
    risk: "High",
    expectedAPY: 8.5,
    minAmount: 5000,
    timeHorizon: "1-6 months",
    popularity: 67,
    allocation: [
      { type: "New Protocol Farming", percentage: 35, apy: 9.8 },
      { type: "Leverage Yield Farming", percentage: 25, apy: 8.2 },
      { type: "Liquidity Provision", percentage: 25, apy: 7.5 },
      { type: "Hedge Positions", percentage: 15, apy: 3.2 },
    ],
    features: [
      "High yield potential",
      "Active management",
      "Risk hedging",
      "Early protocol access",
      "Weekly rebalancing",
    ],
    totalUsers: 5432,
    totalLocked: 28950000,
    performance: {
      "1M": 0.71,
      "3M": 2.13,
      "6M": 4.25,
      "1Y": 8.5,
    },
  },
  {
    id: 4,
    name: "Bitcoin Maximalist",
    description:
      "Bitcoin-focused strategy using wrapped BTC for yield while maintaining BTC exposure",
    risk: "Medium",
    expectedAPY: 5.8,
    minAmount: 10000,
    timeHorizon: "12+ months",
    popularity: 73,
    allocation: [
      { type: "Wrapped BTC Lending", percentage: 50, apy: 5.5 },
      { type: "Lightning Network", percentage: 20, apy: 6.8 },
      { type: "BTC Mining Tokens", percentage: 20, apy: 6.2 },
      { type: "BTC Options Strategies", percentage: 10, apy: 7.5 },
    ],
    features: [
      "100% BTC exposure",
      "No altcoin risk",
      "Lightning integration",
      "Mining exposure",
      "Options yield",
    ],
    totalUsers: 8934,
    totalLocked: 95420000,
    performance: {
      "1M": 0.48,
      "3M": 1.45,
      "6M": 2.9,
      "1Y": 5.8,
    },
  },
  {
    id: 5,
    name: "Stablecoin Fortress",
    description:
      "Ultra-safe strategy focused entirely on USD-pegged stablecoins with minimal risk",
    risk: "Low",
    expectedAPY: 3.8,
    minAmount: 500,
    timeHorizon: "1+ months",
    popularity: 78,
    allocation: [
      { type: "USDC (Coinbase)", percentage: 40, apy: 3.2 },
      { type: "USDT Lending", percentage: 30, apy: 4.1 },
      { type: "DAI Savings Rate", percentage: 20, apy: 4.5 },
      { type: "Treasury Bills (RWA)", percentage: 10, apy: 3.8 },
    ],
    features: [
      "Zero volatility",
      "USD denominated",
      "Daily liquidity",
      "FDIC-style insurance",
      "Emergency fund suitable",
    ],
    totalUsers: 18765,
    totalLocked: 78320000,
    performance: {
      "1M": 0.32,
      "3M": 0.95,
      "6M": 1.9,
      "1Y": 3.8,
    },
  },
  {
    id: 6,
    name: "Ethereum Ecosystem",
    description:
      "Diversified ETH strategy leveraging the full Ethereum ecosystem for maximum yield",
    risk: "Medium",
    expectedAPY: 7.4,
    minAmount: 3000,
    timeHorizon: "6-18 months",
    popularity: 81,
    allocation: [
      { type: "ETH 2.0 Staking", percentage: 35, apy: 4.1 },
      { type: "DeFi Protocols (ETH)", percentage: 30, apy: 8.5 },
      { type: "Layer 2 Farming", percentage: 20, apy: 9.1 },
      { type: "ETH Lending", percentage: 15, apy: 5.9 },
    ],
    features: [
      "Pure ETH exposure",
      "Ecosystem growth",
      "L2 opportunities",
      "Staking rewards",
      "DeFi innovation",
    ],
    totalUsers: 14523,
    totalLocked: 156780000,
    performance: {
      "1M": 0.62,
      "3M": 1.85,
      "6M": 3.7,
      "1Y": 7.4,
    },
  },
  {
    id: 7,
    name: "Real World Assets",
    description:
      "Bridge traditional finance with DeFi through tokenized real-world assets",
    risk: "Low",
    expectedAPY: 5.3,
    minAmount: 2000,
    timeHorizon: "6-24 months",
    popularity: 64,
    allocation: [
      { type: "Tokenized Treasuries", percentage: 40, apy: 3.8 },
      { type: "Real Estate Tokens", percentage: 25, apy: 6.5 },
      { type: "Corporate Bonds", percentage: 20, apy: 4.9 },
      { type: "Commodities (Gold)", percentage: 15, apy: 8.2 },
    ],
    features: [
      "Real-world backing",
      "Regulatory compliance",
      "Traditional asset exposure",
      "Stable returns",
      "Inflation hedge",
    ],
    totalUsers: 6789,
    totalLocked: 34560000,
    performance: {
      "1M": 0.44,
      "3M": 1.33,
      "6M": 2.65,
      "1Y": 5.3,
    },
  },
  {
    id: 8,
    name: "Arbitrage Specialist",
    description:
      "Advanced strategy exploiting price differences across exchanges and protocols",
    risk: "Medium",
    expectedAPY: 6.7,
    minAmount: 7500,
    timeHorizon: "3-9 months",
    popularity: 45,
    allocation: [
      { type: "Cross-Chain Arbitrage", percentage: 35, apy: 8.2 },
      { type: "DEX Arbitrage", percentage: 30, apy: 6.9 },
      { type: "Funding Rate Arbitrage", percentage: 20, apy: 5.5 },
      { type: "Stablecoin Arbitrage", percentage: 15, apy: 4.1 },
    ],
    features: [
      "Market inefficiency capture",
      "Algorithm-driven",
      "Low correlation",
      "High frequency trading",
      "Risk-neutral strategies",
    ],
    totalUsers: 2134,
    totalLocked: 15680000,
    performance: {
      "1M": 0.56,
      "3M": 1.68,
      "6M": 3.35,
      "1Y": 6.7,
    },
  },
  {
    id: 9,
    name: "Multi-Chain Explorer",
    description:
      "Diversified across multiple blockchains to capture the best opportunities",
    risk: "High",
    expectedAPY: 8.2,
    minAmount: 4000,
    timeHorizon: "3-12 months",
    popularity: 69,
    allocation: [
      { type: "Solana Ecosystem", percentage: 25, apy: 9.5 },
      { type: "Polygon DeFi", percentage: 25, apy: 7.8 },
      { type: "Avalanche Farms", percentage: 20, apy: 8.1 },
      { type: "Ethereum Base", percentage: 15, apy: 6.2 },
      { type: "Binance Smart Chain", percentage: 15, apy: 8.7 },
    ],
    features: [
      "Multi-chain exposure",
      "Ecosystem diversification",
      "Cross-chain bridges",
      "Emerging chain access",
      "Geographic diversification",
    ],
    totalUsers: 9876,
    totalLocked: 67890000,
    performance: {
      "1M": 0.68,
      "3M": 2.05,
      "6M": 4.1,
      "1Y": 8.2,
    },
  },
  {
    id: 10,
    name: "Institutional Grade",
    description:
      "Enterprise-level strategy designed for large allocations with institutional controls",
    risk: "Low",
    expectedAPY: 4.5,
    minAmount: 50000,
    timeHorizon: "12+ months",
    popularity: 38,
    allocation: [
      { type: "Prime Brokerage", percentage: 40, apy: 4.2 },
      { type: "Institutional Staking", percentage: 25, apy: 3.8 },
      { type: "Qualified Lending", percentage: 20, apy: 5.8 },
      { type: "Treasury Management", percentage: 15, apy: 3.5 },
    ],
    features: [
      "Institutional grade",
      "Compliance ready",
      "Large minimums",
      "White-glove service",
      "Audit trails",
      "Custody solutions",
    ],
    totalUsers: 847,
    totalLocked: 245000000,
    performance: {
      "1M": 0.38,
      "3M": 1.13,
      "6M": 2.25,
      "1Y": 4.5,
    },
  },
];

// New hook for prebuilt strategies
export function usePrebuiltStrategies() {
  const [strategies] = useState<PrebuiltStrategy[]>(mockPrebuiltStrategies);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const filterStrategies = (
    risk?: RiskEval,
    minAPY?: number,
    minAmount?: number,
  ) => {
    return strategies.filter((strategy) => {
      if (risk && strategy.risk !== risk) return false;
      if (minAPY && strategy.expectedAPY < minAPY) return false;
      if (minAmount && strategy.minAmount > minAmount) return false;
      return true;
    });
  };

  return {
    strategies,
    isLoading,
    error,
    filterStrategies,
  };
}
