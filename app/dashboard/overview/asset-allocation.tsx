import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PortfolioData } from "@/hooks/dashboard/dashboard";
import { formatAmount, usePrices } from "@/hooks/dashboard/prices";

export default function AssetAllocation({
  portfolioData,
}: {
  portfolioData: PortfolioData;
}) {
  const { convert } = usePrices();
  const totalValueUSD = portfolioData.totalValue;
  const btcValueUSD = convert(portfolioData.totalBTC, "BTC", "USD");
  const adaValueUSD = convert(portfolioData.totalADA || 0, "ADA", "USD");
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
              {formatAmount(portfolioData.totalBTC, 4)} BTC
            </div>
            <div className="text-sm text-muted-foreground">
              ${formatAmount(btcValueUSD, 0)} USD
            </div>
            <div className="text-xs text-muted-foreground">
              {portfolioData.totalBTC > 0
                ? ((btcValueUSD / totalValueUSD) * 100).toFixed(2)
                : 0}
              % of portfolio
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(portfolioData.totalADA || 0, 2)} ADA
            </div>
            <div className="text-sm text-muted-foreground">
              ${formatAmount(adaValueUSD, 0)} USD
            </div>
            <div className="text-xs text-muted-foreground">
              {totalValueUSD > 0
                ? ((adaValueUSD / totalValueUSD) * 100).toFixed(2)
                : 0}
              % of portfolio
            </div>
          </div>
        </div>

        {/* Individual positions */}
        {portfolioData.positions.map((position, index) => {
          const positionValueUSD = convert(position.value || 0, "BTC", "USD");
          const percentage =
            portfolioData.totalBTC > 0
              ? (position.amount / portfolioData.totalBTC) * 100
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
