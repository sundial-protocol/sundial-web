"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  CreditCard,
  DollarSign,
  Calendar,
} from "lucide-react";
import { formatAmount } from "@/hooks/dashboard/prices";
import {
  useLending,
  usePaymentHistory,
  LoanData,
} from "@/hooks/dashboard/lending";
// Import dashboard context for transactions
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import {
  TransactionType,
  LendingTransaction,
} from "@/hooks/dashboard/dashboard";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface ActivityItem {
  id: string;
  type: string;
  amount: number;
  asset: string;
  status: string;
  date: Date;
  loanId?: string;
  transactionHash?: string;
  source: "payment" | "transaction";
  details?: string;
  interestRate?: number;
}

export default function PortfolioActivityCard() {
  const {
    loans,
    activeLoans,
    loanHistory,
    stats,
    refreshData,
    setSelectedLoanId,
    setShowManageLoan,
  } = useLending();

  // Get lending transactions from dashboard context
  const { getLendingTransactions } = useDashboardContext();

  const allPaymentHistory = usePaymentHistory();
  const [showAllLoans, setShowAllLoans] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const { addToast } = useToast();

  // Combine payment history and lending transactions
  const getCombinedActivity = (): ActivityItem[] => {
    const paymentItems: ActivityItem[] = allPaymentHistory.map((payment) => ({
      id: payment.id,
      type: payment.type,
      amount: payment.amount,
      asset: payment.loanId
        ? loans.find((l) => l.id === payment.loanId)?.asset || "USD"
        : "USD",
      status: payment.status,
      date: payment.date,
      loanId: payment.loanId,
      transactionHash: payment.transactionHash,
      source: "payment" as const,
    }));

    const transactionItems: ActivityItem[] = getLendingTransactions().map(
      (tx) => ({
        id: tx.id,
        type: getTransactionDisplayType(tx.type),
        amount: tx.amount,
        asset: tx.asset.toUpperCase(),
        status: tx.status,
        date: tx.timestamp,
        loanId: tx.loanId,
        transactionHash: tx.txHash,
        source: "transaction" as const,
        details: tx.details,
        interestRate: tx.interestRate,
      })
    );

    // Combine and sort by date
    return [...paymentItems, ...transactionItems].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  };

  // Convert transaction types to display-friendly names
  const getTransactionDisplayType = (type: TransactionType): string => {
    switch (type) {
      case "loan_created":
        return "loan_creation";
      case "loan_payment":
        return "payment";
      case "loan_extended":
        return "extension";
      case "loan_refinanced":
        return "refinance";
      case "loan_closed":
        return "closure";
      default:
        return type;
    }
  };

  const combinedActivity = getCombinedActivity();

  // Get recent activity (last 10 items)
  const recentActivity = combinedActivity.slice(
    0,
    showAllActivity ? combinedActivity.length : 5
  );

  // Get loan display list
  const displayLoans = showAllLoans ? loans : loans.slice(0, 4);

  const getStatusIcon = (status: LoanData["status"]) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3 text-blue-600" />;
      case "paid":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "overdue":
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "liquidated":
        return <TrendingDown className="h-3 w-3 text-orange-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: LoanData["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "overdue":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "liquidated":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Updated to handle both payment and transaction types
  const getActivityIcon = (
    type: string,
    status: string,
    source: "payment" | "transaction"
  ) => {
    if (status === "failed") {
      return <AlertTriangle className="h-3 w-3 text-red-600" />;
    }

    // Handle transaction types differently
    if (source === "transaction") {
      switch (type) {
        case "loan_creation":
          return <CreditCard className="h-3 w-3 text-blue-600" />;
        case "payment":
          return <DollarSign className="h-3 w-3 text-green-600" />;
        case "extension":
          return <Calendar className="h-3 w-3 text-orange-600" />;
        case "refinance":
          return <RefreshCw className="h-3 w-3 text-purple-600" />;
        case "closure":
          return <CheckCircle className="h-3 w-3 text-gray-600" />;
        default:
          return <Activity className="h-3 w-3 text-gray-600" />;
      }
    }

    // Original payment type handling
    switch (type) {
      case "payment":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "interest":
        return <TrendingUp className="h-3 w-3 text-blue-600" />;
      case "fee":
        return <AlertTriangle className="h-3 w-3 text-orange-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get activity type display name
  const getActivityTypeDisplay = (
    type: string,
    source: "payment" | "transaction"
  ) => {
    if (source === "transaction") {
      switch (type) {
        case "loan_creation":
          return "Loan Created";
        case "extension":
          return "Loan Extended";
        case "refinance":
          return "Loan Refinanced";
        case "closure":
          return "Loan Closed";
        default:
          return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleLoanClick = (loan: LoanData) => {
    if (loan.status === "active") {
      setSelectedLoanId(loan.id);
      setShowManageLoan(true);
    }
  };

  const calculateLoanProgress = (loan: LoanData) => {
    if (loan.status === "paid") return 100;
    if (loan.status === "liquidated") return 0;

    const totalToPay = loan.amount + loan.interestAccrued;
    const paid = loan.totalPaid;
    return Math.min((paid / totalToPay) * 100, 100);
  };

  return (
    <Card className="row-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Portfolio & Activity
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
      <CardContent className="space-y-6">
        {/* Portfolio Overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Portfolio Overview</h4>
            <div className="text-xs text-muted-foreground">
              {displayLoans.length} total loans
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-sm font-bold text-green-700 dark:text-green-400">
                {displayLoans.filter((loan) => loan.status === "active").length}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">
                Active
              </div>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {displayLoans.filter((loan) => loan.status !== "active").length}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500">
                Completed
              </div>
            </div>
          </div>

          {/* Loan List */}
          <div className="space-y-2">
            {displayLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => handleLoanClick(loan)}
                className={`p-3 rounded-lg border transition-colors ${
                  loan.status === "active"
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(loan.status)}
                    <span className="font-medium text-sm">
                      ${formatAmount(loan.amount, 0)} {loan.asset}
                    </span>
                    <Badge className={`text-xs ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {loan.interestRate}% APR
                  </div>
                </div>

                {/* Loan Type and Collateral Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="capitalize">{loan.type} loan</span>
                  {loan.collateral && (
                    <span>
                      Collateral: {loan.collateral.amount}{" "}
                      {loan.collateral.asset}
                    </span>
                  )}
                </div>

                {/* Progress Bar for Active Loans */}
                {loan.status === "active" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>${formatAmount(loan.totalOwed, 2)} remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${calculateLoanProgress(loan)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Completion Info for Finished Loans */}
                {loan.status !== "active" && (
                  <div className="text-xs text-muted-foreground">
                    {loan.status === "paid" ? (
                      <>Total paid: ${formatAmount(loan.totalPaid, 2)}</>
                    ) : loan.status === "liquidated" ? (
                      <>Liquidated on {loan.dueDate.toLocaleDateString()}</>
                    ) : (
                      <>Due: {loan.dueDate.toLocaleDateString()}</>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loans.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllLoans(!showAllLoans)}
                className="w-full text-xs"
              >
                {showAllLoans ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show All ({loans.length - 4} more)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Recent Activity with Combined Data */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <div className="text-xs text-muted-foreground">
              {combinedActivity.length} transactions
            </div>
          </div>

          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const loan = loans.find((l) => l.id === activity.loanId);
                return (
                  <div
                    key={`${activity.source}-${activity.id}`}
                    className="flex items-center justify-between p-2 rounded border-l-2 border-l-blue-200 bg-gray-50/50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2">
                      {getActivityIcon(
                        activity.type,
                        activity.status,
                        activity.source
                      )}
                      <div>
                        <div className="text-xs font-medium">
                          {activity.type === "loan_creation" &&
                          activity.amount === 0 ? (
                            <span>Loan Created</span>
                          ) : (
                            <>
                              ${formatAmount(activity.amount, 2)}{" "}
                              {activity.asset}
                            </>
                          )}
                          {/* Show interest rate for loan creation */}
                          {activity.type === "loan_creation" &&
                            activity.interestRate && (
                              <span className="ml-1 text-blue-600">
                                @ {activity.interestRate.toFixed(1)}%
                              </span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getActivityTypeDisplay(
                            activity.type,
                            activity.source
                          )}{" "}
                          • {activity.date.toLocaleDateString()}
                          {/* Show loan ID for transaction activities */}
                          {activity.loanId &&
                            activity.source === "transaction" && (
                              <span className="ml-1 font-mono">
                                #{activity.loanId.slice(-6)}
                              </span>
                            )}
                        </div>
                        {/* Show transaction details */}
                        {activity.details && (
                          <div className="text-xs text-muted-foreground max-w-32 truncate">
                            {activity.details}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className={`text-xs ${getActivityStatusColor(
                          activity.status
                        )}`}
                      >
                        {activity.status}
                      </Badge>
                      {/* Show source indicator */}
                      <div className="text-xs text-muted-foreground">
                        {activity.source === "transaction" ? (
                          <span className="px-1 bg-purple-100 text-purple-700 rounded">
                            Tx
                          </span>
                        ) : (
                          <span className="px-1 bg-blue-100 text-blue-700 rounded">
                            Pay
                          </span>
                        )}
                      </div>
                      {activity.transactionHash && (
                        <div className="text-xs text-blue-600 font-mono">
                          {activity.transactionHash.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No recent activity
              </div>
            )}

            {/* Updated show more button to use combined activity count */}
            {combinedActivity.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="w-full text-xs"
              >
                {showAllActivity ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show All ({combinedActivity.length - 5} more)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {activeLoans.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedLoanId(activeLoans[0].id);
                  setShowManageLoan(true);
                }}
                className="text-xs h-8"
              >
                Make Payment
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  addToast({
                    type: "info",
                    title: "Feature Coming Soon",
                    message: "Loan application feature is under development.",
                  });
                }}
                className="text-xs h-8"
              >
                Apply for Loan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
