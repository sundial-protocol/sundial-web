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
    expectedAPY: 7.2,
    minAmount: 1000,
    timeHorizon: "6+ months",
    popularity: 85,
    allocation: [
      { type: "Liquid Staking (stETH)", percentage: 45, apy: 6.8 },
      { type: "USDC Lending (Aave)", percentage: 35, apy: 7.5 },
      { type: "Government Bond Tokens", percentage: 20, apy: 7.8 },
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
      "1M": 0.62,
      "3M": 1.85,
      "6M": 3.71,
      "1Y": 7.34,
    },
  },
  {
    id: 2,
    name: "Balanced Growth",
    description:
      "Diversified approach balancing stable yields with moderate growth opportunities",
    risk: "Medium",
    expectedAPY: 12.8,
    minAmount: 2500,
    timeHorizon: "3-12 months",
    popularity: 92,
    allocation: [
      { type: "DeFi Blue Chips", percentage: 40, apy: 15.2 },
      { type: "Liquid Staking", percentage: 25, apy: 6.8 },
      { type: "Yield Farming (Curve)", percentage: 20, apy: 18.5 },
      { type: "Stablecoin Lending", percentage: 15, apy: 8.1 },
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
      "1M": 1.08,
      "3M": 3.42,
      "6M": 6.95,
      "1Y": 13.21,
    },
  },
  {
    id: 3,
    name: "DeFi Alpha Hunter",
    description:
      "Aggressive strategy targeting high-yield opportunities in emerging DeFi protocols",
    risk: "High",
    expectedAPY: 24.5,
    minAmount: 5000,
    timeHorizon: "1-6 months",
    popularity: 67,
    allocation: [
      { type: "New Protocol Farming", percentage: 35, apy: 45.8 },
      { type: "Leverage Yield Farming", percentage: 25, apy: 28.2 },
      { type: "Liquidity Provision", percentage: 25, apy: 19.5 },
      { type: "Hedge Positions", percentage: 15, apy: 5.2 },
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
      "1M": 2.15,
      "3M": 6.87,
      "6M": 11.92,
      "1Y": 26.43,
    },
  },
  {
    id: 4,
    name: "Bitcoin Maximalist",
    description:
      "Bitcoin-focused strategy using wrapped BTC for yield while maintaining BTC exposure",
    risk: "Medium",
    expectedAPY: 9.8,
    minAmount: 10000,
    timeHorizon: "12+ months",
    popularity: 73,
    allocation: [
      { type: "Wrapped BTC Lending", percentage: 50, apy: 8.5 },
      { type: "Lightning Network", percentage: 20, apy: 12.8 },
      { type: "BTC Mining Tokens", percentage: 20, apy: 11.2 },
      { type: "BTC Options Strategies", percentage: 10, apy: 15.5 },
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
      "1M": 0.82,
      "3M": 2.47,
      "6M": 4.91,
      "1Y": 9.63,
    },
  },
  {
    id: 5,
    name: "Stablecoin Fortress",
    description:
      "Ultra-safe strategy focused entirely on USD-pegged stablecoins with minimal risk",
    risk: "Low",
    expectedAPY: 5.8,
    minAmount: 500,
    timeHorizon: "1+ months",
    popularity: 78,
    allocation: [
      { type: "USDC (Coinbase)", percentage: 40, apy: 5.2 },
      { type: "USDT Lending", percentage: 30, apy: 6.1 },
      { type: "DAI Savings Rate", percentage: 20, apy: 6.5 },
      { type: "Treasury Bills (RWA)", percentage: 10, apy: 5.8 },
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
      "1M": 0.48,
      "3M": 1.45,
      "6M": 2.89,
      "1Y": 5.76,
    },
  },
  {
    id: 6,
    name: "Ethereum Ecosystem",
    description:
      "Diversified ETH strategy leveraging the full Ethereum ecosystem for maximum yield",
    risk: "Medium",
    expectedAPY: 16.4,
    minAmount: 3000,
    timeHorizon: "6-18 months",
    popularity: 81,
    allocation: [
      { type: "ETH 2.0 Staking", percentage: 35, apy: 6.8 },
      { type: "DeFi Protocols (ETH)", percentage: 30, apy: 22.5 },
      { type: "Layer 2 Farming", percentage: 20, apy: 28.1 },
      { type: "ETH Lending", percentage: 15, apy: 8.9 },
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
      "1M": 1.35,
      "3M": 4.12,
      "6M": 8.47,
      "1Y": 17.23,
    },
  },
  {
    id: 7,
    name: "Real World Assets",
    description:
      "Bridge traditional finance with DeFi through tokenized real-world assets",
    risk: "Low",
    expectedAPY: 10.3,
    minAmount: 2000,
    timeHorizon: "6-24 months",
    popularity: 64,
    allocation: [
      { type: "Tokenized Treasuries", percentage: 40, apy: 5.8 },
      { type: "Real Estate Tokens", percentage: 25, apy: 12.5 },
      { type: "Corporate Bonds", percentage: 20, apy: 8.9 },
      { type: "Commodities (Gold)", percentage: 15, apy: 18.2 },
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
      "1M": 0.86,
      "3M": 2.58,
      "6M": 5.21,
      "1Y": 10.45,
    },
  },
  {
    id: 8,
    name: "Arbitrage Specialist",
    description:
      "Advanced strategy exploiting price differences across exchanges and protocols",
    risk: "Medium",
    expectedAPY: 18.7,
    minAmount: 7500,
    timeHorizon: "3-9 months",
    popularity: 45,
    allocation: [
      { type: "Cross-Chain Arbitrage", percentage: 35, apy: 25.2 },
      { type: "DEX Arbitrage", percentage: 30, apy: 18.9 },
      { type: "Funding Rate Arbitrage", percentage: 20, apy: 15.5 },
      { type: "Stablecoin Arbitrage", percentage: 15, apy: 12.1 },
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
      "1M": 1.58,
      "3M": 4.72,
      "6M": 9.35,
      "1Y": 19.24,
    },
  },
  {
    id: 9,
    name: "Multi-Chain Explorer",
    description:
      "Diversified across multiple blockchains to capture the best opportunities",
    risk: "High",
    expectedAPY: 21.2,
    minAmount: 4000,
    timeHorizon: "3-12 months",
    popularity: 69,
    allocation: [
      { type: "Solana Ecosystem", percentage: 25, apy: 28.5 },
      { type: "Polygon DeFi", percentage: 25, apy: 19.8 },
      { type: "Avalanche Farms", percentage: 20, apy: 24.1 },
      { type: "Ethereum Base", percentage: 15, apy: 16.2 },
      { type: "Binance Smart Chain", percentage: 15, apy: 22.7 },
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
      "1M": 1.82,
      "3M": 5.34,
      "6M": 10.78,
      "1Y": 22.15,
    },
  },
  {
    id: 10,
    name: "Institutional Grade",
    description:
      "Enterprise-level strategy designed for large allocations with institutional controls",
    risk: "Low",
    expectedAPY: 11.5,
    minAmount: 50000,
    timeHorizon: "12+ months",
    popularity: 38,
    allocation: [
      { type: "Prime Brokerage", percentage: 40, apy: 9.2 },
      { type: "Institutional Staking", percentage: 25, apy: 7.8 },
      { type: "Qualified Lending", percentage: 20, apy: 15.8 },
      { type: "Treasury Management", percentage: 15, apy: 6.5 },
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
      "1M": 0.96,
      "3M": 2.89,
      "6M": 5.73,
      "1Y": 11.67,
    },
  },
];

// New hook for prebuilt strategies
export function usePrebuiltStrategies() {
  const [strategies, setStrategies] = useState<PrebuiltStrategy[]>(
    mockPrebuiltStrategies
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterStrategies = (
    risk?: RiskEval,
    minAPY?: number,
    minAmount?: number
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
