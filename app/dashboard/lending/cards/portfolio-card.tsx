import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import usePrices, { formatAmount } from "@/hooks/dashboard/prices";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { DollarSign } from "lucide-react";

export default function PortfolioCard() {
  const { portfolioData } = useDashboardContext();
  const { convert } = usePrices();

  const totalPortfolioValue =
    convert(portfolioData.holdings.BTC || 0, "BTC", "USD") +
    convert(portfolioData.holdings.ADA || 0, "ADA", "USD");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold">
              ${formatAmount(totalPortfolioValue, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold">$0</div>
            <div className="text-xs text-muted-foreground">Active Loan</div>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bitcoin</span>
            <span className="font-medium">
              {formatAmount(portfolioData.holdings.BTC || 0, 4)} BTC
              <span className="text-muted-foreground ml-1">
                ($
                {formatAmount(
                  convert(portfolioData.holdings.BTC || 0, "BTC", "USD"),
                  0
                )}
                )
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cardano</span>
            <span className="font-medium">
              {formatAmount(portfolioData.holdings.ADA || 0, 0)} ADA
              <span className="text-muted-foreground ml-1">
                ($
                {formatAmount(
                  convert(portfolioData.holdings.ADA || 0, "ADA", "USD"),
                  0
                )}
                )
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}