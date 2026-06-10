"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  RefreshCw,
  CreditCard,
  DollarSign,
  CheckCircle,
  Activity,
} from "lucide-react";
import { formatAmount } from "@/hooks/dashboard/prices";
// UPDATED: Use dashboard context instead of lending stats hook
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export default function LendingStatsCard() {
  const { getLendingTransactions, refreshData } = useDashboardContext();

  const stats = useMemo(() => {
    const lendingTxs = getLendingTransactions();

    // Get loan creation transactions
    const loanCreations = lendingTxs.filter(
      (tx) => tx.type === "loan_created" && tx.status === "completed",
    );

    // Get payment transactions
    const loanPayments = lendingTxs.filter(
      (tx) => tx.type === "loan_payment" && tx.status === "completed",
    );

    // Get all failed transactions
    const failedTransactions = lendingTxs.filter(
      (tx) => tx.status === "failed",
    );

    // Calculate total borrowed amount
    const totalBorrowed = loanCreations.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate total interest paid (approximate from payment amounts)
    const totalInterestPaid = loanPayments.reduce((sum, payment) => {
      // Find the corresponding loan creation
      const loanCreation = loanCreations.find(
        (creation) => creation.loanId === payment.loanId,
      );

      if (loanCreation) {
        // Calculate what portion of payment was interest vs principal
        const interestRate = loanCreation.interestRate || 10.5;
        const daysSinceCreation = Math.floor(
          (payment.timestamp.getTime() - loanCreation.timestamp.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Simple daily interest calculation
        const dailyRate = interestRate / 100 / 365;
        const accruedInterest =
          loanCreation.amount * dailyRate * daysSinceCreation;

        // Estimate portion of payment that was interest
        const interestPortion = Math.min(payment.amount, accruedInterest);
        return sum + interestPortion;
      }

      return sum;
    }, 0);

    // Calculate active loans (loans with remaining balance)
    const activeLoanCount = loanCreations.filter((creation) => {
      const paymentsForLoan = loanPayments.filter(
        (payment) => payment.loanId === creation.loanId,
      );
      const totalPaid = paymentsForLoan.reduce((sum, p) => sum + p.amount, 0);

      // Calculate total owed with interest
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - creation.timestamp.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const interestRate = creation.interestRate || 10.5;
      const dailyRate = interestRate / 100 / 365;
      const totalOwed = creation.amount * (1 + dailyRate * daysSinceCreation);

      return totalPaid < totalOwed; // Still has remaining balance
    }).length;

    // Calculate completed loans
    const completedLoanCount = loanCreations.length - activeLoanCount;

    // Calculate payment success rate
    const totalTransactionAttempts = lendingTxs.length;
    const successfulTransactions = lendingTxs.filter(
      (tx) => tx.status === "completed",
    ).length;
    const paymentSuccessRate =
      totalTransactionAttempts > 0
        ? (successfulTransactions / totalTransactionAttempts) * 100
        : 100;

    // Calculate loan-specific success rate
    const totalLoanAttempts =
      loanCreations.length +
      failedTransactions.filter((tx) => tx.type === "loan_created").length;
    const successfulLoanRate =
      totalLoanAttempts > 0
        ? (loanCreations.length / totalLoanAttempts) * 100
        : 100;

    // Calculate average loan amount
    const averageLoanAmount =
      loanCreations.length > 0 ? totalBorrowed / loanCreations.length : 0;

    // Calculate total volume (all transaction amounts)
    const totalVolume = lendingTxs.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate collateral vs credit loan ratio
    const collateralLoans = loanCreations.filter((tx) => tx.collateral).length;
    const creditLoans = loanCreations.filter((tx) => !tx.collateral).length;

    // Calculate Bitcoin-verified loans
    const bitcoinVerifiedLoans = lendingTxs.filter(
      (tx) => tx.details?.includes("Bitcoin") || tx.details?.includes("BTC"),
    ).length;

    return {
      totalBorrowed,
      totalInterestPaid,
      paymentSuccessRate,
      loanSuccessRate: successfulLoanRate,
      totalLoans: loanCreations.length,
      activeLoanCount,
      completedLoanCount,
      successfulLoans: completedLoanCount,
      failedLoans: failedTransactions.filter((tx) => tx.type === "loan_created")
        .length,
      totalPayments: loanPayments.length,
      averageLoanAmount,
      totalVolume,
      collateralLoans,
      creditLoans,
      bitcoinVerifiedLoans,
      totalTransactions: lendingTxs.length,
      pendingTransactions: lendingTxs.filter((tx) => tx.status === "pending")
        .length,
    };
  }, [getLendingTransactions]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
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
        <div className="text-sm text-muted-foreground">
          {stats.totalTransactions} total transactions
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
              ${formatAmount(stats.totalBorrowed, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Borrowed</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-700 dark:text-green-400">
              ${formatAmount(stats.totalInterestPaid, 2)}
            </div>
            <div className="text-xs text-muted-foreground">Interest Paid</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <div className="text-sm font-bold text-purple-700 dark:text-purple-400">
              ${formatAmount(stats.averageLoanAmount, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Loan</div>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
            <div className="text-sm font-bold text-orange-700 dark:text-orange-400">
              {stats.totalPayments}
            </div>
            <div className="text-xs text-muted-foreground">Payments Made</div>
          </div>
        </div>

        {/* Enhanced Detailed Stats */}
        <div className="space-y-2 text-xs border-t pt-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Active Loans:
            </span>
            <span className="font-medium">{stats.activeLoanCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed Loans:
            </span>
            <span className="font-medium">{stats.completedLoanCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Credit Loans:
            </span>
            <span className="font-medium">{stats.creditLoans}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Collateral Loans:
            </span>
            <span className="font-medium">{stats.collateralLoans}</span>
          </div>

          {stats.bitcoinVerifiedLoans > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                🟠 Bitcoin Verified:
              </span>
              <span className="font-medium">{stats.bitcoinVerifiedLoans}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Total Volume:</span>
            <span className="font-medium">
              ${formatAmount(stats.totalVolume, 0)}
            </span>
          </div>

          {stats.pendingTransactions > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-yellow-600">
                Pending:
              </span>
              <span className="font-medium text-yellow-600">
                {stats.pendingTransactions}
              </span>
            </div>
          )}
        </div>

        {stats.totalLoans > 0 && (
          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              Performance
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`p-2 rounded ${
                  stats.paymentSuccessRate >= 95
                    ? "bg-green-50 text-green-700"
                    : stats.paymentSuccessRate >= 80
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                <div className="font-medium">
                  {stats.paymentSuccessRate >= 95
                    ? "Excellent"
                    : stats.paymentSuccessRate >= 80
                      ? "Good"
                      : "Needs Improvement"}
                </div>
                <div>Credit Rating</div>
              </div>

              <div
                className={`p-2 rounded ${
                  stats.activeLoanCount === 0
                    ? "bg-green-50 text-green-700"
                    : stats.activeLoanCount <= 2
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-orange-50 text-orange-700"
                }`}
              >
                <div className="font-medium">
                  {stats.activeLoanCount === 0
                    ? "Clear"
                    : stats.activeLoanCount <= 2
                      ? "Moderate"
                      : "High"}
                </div>
                <div>Debt Load</div>
              </div>
            </div>
          </div>
        )}

        {stats.totalTransactions === 0 && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground mb-2">
              No lending activity yet
            </div>
            <div className="text-xs text-muted-foreground">
              Create your first loan to see statistics here
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
