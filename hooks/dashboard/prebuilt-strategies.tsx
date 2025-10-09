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
  // Your existing mockYieldStrategies data goes here
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
