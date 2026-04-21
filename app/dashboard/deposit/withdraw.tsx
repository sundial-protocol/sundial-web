"use client";

import { useState } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { SupportedChain, chainConfigs } from "@/lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { yieldFromProvider } from "@/hooks/dashboard/yield-opportunities";
import { usePrices } from "@/hooks/dashboard/prices";

export default function WithdrawTab() {
  const { portfolioData, calculations, isLoading, selectedYieldProvider } =
    useDashboardContext();
  const { convert } = usePrices();
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("btc");
  const [amount, setAmount] = useState("");
  const config = chainConfigs[selectedChain];

  // Use staked amounts for withdrawal calculations
  // For BTC, sum both mainnet and testnet staked amounts since they're both BTC
  const alreadyStaked =
    config.symbol === "BTC"
      ? portfolioData?.staking?.BTC?.staked || 0
      : portfolioData?.staking?.ADA?.staked || 0;

  console.log(`Already staked (${config.symbol}):`, alreadyStaked);

  const currentYield =
    convert(calculations.monthlyRewards.total, "USD", config.symbol) || 0;

  const handleAmountChange = (newAmount: string, chain: SupportedChain) => {
    setAmount(newAmount);
    setSelectedChain(chain);
  };

  const handleSuccess = (
    txHash: string,
    chain: SupportedChain,
    amount: string,
  ) => {
    console.log("Withdraw successful:", { txHash, chain, amount });

    // Reset form
    setAmount("");
  };

  // Calculate new values for withdrawals
  const amountNum = Number(amount) || 0;
  const newTotal = Math.max(alreadyStaked - amountNum, 0);

  // Convert newTotal to USD before getting yield
  const newYieldUSD = yieldFromProvider(
    convert(newTotal, config.symbol, "USD") ?? 0,
    selectedYieldProvider,
  );
  // Then convert back
  const newYield = convert(newYieldUSD, "USD", config.symbol);

  if (isLoading) {
    return <div className="p-6 text-center">Loading staking data...</div>;
  }

  //if (true) {
  //  // TODO: Check if there are any unlocked stakes available for withdrawal. If not, show this message instead of the form.
  //  return (
  //    <div className="p-6 text-center">
  //      <h2 className="text-2xl font-bold mb-4">No Unlocked Stakes</h2>
  //      <p className="text-muted-foreground mb-6">
  //        Once your stake has passed its lock period, you'll be able to withdraw
  //        your rewards here.
  //      </p>
  //      <Button asChild>
  //        <Link href="/dashboard?tab=stake">Keep Staking</Link>
  //      </Button>
  //    </div>
  //  );
  //}

  return (
    <div className="mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Withdraw Form */}
        <StakingForm
          type="withdraw"
          onSuccess={handleSuccess}
          onAmountChange={handleAmountChange}
          defaultChain="btc_testnet"
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
