"use client";

import { useState } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { Chain, chainConfigs } from "./types";

export default function DepositTab() {
  const [selectedChain, setSelectedChain] = useState<Chain>("btc");
  const [amount, setAmount] = useState("");

  // Mocked user staking info for demonstration
  const [alreadyStaked, setAlreadyStaked] = useState(0.25);
  const [currentYield, setCurrentYield] = useState(0.085);

  const config = chainConfigs[selectedChain];

  const handleAmountChange = (newAmount: string, chain: Chain) => {
    setAmount(newAmount);
    setSelectedChain(chain);
  };

  const handleSuccess = (txHash: string, chain: Chain, amount: string) => {
    // Handle successful deposit
    console.log("Deposit successful:", { txHash, chain, amount });
    // You could update the staked amount here
    setAlreadyStaked((prev) => prev + Number(amount));
  };

  // Calculate new values
  const amountNum = Number(amount) || 0;
  const newTotal = alreadyStaked + amountNum;
  const newYield = newTotal >= 1 ? currentYield + 0.005 : currentYield;

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Deposit Assets</h2>
        <p className="text-muted-foreground">
          Choose a blockchain and deposit assets to start earning yield
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Deposit Form */}
        <StakingForm
          type="deposit"
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
            type="deposit"
          />
        </div>
      </div>
    </div>
  );
}
