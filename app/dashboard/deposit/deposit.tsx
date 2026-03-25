"use client";

import { useState, useEffect } from "react";
import StakingForm from "./staking-form";
import StakingSummaryCard from "./staking-summary";
import { SupportedChain, chainConfigs } from "../../../lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { usePrices } from "@/hooks/dashboard/prices";
import { YieldOpportunityCard } from "@/components/yield-opportunity-card";
import { useYieldOpportunities } from "@/hooks/dashboard/yield-opportunities";
import { yieldFromProvider } from "@/hooks/dashboard/yield-opportunities";
import { DepositIntentSuccessResponse } from "@/app/api/deposit-intent/types";

export default function DepositTab() {
  const {
    calculations,
    isLoading,
    selectedYieldProvider,
    setSelectedYieldProvider,
  } = useDashboardContext();
  const { convert } = usePrices();
  const { opportunities } = useYieldOpportunities();
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("btc");
  const [amount, setAmount] = useState("");
  const [depositIntentId, setDepositIntentId] = useState<string | null>(null);
  const config = chainConfigs[selectedChain];

  // Set default yield provider if none selected
  useEffect(() => {
    if (!selectedYieldProvider && opportunities.length > 0) {
      setSelectedYieldProvider(opportunities[0]);
    }
  }, [selectedYieldProvider, opportunities, setSelectedYieldProvider]);

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
    chain: SupportedChain,
    amount: string,
    userPubKey?: string,
    sourceAddress?: string,
  ) => {
    if (
      userPubKey &&
      selectedYieldProvider?.provider_id &&
      selectedYieldProvider?.program_id
    ) {
      const lockMs =
        selectedYieldProvider!.locktime != null
          ? selectedYieldProvider!.locktime * 1000
          : 1000 * 60 * 5;

      fetch("/api/deposit-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_beneficiary_address: sourceAddress,
          user_pubkey_hex: userPubKey,
          provider_id: selectedYieldProvider!.provider_id,
          program_id: selectedYieldProvider!.program_id,
          amount_sats: Math.round(Number(amount) * 1e8),
          alpha_bps: 2500, // 25 % escrow allocation
          lock_ms: lockMs,
        }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
        .then((intent: DepositIntentSuccessResponse) => {
          setDepositIntentId(intent.deposit_id);
          console.log("Deposit intent registered:", intent.deposit_id);
        })
        .catch((err) => {
          // Non-fatal: the user can still sign & broadcast without a backend intent
          console.warn("Deposit intent registration failed (non-fatal):", err);
        });
    }

    console.log("Deposit successful:", { chain, amount });

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
          defaultChain="btc"
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
