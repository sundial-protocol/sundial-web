import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PortfolioCalculations,
  PortfolioData,
} from "@/hooks/dashboard/dashboard";
import { formatAmount, usePrices } from "@/hooks/dashboard/prices";

export default function AssetAllocation({
  portfolioData,
  calculations,
}: {
  portfolioData: PortfolioData;
  calculations: PortfolioCalculations;
}) {
  const { convert } = usePrices();
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>
          Your portfolio distributed across different assets and strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall allocation */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(portfolioData.holdings.BTC, 4)} BTC
            </div>
            <div className="text-sm text-muted-foreground">
              ${formatAmount(calculations.btcValue, 0)} USD
            </div>
            <div className="text-xs text-muted-foreground">
              {portfolioData.holdings.BTC > 0
                ? (
                    (calculations.btcValue / calculations.totalValue) *
                    100
                  ).toFixed(2)
                : 0}
              % of portfolio
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(portfolioData.holdings.ADA || 0, 2)} ADA
            </div>
            <div className="text-sm text-muted-foreground">
              ${formatAmount(calculations.adaValue, 0)} USD
            </div>
            <div className="text-xs text-muted-foreground">
              {calculations.totalValue > 0
                ? (
                    (calculations.adaValue / calculations.totalValue) *
                    100
                  ).toFixed(2)
                : 0}
              % of portfolio
            </div>
          </div>
        </div>

        {/* Individual positions */}
        {portfolioData.staking.BTC.positions.map((position, index) => {
          const positionValueUSD = convert(position.amount || 0, "BTC", "USD");
          const percentage =
            portfolioData.holdings.BTC > 0
              ? (position.amount / portfolioData.holdings.BTC) * 100
              : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{position.type}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {position.risk} Risk
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatAmount(position.amount, 4)} BTC (
                    {percentage.toFixed(2)}
                    %)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${formatAmount(positionValueUSD, 0)} USD
                  </div>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>APY: {position.apy}%</span>
                <span>Lock: {position.lockPeriod}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
