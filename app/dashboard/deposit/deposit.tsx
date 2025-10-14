"use client";

import { useState } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { SupportedChain, chainConfigs } from "../../../lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

export default function DepositTab() {
  const { calculations, updateStakedAmount } = useDashboardContext();
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("btc");
  const [amount, setAmount] = useState("");

  const alreadyStaked = calculations.totalStakedValue;
  const currentYield = calculations.monthlyRewards.total();
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
    console.log("Deposit successful:", { txHash, chain, amount });

    // Update the staked amount in the dashboard
    updateStakedAmount(chain as "btc" | "ada", Number(amount), "deposit");

    // Reset form
    setAmount("");
  };

  // Calculate new values for deposits
  const amountNum = Number(amount) || 0;
  const newTotal = alreadyStaked + amountNum;
  const newYield =
    newTotal >= 1 ? Math.min(currentYield + 0.001, 0.12) : currentYield; // Cap at 12%

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Stake Assets</h2>
        <p className="text-muted-foreground">Stake your assets to earn yield</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StakingForm
          type="deposit"
          onSuccess={handleSuccess}
          onAmountChange={handleAmountChange}
          defaultChain="btc"
        />

        <div className="flex flex-col gap-6">
          <StakingSummaryCard
            alreadyStaked={alreadyStaked}
            amount={amountNum}
            symbol={config.symbol}
            currentYield={currentYield}
            newYield={newYield}
            type="deposit"
          />
        </div>
      </div>
    </div>
  );
}
