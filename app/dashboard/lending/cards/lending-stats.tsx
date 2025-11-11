"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, RefreshCw } from "lucide-react";
import { formatAmount } from "@/hooks/dashboard/prices";
import { useLendingStats } from "@/hooks/dashboard/lending";
import { Button } from "@/components/ui/button";

export default function LendingStatsCard() {
  const { stats, refreshData } = useLendingStats();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lending Stats
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold">
              ${formatAmount(stats.totalBorrowed, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Borrowed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold">
              ${formatAmount(stats.totalInterestPaid, 2)}
            </div>
            <div className="text-xs text-muted-foreground">Interest Paid</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Payment Success Rate
            </span>
            <span className="text-sm font-medium text-green-600">
              {stats.paymentSuccessRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={stats.paymentSuccessRate} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.successfulLoans} successful</span>
            <span>{stats.totalLoans} total loans</span>
          </div>
        </div>

        <div className="space-y-2 text-xs border-t pt-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Loans:</span>
            <span className="font-medium">{stats.activeLoanCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed Loans:</span>
            <span className="font-medium">{stats.successfulLoans}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
