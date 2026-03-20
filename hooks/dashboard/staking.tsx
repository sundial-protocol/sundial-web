"use client";

import { useState, useCallback } from "react";
import {
  useTransactions,
  StakingTransaction,
  StakingTxTypes,
} from "./transactions";
import { SupportedChain } from "@/lib/multichain";
import { yieldFromProvider } from "./yield-opportunities";
import { useDashboardData } from "./dashboard";

export interface PortfolioData {
  holdings: {
    BTC: number;
    ADA: number;
  };
  staking: {
    BTC: {
      staked: number;
      yield: number;
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

export interface StakingPosition {
  id: string;
  type: string;
  amount: number;
  apy: number;
  risk: "Zero" | "Low" | "Medium" | "High";
  lockPeriod: string;
  startDate: Date;
}

export function useStakingTransactions() {
  const { addTransaction, updateTransactionStatus, getTransactionsByType } =
    useTransactions();

  const { selectedYieldProvider } = useDashboardData();

  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    holdings: { BTC: 0, ADA: 0 },
    staking: {
      BTC: { staked: 0, yield: 0, positions: [] },
      ADA: { staked: 0, yield: 0, positions: [] },
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Get staking-specific transactions
  const stakingTransactions = getTransactionsByType([
    "deposit",
    "withdraw",
    "stake",
    "unstake",
    "reward",
  ]) as StakingTransaction[];

  const getStakingTransactionsByChain = (chain: SupportedChain) => {
    return stakingTransactions.filter(
      (tx) =>
        tx.chain?.toLowerCase() === chain.toLowerCase() ||
        tx.asset.toLowerCase() === chain.toLowerCase(),
    );
  };

  const addStakingTransaction = useCallback(
    async (
      chain: SupportedChain,
      amount: number,
      type: StakingTxTypes,
      txHash?: string,
    ): Promise<string> => {
      setIsProcessing(true);

      try {
        const txId = addTransaction({
          type,
          asset: chain.toLowerCase(),
          amount,
          status: "pending",
          chain: chain.toLowerCase(),
          details: `${type} ${amount} ${chain.toUpperCase()}`,
          ...(txHash && { txHash }),
        } as Omit<StakingTransaction, "id" | "timestamp">);

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update portfolio data
        updateStakedAmount(
          chain,
          amount,
          type === "deposit" || type === "stake" ? "deposit" : "withdraw",
        );

        // Update transaction status
        updateTransactionStatus(txId, "completed", txHash);

        console.log("Staking transaction completed:", {
          txId,
          chain,
          amount,
          type,
        });

        return txId;
      } catch (error) {
        console.error("Staking transaction failed:", error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [addTransaction, updateTransactionStatus],
  );

  const updateStakedAmount = useCallback(
    (chain: SupportedChain, amount: number, type: "deposit" | "withdraw") => {
      setPortfolioData((prev) => {
        const asset = chain.toUpperCase() as "BTC" | "ADA";
        const multiplier = type === "deposit" ? 1 : -1;
        const amountChange = amount * multiplier;

        const newHoldings = {
          ...prev.holdings,
          [asset]: Math.max(0, prev.holdings[asset] + amountChange),
        };

        const newStaking = {
          ...prev.staking,
          [asset]: {
            ...prev.staking[asset],
            staked: Math.max(0, prev.staking[asset].staked + amountChange),
            yield: yieldFromProvider(
              prev.staking[asset].staked + amountChange,
              selectedYieldProvider,
            ),
          },
        };

        return {
          ...prev,
          holdings: newHoldings,
          staking: newStaking,
        };
      });
    },
    [selectedYieldProvider],
  );

  const getTotalStakedValue = useCallback(
    (priceMap?: Record<string, number>) => {
      const btcPrice = priceMap?.btc || 52000;
      const adaPrice = priceMap?.ada || 0.35;

      return (
        portfolioData.staking.BTC.staked * btcPrice +
        portfolioData.staking.ADA.staked * adaPrice
      );
    },
    [portfolioData.staking],
  );

  const getStakingRewards = useCallback(
    (chain?: SupportedChain) => {
      const rewardTxs = stakingTransactions.filter(
        (tx) =>
          tx.type === "reward" && (!chain || tx.chain === chain.toLowerCase()),
      );

      return rewardTxs.reduce((sum, tx) => sum + tx.amount, 0);
    },
    [stakingTransactions],
  );

  const getStakingHistory = useCallback(
    (chain?: SupportedChain) => {
      return stakingTransactions
        .filter((tx) => !chain || tx.chain === chain.toLowerCase())
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
    },
    [stakingTransactions],
  );

  return {
    // Data
    portfolioData,
    stakingTransactions,
    isProcessing,

    // Actions
    addStakingTransaction,
    updateStakedAmount,

    // Computed values
    getTotalStakedValue,
    getStakingRewards,
    getStakingHistory,
    getStakingTransactionsByChain,

    // State setters (for existing UI compatibility)
    setPortfolioData,
  };
}

// Export individual hooks for backward compatibility
export function useStakingData() {
  return useStakingTransactions();
}
