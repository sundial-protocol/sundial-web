"use client";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import QuickActions from "./quick-actions";
import WalletsCard from "./wallets-card";
import EarningsGraph from "./earnings-graph";
import AssetAllocation from "./asset-allocation";

export function PortfolioOverview() {
  const { calculations, isLoading, error, selectedYieldProvider } =
    useDashboardContext();

  if (isLoading)
    return <div className="p-4 text-center">Loading dashboard...</div>;
  if (error)
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <EarningsGraph
          adaValue={calculations.adaValue}
          btcValue={calculations.btcValue}
          provider={selectedYieldProvider}
        />

        {/* Wallet Connection Section */}
        <WalletsCard />

        {/* Updated Portfolio Summary with USD values */}
        {/*<PortfolioSummary
          data={{
            ...portfolioData,
            // Override with USD converted values
            totalValue: calculations.totalValue,
            btcValue: calculations.btcValue,
            adaValue: calculations.adaValue,
          }}
        />*/}
        <div className="hidden md:contents">
          <QuickActions />
        </div>

        <AssetAllocation />
      </div>
    </div>
  );
}
