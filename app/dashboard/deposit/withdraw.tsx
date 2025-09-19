"use client";

import { useState } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { Chain, chainConfigs } from "./types";

export default function WithdrawTab() {
  const [selectedChain, setSelectedChain] = useState<Chain>("btc");
  const [amount, setAmount] = useState("");

  // Mocked user staking info for demonstration
  const [alreadyStaked, setAlreadyStaked] = useState(2.5);
  const [currentYield, setCurrentYield] = useState(0.085);

  const config = chainConfigs[selectedChain];

  const handleAmountChange = (newAmount: string, chain: Chain) => {
    setAmount(newAmount);
    setSelectedChain(chain);
  };

  const handleSuccess = (txHash: string, chain: Chain, amount: string) => {
    // Handle successful withdrawal
    console.log("Withdrawal successful:", { txHash, chain, amount });
    // Update the staked amount
    setAlreadyStaked((prev) => Math.max(0, prev - Number(amount)));
  };

  // Calculate new values
  const amountNum = Number(amount) || 0;
  const newTotal = Math.max(0, alreadyStaked - amountNum);
  const newYield =
    newTotal >= 1 ? currentYield : Math.max(0, currentYield - 0.005);

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Withdraw Assets</h2>
        <p className="text-muted-foreground">
          Withdraw your staked assets back to your wallet
        </p>
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
