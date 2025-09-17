"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import StakingSummaryCard from "./staking-summary";

// --- Reusable WithdrawForm ---
function WithdrawForm({
  chain,
  setChain,
  amount,
  setAmount,
  alreadyStaked,
  symbol,
}: {
  chain: "btc" | "ada";
  setChain: (c: "btc" | "ada") => void;
  amount: string;
  setAmount: (a: string) => void;
  alreadyStaked: number;
  symbol: string;
}) {
  return (
    <form className="space-y-6">
      <div>
        <label className="block font-medium mb-1">Blockchain</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={chain}
          onChange={(e) => setChain(e.target.value as "btc" | "ada")}
        >
          <option value="btc">Bitcoin</option>
          <option value="ada">Cardano</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">
          Amount to Withdraw ({symbol})
        </label>
        <input
          type="number"
          step="0.00000001"
          min="0"
          max={alreadyStaked}
          className="w-full border rounded px-2 py-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        disabled={Number(amount) <= 0 || Number(amount) > alreadyStaked}
      >
        Withdraw
      </button>
    </form>
  );
}

// --- Main Page ---
export default function WithdrawTab() {
  // Mocked user staking info for demonstration
  const [alreadyStaked, setAlreadyStaked] = useState(0.25); // BTC or ADA, depending on chain
  const [currentYield, setCurrentYield] = useState(0.085); // 8.5% APY for BTC, for example
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState<"btc" | "ada">("btc");

  // Calculate new values
  const amountNum = Number(amount) || 0;
  const newTotal = Math.max(alreadyStaked - amountNum, 0);
  // For demo: yield decreases by 0.5% if total staked drops below 1 BTC/1000 ADA
  const newYield =
    newTotal < 1 ? Math.max(currentYield - 0.005, 0) : currentYield;

  // Mock config
  const config = {
    symbol: chain === "btc" ? "BTC" : "ADA",
  };

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Withdraw Assets</h2>
        <p className="text-muted-foreground">
          Choose a blockchain and withdraw assets from your staked portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Withdraw Form */}
        <Card>
          <CardHeader>
            <CardTitle>Withdraw from Portfolio</CardTitle>
            <CardDescription>
              Select your blockchain and withdraw assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WithdrawForm
              chain={chain}
              setChain={setChain}
              amount={amount}
              setAmount={setAmount}
              alreadyStaked={alreadyStaked}
              symbol={config.symbol}
            />
          </CardContent>
        </Card>

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
