import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/hooks/dashboard/dashboard";
import { usePrices, formatAmount } from "@/hooks/dashboard/prices";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

export default function AssetAllocation() {
  const { convert } = usePrices();
  const { portfolioData } = useDashboardContext();

  // Calculate staked vs unstaked for BTC
  const totalBTC = portfolioData.holdings.BTC || 0;
  const stakedBTC = portfolioData.staking.BTC.staked || 0;
  const unstakedBTC = Math.max(0, totalBTC - stakedBTC);

  // Calculate staked vs unstaked for ADA
  const totalADA = portfolioData.holdings.ADA || 0;
  const stakedADA = portfolioData.staking.ADA.staked || 0;
  const unstakedADA = Math.max(0, totalADA - stakedADA);

  // Calculate total portfolio values
  const totalPortfolioValue =
    convert(totalBTC, "BTC", "USD") + convert(totalADA, "ADA", "USD");

  const allocations = [
    // BTC Staked
    {
      name: "Bitcoin Staked",
      amount: stakedBTC,
      symbol: "BTC",
      type: "staked",
      value: convert(stakedBTC, "BTC", "USD"),
      percentage:
        totalPortfolioValue > 0
          ? (convert(stakedBTC, "BTC", "USD") / totalPortfolioValue) * 100
          : 0,
      apy: portfolioData.staking.BTC.yield || 7.2,
      risk: "Low",
      color: "bg-orange-500",
    },
    // BTC Unstaked
    {
      name: "Bitcoin Holdings",
      amount: unstakedBTC,
      symbol: "BTC",
      type: "unstaked",
      value: convert(unstakedBTC, "BTC", "USD"),
      percentage:
        totalPortfolioValue > 0
          ? (convert(unstakedBTC, "BTC", "USD") / totalPortfolioValue) * 100
          : 0,
      apy: 0,
      risk: "None",
      color: "bg-orange-300",
    },
    // ADA Staked
    {
      name: "Other Staked Assets",
      amount: stakedADA,
      symbol: "ADA",
      type: "staked",
      value: convert(stakedADA, "ADA", "USD"),
      percentage:
        totalPortfolioValue > 0
          ? (convert(stakedADA, "ADA", "USD") / totalPortfolioValue) * 100
          : 0,
      apy: portfolioData.staking.ADA.yield || 5.5,
      risk: "Low",
      color: "bg-blue-500",
    },
    // ADA Unstaked
    {
      name: "Other Holdings",
      amount: unstakedADA,
      symbol: "ADA",
      type: "unstaked",
      value: convert(unstakedADA, "ADA", "USD"),
      percentage:
        totalPortfolioValue > 0
          ? (convert(unstakedADA, "ADA", "USD") / totalPortfolioValue) * 100
          : 0,
      apy: 0,
      risk: "None",
      color: "bg-blue-300",
    },
  ].filter((allocation) => allocation.amount > 0); // Only show non-zero allocations

  return (
    <Card className="col-span-5 sm:col-span-3">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>
          Your portfolio distributed between staked (earning yield) and unstaked
          holdings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 border-b rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(totalBTC, 4)} BTC
            </div>
            <div className="text-sm text-muted-foreground">
              ${formatAmount(convert(totalBTC, "BTC", "USD"), 0)} USD
            </div>
            <div className="text-xs text-green-600">
              {formatAmount(stakedBTC, 4)} staked
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${formatAmount(convert(totalADA, "ADA", "USD"), 0)} USD
            </div>
            <div className="text-sm text-muted-foreground">other assets</div>
            <div className="text-xs text-green-600">
              {formatAmount(stakedADA, 2)} staked
            </div>
          </div>
        </div>

        {/* Individual allocations */}
        {allocations.map((allocation, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${allocation.color}`}></div>
                <span className="font-medium">{allocation.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    allocation.type === "staked"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {allocation.type === "staked" ? "Earning" : "Idle"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatAmount(
                    allocation.amount,
                    allocation.symbol === "BTC" ? 4 : 2,
                  )}{" "}
                  {allocation.symbol}({allocation.percentage.toFixed(1)}%)
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(allocation.value)}
                </div>
              </div>
            </div>
            <Progress value={allocation.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {allocation.type === "staked"
                  ? `APY: ${allocation.apy}%`
                  : "No yield"}
              </span>
              <span>
                {allocation.type === "staked"
                  ? `${allocation.risk} Risk`
                  : "Available to stake"}
              </span>
            </div>
          </div>
        ))}

        {/* Show message if no allocations */}
        {allocations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No assets in your portfolio yet.</p>
            <p className="text-sm">
              Make your first deposit to see your allocation here.
            </p>
          </div>
        )}

        {/* Portfolio summary */}
        {allocations.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-green-600">
                  $
                  {formatAmount(
                    allocations
                      .filter((a) => a.type === "staked")
                      .reduce((sum, a) => sum + a.value, 0),
                    0,
                  )}
                </div>
                <div className="text-muted-foreground">Earning Yield</div>
              </div>
              <div>
                <div className="font-semibold text-gray-600">
                  $
                  {formatAmount(
                    allocations
                      .filter((a) => a.type === "unstaked")
                      .reduce((sum, a) => sum + a.value, 0),
                    0,
                  )}
                </div>
                <div className="text-muted-foreground">Idle Holdings</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  ${formatAmount(totalPortfolioValue, 0)}
                </div>
                <div className="text-muted-foreground">Total Value</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
