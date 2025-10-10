"use client";

import { useState } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { SupportedChain, chainConfigs } from "@/lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WithdrawTab() {
  const { portfolioData, updateStakedAmount, isLoading } =
    useDashboardContext();
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("btc");
  const [amount, setAmount] = useState("");

  // Get current staked amount from dashboard data
  const alreadyStaked = portfolioData.totalStaked;
  const currentYield = portfolioData.currentYield;

  const config = chainConfigs[selectedChain];

  const handleAmountChange = (newAmount: string, chain: SupportedChain) => {
    setAmount(newAmount);
    setSelectedChain(chain);
  };

  const handleSuccess = (
    txHash: string,
    chain: SupportedChain,
    amount: string
  ) => {
    // Handle successful withdrawal and update dashboard data
    console.log("Withdrawal successful:", { txHash, chain, amount });

    // Update the staked amount in the dashboard
    updateStakedAmount(chain as SupportedChain, Number(amount), "withdraw");

    // Reset form
    setAmount("");

    // You could also show a success toast here
    // toast.success(`Successfully withdrew ${amount} ${chain.toUpperCase()}`);
  };

  // Calculate new values
  const amountNum = Number(amount) || 0;
  const newTotal = Math.max(0, alreadyStaked - amountNum);
  const newYield =
    newTotal >= 1 ? currentYield : Math.max(0, currentYield - 0.005);

  // Show current staking status
  if (isLoading) {
    return <div className="p-6 text-center">Loading staking data...</div>;
  }

  if (alreadyStaked === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Active Stakes</h2>
        <p className="text-muted-foreground mb-6">
          You don't have any staked assets to withdraw.
        </p>
        <Button asChild>
          <Link href="/dashboard?tab=deposit">Start Staking</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Withdraw Assets</h2>
        <p className="text-muted-foreground">
          Withdraw your staked assets back to your wallet
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Currently Staked:</span>{" "}
            {alreadyStaked} BTC
          </p>
          <p className="text-sm">
            <span className="font-medium">Current Yield:</span>{" "}
            {(currentYield * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Withdraw Form */}
        <StakingForm
          type="withdraw"
          onSuccess={handleSuccess}
          onAmountChange={handleAmountChange}
          defaultChain="btc"
        />

        {/* Right: Staking/Yield Summary */}
        <div className="flex flex-col gap-6">
          <StakingSummaryCard
            alreadyStaked={alreadyStaked}
            amount={amountNum}
            symbol={config.symbol}
            currentYield={currentYield}
            newYield={newYield}
            type="withdraw"
          />
        </div>
      </div>
    </div>
  );
}
