import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import usePrices, { formatAmount } from "@/hooks/dashboard/prices";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { useGetLoans } from "@/hooks/dashboard/get-loans";
import {
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PortfolioActivityCard() {
  const { portfolioData } = useDashboardContext();
  const { convert } = usePrices();
  const { lendingHistory } = useGetLoans();

  const totalPortfolioValue =
    convert(portfolioData.holdings.BTC || 0, "BTC", "USD") +
    convert(portfolioData.holdings.ADA || 0, "ADA", "USD");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "liquidated":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3" />;
      case "paid":
        return <CheckCircle className="h-3 w-3" />;
      case "overdue":
        return <XCircle className="h-3 w-3" />;
      case "liquidated":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <Card className="lg:row-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio & Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Portfolio Overview
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">
                ${formatAmount(totalPortfolioValue, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">$0</div>
              <div className="text-xs text-muted-foreground">Active Loans</div>
            </div>
          </div>

          {/* Asset Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bitcoin</span>
              <span className="font-medium">
                {formatAmount(portfolioData.holdings.BTC || 0, 4)} BTC
                <span className="text-muted-foreground ml-1 text-xs">
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
                <span className="text-muted-foreground ml-1 text-xs">
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
        </div>

        {/* Divider */}
        <hr className="border-muted" />

        {/* Recent Activity Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Activity className="h-4 w-4" />
            Recent Activity
          </div>

          {lendingHistory.length > 0 ? (
            <>
              <div className="space-y-3">
                {lendingHistory.slice(0, 3).map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(loan.status)}
                      <div>
                        <div className="text-sm font-medium">
                          ${formatAmount(loan.amount, 0)} {loan.asset}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {loan.startDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(loan.status)} text-xs`}>
                      {loan.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {lendingHistory.length > 3 && (
                <Button variant="outline" size="sm" className="w-full">
                  View All History
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground bg-gray-50 rounded-lg">
              No lending history yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
