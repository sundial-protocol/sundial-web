"use client";

import { useState } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { SupportedChain, chainConfigs } from "../../../lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { usePrices } from "@/hooks/dashboard/prices";
import { YieldOpportunityCard } from "@/components/yield-opportunity-card";
import { yieldFromProvider } from "@/hooks/dashboard/yield-opportunities";

export default function DepositTab() {
  const { calculations, isLoading, selectedYieldProvider } =
    useDashboardContext();
  const { convert } = usePrices();
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("btc");
  const [amount, setAmount] = useState("");
  const config = chainConfigs[selectedChain];

  const alreadyStaked = convert(
    config.symbol === "BTC" ? calculations.btcValue : calculations.adaValue,
    "USD",
    config.symbol,
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
    amount: string,
  ) => {
    console.log("Deposit successful:", { txHash, chain, amount });

    // Reset form
    setAmount("");
  };

  // Calculate new values for withdrawals
  const amountNum = Number(amount) || 0;
  const newTotal = Math.max(alreadyStaked + amountNum, 0);

  // Convert newTotal to USD before getting yield
  const newYieldUSD = yieldFromProvider(
    convert(newTotal, config.symbol, "USD") ?? 0,
    selectedYieldProvider,
    true,
  );
  // Then convert back
  const newYield = convert(newYieldUSD, "USD", config.symbol);

  if (isLoading) {
    return <div className="p-6 text-center">Loading staking data...</div>;
  }

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
          defaultChain="btc_testnet"
        />

        <div className="grid grid-cols-1 gap-6">
          {selectedYieldProvider && (
            <YieldOpportunityCard
              opportunity={selectedYieldProvider}
              buttonText="Selected Strategy"
              onButtonClick={() => {
                // Optional: Navigate to yield catalog or show selection modal
                console.log("Navigate to yield provider selection");
              }}
              buttonVariant="secondary"
            />
          )}

          <StakingSummaryCard
            alreadyStaked={alreadyStaked}
            amount={amountNum}
            symbol={config.symbol}
            newTotal={newTotal}
            currentYield={currentYield}
            newYield={newYield}
            type="deposit"
          />
        </div>
      </div>
    </div>
  );
}
