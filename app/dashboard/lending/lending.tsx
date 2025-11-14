import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, X } from "lucide-react";
import LendingStatsCard from "./cards/lending-stats";
import ActiveLoansCard from "./cards/active-loans";
import CollateralizedLoan from "./collateralized";
import CreditLoan from "./credit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioActivityCard from "./cards/portfolio-card";
import { LendingProvider, useLending } from "@/hooks/dashboard/lending";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { useMemo } from "react";

function LendingTabContent() {
  const { showManageLoan, showFullLoanInterface } = useLending();

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
        {/* Full Loan Interface Card - Takes 2x2 when expanded */}
        {showFullLoanInterface ? (
          <FullLoanInterfaceCard />
        ) : (
          !showManageLoan && <LoanInterfaceSummaryCard />
        )}

        <PortfolioActivityCard />

        {/* Active Loan Card - Normal or expanded */}
        {!showFullLoanInterface && (
          <ActiveLoansCard isExpanded={showManageLoan} />
        )}

        {/* Sidebar Cards - Hide when expanded views are shown */}
        {!showFullLoanInterface && !showManageLoan && <LendingStatsCard />}
      </div>
    </div>
  );
}

// Summary Card Component for the Loan Interface
function LoanInterfaceSummaryCard() {
  const { setShowFullLoanInterface } = useLending();
  const { getLendingTransactions } = useDashboardContext();

  const stats = useMemo(() => {
    const lendingTxs = getLendingTransactions();

    // Get loan creation transactions
    const loanCreations = lendingTxs.filter(
      (tx) => tx.type === "loan_created" && tx.status === "completed"
    );

    // Get payment transactions
    const loanPayments = lendingTxs.filter(
      (tx) => tx.type === "loan_payment" && tx.status === "completed"
    );

    // Calculate total borrowed amount
    const totalBorrowed = loanCreations.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate payment success rate
    const totalTransactionAttempts = lendingTxs.length;
    const successfulTransactions = lendingTxs.filter(
      (tx) => tx.status === "completed"
    ).length;
    const paymentSuccessRate =
      totalTransactionAttempts > 0
        ? (successfulTransactions / totalTransactionAttempts) * 100
        : 100;

    // Calculate active loans (loans with remaining balance)
    const activeLoanCount = loanCreations.filter((creation) => {
      const paymentsForLoan = loanPayments.filter(
        (payment) => payment.loanId === creation.loanId
      );
      const totalPaid = paymentsForLoan.reduce((sum, p) => sum + p.amount, 0);

      // Calculate total owed with interest
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - creation.timestamp.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const interestRate = creation.interestRate || 10.5;
      const dailyRate = interestRate / 100 / 365;
      const totalOwed = creation.amount * (1 + dailyRate * daysSinceCreation);

      return totalPaid < totalOwed; // Still has remaining balance
    }).length;

    // Calculate credit limits based on transaction history
    const baseLimit = Math.min(50000, 5000 + loanCreations.length * 2500);
    const maxCreditAmount = baseLimit;

    console.log("📊 Lending summary stats from dashboard context:", {
      totalBorrowed,
      paymentSuccessRate,
      activeLoanCount,
      totalTransactions: lendingTxs.length,
      loanCreations: loanCreations.length,
    });

    return {
      totalBorrowed,
      paymentSuccessRate,
      activeLoanCount,
      maxCreditAmount,
      totalTransactions: lendingTxs.length,
    };
  }, [getLendingTransactions]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Apply for Loan
        </CardTitle>
        {stats.totalTransactions > 0 && (
          <div className="text-sm text-muted-foreground">
            {stats.totalTransactions} lending transactions on record
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Get instant access to liquidity with our flexible lending options.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Collateral Loan Summary */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
              Collateral Loan
            </h3>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-medium">8-15% APR</span>
              </div>
              <div className="flex justify-between">
                <span>Max LTV:</span>
                <span className="font-medium">80%</span>
              </div>
              <div className="flex justify-between">
                <span>Term:</span>
                <span className="font-medium">7-365 days</span>
              </div>
              <div className="flex justify-between">
                <span>Collateral:</span>
                <span className="font-medium">Required</span>
              </div>
            </div>
          </div>

          {/* Credit Loan Summary */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium mb-2 text-green-900 dark:text-green-100">
              Credit Loan
            </h3>
            <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-medium">
                  {stats.paymentSuccessRate >= 95
                    ? "5-8%"
                    : stats.paymentSuccessRate >= 85
                    ? "8-15%"
                    : stats.paymentSuccessRate >= 70
                    ? "15-20%"
                    : "20-25%"}{" "}
                  APR
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Amount:</span>
                <span className="font-medium">
                  ${(stats.maxCreditAmount / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex justify-between">
                <span>Term:</span>
                <span className="font-medium">30-365 days</span>
              </div>
              <div className="flex justify-between">
                <span>Collateral:</span>
                <span className="font-medium text-green-600">None</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats - Now from dashboard context */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {stats.totalBorrowed > 0
                  ? `$${(stats.totalBorrowed / 1000).toFixed(1)}K`
                  : "$0"}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Borrowed
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {stats.paymentSuccessRate.toFixed(0)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Success Rate
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {stats.activeLoanCount}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Active Loans
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-4"
          onClick={() => setShowFullLoanInterface(true)}
        >
          {stats.totalTransactions > 0
            ? "Apply for Another Loan"
            : "Apply for Loan"}
        </Button>

        {/* Enhanced Info Footer */}
        <div className="text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield className="h-3 w-3 mt-0.5" />
            <div>
              Powered by Onchain Credit -
              {stats.totalTransactions > 0 ? (
                <span className="ml-1">
                  Your rates based on {stats.totalTransactions} transaction(s)
                </span>
              ) : (
                <span className="ml-1">
                  No traditional credit check required
                </span>
              )}
            </div>
          </div>
        </div>

        {stats.totalTransactions === 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xs text-green-700 dark:text-green-300">
              <div className="font-medium mb-1">👋 New to Sundial Lending?</div>
              <div>
                Start with a small collateral loan to build your onchain credit
                history and unlock better rates for future credit loans.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Full Loan Interface Component - Takes 2x2 grid space
function FullLoanInterfaceCard() {
  const { setShowFullLoanInterface } = useLending();

  return (
    <Card className="lg:col-span-2 lg:row-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">New Loan Application</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullLoanInterface(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="collateral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collateral">Collateral Loan</TabsTrigger>
            <TabsTrigger value="credit">Credit Loan</TabsTrigger>
          </TabsList>

          <TabsContent value="collateral">
            <CollateralizedLoan />
          </TabsContent>

          <TabsContent value="credit">
            <CreditLoan />
          </TabsContent>
        </Tabs>

        {/* Enhanced Footer Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <div className="font-medium mb-1">Powered by Onchain Credit</div>
              <div>
                Your credit score is calculated from blockchain data including
                payment history, transaction patterns, and DeFi protocol usage.
                <span className="ml-1 font-medium">
                  All statistics calculated in real-time from your transaction
                  history.
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LendingTab() {
  return (
    <LendingProvider>
      <LendingTabContent />
    </LendingProvider>
  );
}
