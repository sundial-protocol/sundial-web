import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/hooks/dashboard/dashboard";
import { usePrices } from "@/hooks/dashboard/prices";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

export default function AssetAllocation() {
  const { convert } = usePrices();
  const { portfolioData } = useDashboardContext();
  const positions = [
    ...portfolioData.staking.BTC.positions,
    ...portfolioData.staking.ADA.positions,
  ];
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>
          Your Bitcoin is distributed across different yield strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {positions.map((position, index) => {
          const percentage =
            (position.amount / portfolioData.holdings.BTC) * 100;
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
                    {position.amount} BTC ({percentage.toFixed(1)}%)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(convert(position.amount, "BTC", "USD"))}
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
