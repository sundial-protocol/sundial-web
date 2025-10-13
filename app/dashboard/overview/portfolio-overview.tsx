"use client";
import { useState } from "react";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { usePrices } from "@/hooks/dashboard/prices";
import PortfolioSummary from "./summary";
import QuickActions from "./quick-actions";
import AssetAllocation from "./asset-allocation";
import WalletsCard from "./wallets-card";
import EarningsGraph from "./earnings-graph";

export function PortfolioOverview() {
  const { portfolioData, earningsData, isLoading, error } =
    useDashboardContext();
  const [btcWallet, setBtcWallet] = useState<string | null>(null);

  // Use the prices hook for conversions
  const { convert, prices } = usePrices();

  // Calculate USD values using the prices hook
  const btcValueUSD = convert(portfolioData.totalBTC, "BTC", "USD");
  const adaValueUSD = convert(portfolioData.totalADA || 0, "ADA", "USD");
  const totalValueUSD = btcValueUSD + adaValueUSD;
  const monthlyRewardsUSD = convert(
    portfolioData.monthlyRewards || 0,
    "BTC",
    "USD"
  );

  if (isLoading)
    return <div className="p-4 text-center">Loading dashboard...</div>;
  if (error)
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <EarningsGraph earningsData={earningsData} />

        {/* Wallet Connection Section */}
        <WalletsCard btcWallet={btcWallet} setBtcWallet={setBtcWallet} />

        {/* Updated Portfolio Summary with USD values */}
        <PortfolioSummary
          data={{
            ...portfolioData,
            // Override with USD converted values
            totalValue: totalValueUSD,
            btcValue: btcValueUSD,
            adaValue: adaValueUSD,
            monthlyRewards: monthlyRewardsUSD,
          }}
        />

        <AssetAllocation portfolioData={portfolioData} />
      </div>

      <QuickActions />
    </div>
  );
}
