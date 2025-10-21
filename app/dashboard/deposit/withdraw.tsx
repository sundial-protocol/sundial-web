"use client";

import { useState } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { SupportedChain, chainConfigs } from "@/lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getYield } from "@/hooks/dashboard/get-yield";
import { usePrices } from "@/hooks/dashboard/prices";

export default function WithdrawTab() {
  const { calculations, updateStakedAmount, isLoading } = useDashboardContext();
  const { convert } = usePrices();
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("btc");
  const [amount, setAmount] = useState("");
  const config = chainConfigs[selectedChain];

  const alreadyStaked = convert(
    config.symbol === "BTC" ? calculations.btcValue : calculations.adaValue,
    "USD",
    config.symbol
  );
  const currentYield =
    convert(calculations.monthlyRewards.total, "USD", config.symbol) || 0;

  const handleAmountChange = (newAmount: string, chain: SupportedChain) => {
    setAmount(newAmount);
    setSelectedChain(chain);
  };

  const handleSuccess = (
    txHash: string,
    chain: SupportedChain,
    amount: string
  ) => {
    console.log("Withdraw successful:", { txHash, chain, amount });

    // Reset form
    setAmount("");
  };

  // Calculate new values for withdrawals
  const amountNum = Number(amount) || 0;
  const newTotal = Math.max(alreadyStaked - amountNum, 0);

  // Convert newTotal to USD before passing to getYield
  const newYieldUSD = getYield(convert(newTotal, config.symbol, "USD")) ?? 0;
  // Then convert back
  const newYield = convert(newYieldUSD, "USD", config.symbol);

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
            newTotal={newTotal}
            currentYield={currentYield}
            newYield={newYield}
            type="withdraw"
          />
        </div>
      </div>
    </div>
  );
}
