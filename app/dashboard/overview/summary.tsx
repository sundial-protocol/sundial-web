import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatPercentage,
  PortfolioData,
} from "@/hooks/dashboard/dashboard";
import {
  Bitcoin,
  DollarSign,
  Shield,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function PortfolioSummary(props: { data: PortfolioData }) {
  const isPositive = props.data.dailyChange > 0;
  const isNegative = props.data.dailyChange < 0;

  return (
    <div className="col-span-2 grid gap-4 grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(props.data.totalValue)}
          </div>
          <div
            className={`flex items-center text-xs ${
              isPositive
                ? "text-green-600"
                : isNegative
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {formatPercentage(props.data.dailyChangePercent)} (
            {formatCurrency(props.data.dailyChange)})
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bitcoin</CardTitle>
          <Bitcoin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{props.data.totalBTC} BTC</div>
          <p className="text-xs text-muted-foreground">
            {props.data.totalStaked} BTC staked
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Rewards</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(props.data.monthlyRewards)}
          </div>
          <p className="text-xs text-muted-foreground">
            From staking & lending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Low</div>
          <p className="text-xs text-muted-foreground">
            Conservative allocation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
