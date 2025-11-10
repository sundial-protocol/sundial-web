"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  TrendingDown,
  AlertTriangle,
  Shield,
  Star,
  RefreshCw,
  DollarSign,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { usePrices, formatAmount } from "@/hooks/dashboard/prices";

interface CreditScore {
  score: number;
  grade: string;
  factors: {
    paymentHistory: number;
    accountAge: number;
    transactionVolume: number;
    liquidationEvents: number;
    protocolUsage: number;
  };
  creditLimit: number;
  interestRate: number;
  lastUpdated: Date;
}

interface LoanHistory {
  id: string;
  type: "collateral" | "credit";
  amount: number;
  asset: string;
  collateral?: {
    amount: number;
    asset: string;
  };
  interestRate: number;
  startDate: Date;
  dueDate: Date;
  status: "active" | "paid" | "overdue" | "liquidated";
  totalPaid: number;
  interestPaid: number;
}

function PortfolioCard() {
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

function LendingStatsCard() {
  // Mock lending history data
  const lendingHistory: LoanHistory[] = [
    {
      id: "loan-001",
      type: "collateral",
      amount: 5000,
      asset: "USDC",
      collateral: { amount: 0.15, asset: "BTC" },
      interestRate: 8.5,
      startDate: new Date("2024-01-15"),
      dueDate: new Date("2024-02-14"),
      status: "paid",
      totalPaid: 5035.42,
      interestPaid: 35.42,
    },
    {
      id: "loan-002",
      type: "credit",
      amount: 2500,
      asset: "USDC",
      interestRate: 12.5,
      startDate: new Date("2024-02-20"),
      dueDate: new Date("2024-03-21"),
      status: "active",
      totalPaid: 0,
      interestPaid: 0,
    },
    {
      id: "loan-003",
      type: "collateral",
      amount: 3000,
      asset: "DAI",
      collateral: { amount: 2500, asset: "ADA" },
      interestRate: 9.2,
      startDate: new Date("2023-12-01"),
      dueDate: new Date("2024-01-01"),
      status: "paid",
      totalPaid: 3023.5,
      interestPaid: 23.5,
    },
  ];

  const totalBorrowed = lendingHistory.reduce(
    (sum, loan) => sum + loan.amount,
    0
  );
  const totalInterestPaid = lendingHistory.reduce(
    (sum, loan) => sum + loan.interestPaid,
    0
  );
  const successfulLoans = lendingHistory.filter(
    (loan) => loan.status === "paid"
  ).length;
  const totalLoans = lendingHistory.length;
  const paymentSuccessRate =
    totalLoans > 0 ? (successfulLoans / totalLoans) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Lending Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold">
              ${formatAmount(totalBorrowed, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Borrowed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold">
              ${formatAmount(totalInterestPaid, 2)}
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
              {paymentSuccessRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={paymentSuccessRate} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{successfulLoans} successful</span>
            <span>{totalLoans} total loans</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveLoanCard({ showManageLoan, setShowManageLoan }: { showManageLoan: boolean; setShowManageLoan: (value: boolean) => void }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Mock active loan data
  const activeLoan = {
    id: "loan-002",
    type: "credit" as const,
    amount: 2500,
    asset: "USDC",
    interestRate: 12.5,
    startDate: new Date("2024-02-20"),
    dueDate: new Date("2024-03-21"),
    status: "active" as const,
    totalOwed: 2526.04,
    interestAccrued: 26.04,
    monthlyPayment: 105.25,
    nextPaymentDate: new Date("2024-03-01"),
    paymentsRemaining: 1,
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessingPayment(false);
    setPaymentAmount("");
    // Reset to summary view after payment
    setShowManageLoan(false);
  };

  const daysToDue = Math.ceil(
    (activeLoan.dueDate.getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (!activeLoan) return null;

  // Expanded Loan Management View
  if (showManageLoan) {
    return (
      <Card className="border-blue-200 bg-blue-50/50 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Manage Active Loan
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManageLoan(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loan Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-lg font-bold">
                ${formatAmount(activeLoan.amount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Original</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold">
                ${formatAmount(activeLoan.totalOwed, 2)}
              </div>
              <div className="text-xs text-muted-foreground">Total Owed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold">
                ${formatAmount(activeLoan.interestAccrued, 2)}
              </div>
              <div className="text-xs text-muted-foreground">Interest</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold">
                {activeLoan.interestRate}%
              </div>
              <div className="text-xs text-muted-foreground">APR</div>
            </div>
          </div>

          {/* Due Date Warning */}
          {daysToDue <= 7 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="text-sm text-orange-700">
                {daysToDue > 0 ? (
                  <>Loan due in {daysToDue} days</>
                ) : (
                  <>Loan is {Math.abs(daysToDue)} days overdue</>
                )}
              </div>
            </div>
          )}

          {/* Payment Interface */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Make Payment</Label>

            {/* Quick Payment Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPaymentAmount(activeLoan.monthlyPayment.toString())
                }
                className="text-xs"
              >
                Monthly Payment
                <span className="ml-1 text-muted-foreground">
                  ${formatAmount(activeLoan.monthlyPayment, 2)}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPaymentAmount(activeLoan.totalOwed.toString())
                }
                className="text-xs"
              >
                Pay in Full
                <span className="ml-1 text-muted-foreground">
                  ${formatAmount(activeLoan.totalOwed, 2)}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPaymentAmount(activeLoan.interestAccrued.toString())
                }
                className="text-xs"
              >
                Interest Only
                <span className="ml-1 text-muted-foreground">
                  ${formatAmount(activeLoan.interestAccrued, 2)}
                </span>
              </Button>
            </div>

            {/* Custom Payment Amount */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                type="number"
                step="0.01"
              />
              {/* <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!paymentAmount || Number(paymentAmount) <= 0}
                    className="min-w-[100px]"
                  >
                    {isProcessingPayment ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Pay Now"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to make a payment of $
                      {paymentAmount} {activeLoan.asset}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePayment}>
                      Confirm Payment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog> */}
            </div>
          </div>

          {/* Next Payment Info */}
          <div className="p-4 bg-white/70 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Next Payment Due</span>
              <span className="text-lg font-bold text-blue-600">
                ${formatAmount(activeLoan.monthlyPayment, 2)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Due: {activeLoan.nextPaymentDate.toLocaleDateString()}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal:</span>
                <span>${formatAmount(activeLoan.monthlyPayment * 0.8, 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest:</span>
                <span>${formatAmount(activeLoan.monthlyPayment * 0.2, 2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              Extend Term
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refinance
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Activity className="h-4 w-4 mr-1" />
              History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary View (Default)
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Active Loan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-medium">
            ${formatAmount(activeLoan.amount, 0)} {activeLoan.asset}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Owed</span>
          <span className="font-medium">
            ${formatAmount(activeLoan.totalOwed, 2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Interest Rate</span>
          <span className="font-medium">{activeLoan.interestRate}% APR</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Due Date</span>
          <span className="font-medium">
            {activeLoan.dueDate.toLocaleDateString()}
          </span>
        </div>

        {/* Due Date Warning in Summary */}
        {daysToDue <= 7 && (
          <div className="flex items-center gap-2 p-2 bg-orange-100 rounded">
            <AlertTriangle className="h-3 w-3 text-orange-600" />
            <div className="text-xs text-orange-700">
              {daysToDue > 0
                ? `Due in ${daysToDue} days`
                : `${Math.abs(daysToDue)} days overdue`}
            </div>
          </div>
        )}

        <Button
          size="sm"
          className="w-full mt-3"
          onClick={() => setShowManageLoan(true)}
        >
          Manage Loan
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentActivityCard() {
  const lendingHistory: LoanHistory[] = [
    {
      id: "loan-001",
      type: "collateral",
      amount: 5000,
      asset: "USDC",
      collateral: { amount: 0.15, asset: "BTC" },
      interestRate: 8.5,
      startDate: new Date("2024-01-15"),
      dueDate: new Date("2024-02-14"),
      status: "paid",
      totalPaid: 5035.42,
      interestPaid: 35.42,
    },
    {
      id: "loan-002",
      type: "credit",
      amount: 2500,
      asset: "USDC",
      interestRate: 12.5,
      startDate: new Date("2024-02-20"),
      dueDate: new Date("2024-03-21"),
      status: "active",
      totalPaid: 0,
      interestPaid: 0,
    },
    {
      id: "loan-003",
      type: "collateral",
      amount: 3000,
      asset: "DAI",
      collateral: { amount: 2500, asset: "ADA" },
      interestRate: 9.2,
      startDate: new Date("2023-12-01"),
      dueDate: new Date("2024-01-01"),
      status: "paid",
      totalPaid: 3023.5,
      interestPaid: 23.5,
    },
  ];

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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

        {lendingHistory.length > 3 && (
          <Button variant="outline" size="sm" className="w-full">
            View All History
          </Button>
        )}

        {lendingHistory.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No lending history yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Credit Report
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Activity className="h-4 w-4 mr-2" />
          Payment History
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Shield className="h-4 w-4 mr-2" />
          Security Settings
        </Button>
      </CardContent>
    </Card>
  );
}

function CollateralizedLoan() {
  const { portfolioData } = useDashboardContext();
  const { convert } = usePrices();

  const [collateralAsset, setCollateralAsset] = useState("BTC");
  const [borrowAsset, setBorrowAsset] = useState("USDC");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  // Available assets for collateral
  const availableCollateral = {
    BTC: portfolioData.holdings.BTC || 0,
    ADA: portfolioData.holdings.ADA || 0,
  };

  // Borrow rates for different assets
  const borrowRates = {
    USDC: 8.5,
    USDT: 9.2,
    DAI: 8.8,
  };

  const maxLTV = 65;
  const currentBorrowRate =
    borrowRates[borrowAsset as keyof typeof borrowRates];
  const collateralValue =
    Number(collateralAmount) * convert(1, collateralAsset as any, "USD");
  const maxBorrow = (collateralValue * maxLTV) / 100;
  const currentLTV =
    borrowAmount && collateralValue > 0
      ? (Number(borrowAmount) / collateralValue) * 100
      : 0;

  const getLTVColor = (ltv: number) => {
    if (ltv < 50) return "text-green-600";
    if (ltv < 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-900 col-span-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Collateralized Loan</CardTitle>
          <div className="text-2xl font-bold text-blue-600">
            {currentBorrowRate.toFixed(1)}%
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Use crypto as collateral
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collateral Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Deposit Collateral
          </Label>

          <div className="flex gap-2">
            <Select value={collateralAsset} onValueChange={setCollateralAsset}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    BTC
                  </div>
                </SelectItem>
                <SelectItem value="ADA">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    ADA
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Input
                placeholder="0"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                type="number"
                step="0.00001"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                onClick={() =>
                  setCollateralAmount(
                    availableCollateral[
                      collateralAsset as keyof typeof availableCollateral
                    ].toString()
                  )
                }
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Available:{" "}
            {formatAmount(
              availableCollateral[
                collateralAsset as keyof typeof availableCollateral
              ],
              collateralAsset === "BTC" ? 4 : 0
            )}{" "}
            {collateralAsset}
          </div>
        </div>

        {/* Borrow Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Borrow
          </Label>

          <div className="flex gap-2">
            <Select value={borrowAsset} onValueChange={setBorrowAsset}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="DAI">DAI</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Input
                placeholder="0.00"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                type="number"
                step="0.01"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                onClick={() =>
                  maxBorrow > 0 && setBorrowAmount(maxBorrow.toFixed(2))
                }
                disabled={!collateralAmount}
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Max borrow: ${formatAmount(maxBorrow, 2)}
          </div>
        </div>

        {/* LTV Display */}
        {collateralAmount && borrowAmount && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan-to-Value (LTV)</span>
              <span className={`font-medium ${getLTVColor(currentLTV)}`}>
                {currentLTV.toFixed(1)}%
              </span>
            </div>
            <Progress value={currentLTV} className="h-2" max={100} />
            <div className="text-xs text-muted-foreground">
              Max LTV: {maxLTV}%
            </div>
          </div>
        )}

        {/* Risk Warning */}
        {currentLTV > 60 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="text-xs text-yellow-700 dark:text-yellow-400">
              High LTV increases liquidation risk
            </div>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={
            !collateralAmount ||
            !borrowAmount ||
            currentLTV > maxLTV ||
            Number(borrowAmount) > maxBorrow
          }
        >
          <TrendingDown className="w-4 h-4 mr-2" />
          Borrow {borrowAsset}
        </Button>
      </CardContent>
    </Card>
  );
}

function CreditLoan() {
  const { portfolioData } = useDashboardContext();
  const [borrowAsset, setBorrowAsset] = useState("USDC");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Mock credit score data - in reality, this would come from an API
  const [creditScore, setCreditScore] = useState<CreditScore>({
    score: 742,
    grade: "A-",
    factors: {
      paymentHistory: 95,
      accountAge: 78,
      transactionVolume: 82,
      liquidationEvents: 100, // No liquidations = 100%
      protocolUsage: 67,
    },
    creditLimit: 25000,
    interestRate: 12.5,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  });

  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-green-600";
    if (score >= 700) return "text-blue-600";
    if (score >= 600) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-700";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const refreshCreditScore = async () => {
    setIsLoadingScore(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock updated score
    setCreditScore((prev) => ({
      ...prev,
      score: prev.score + Math.floor(Math.random() * 20 - 10), // ±10 points
      lastUpdated: new Date(),
    }));
    setIsLoadingScore(false);
  };

  const utilizationPercent =
    borrowAmount && creditScore.creditLimit > 0
      ? (Number(borrowAmount) / creditScore.creditLimit) * 100
      : 0;

  const getUtilizationColor = (util: number) => {
    if (util < 30) return "text-green-600";
    if (util < 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Credit-Based Loan</CardTitle>
          <div className="text-2xl font-bold text-purple-600">
            {creditScore.interestRate.toFixed(1)}%
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Unsecured loan based on your onchain credit
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Credit Score Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold">Onchain Credit Score</div>
                <div className="text-xs text-muted-foreground">
                  Updated {creditScore.lastUpdated.toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCreditScore}
              disabled={isLoadingScore}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${
                  isLoadingScore ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${getScoreColor(
                  creditScore.score
                )}`}
              >
                {creditScore.score}
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <Badge className={getGradeColor(creditScore.grade)}>
                {creditScore.grade}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Grade</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                ${formatAmount(creditScore.creditLimit, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Credit Limit</div>
            </div>
          </div>

          {/* Credit Factors */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Payment History</span>
                <span className="font-medium">
                  {creditScore.factors.paymentHistory}%
                </span>
              </div>
              <Progress
                value={creditScore.factors.paymentHistory}
                className="h-1"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Account Age</span>
                <span className="font-medium">
                  {creditScore.factors.accountAge}%
                </span>
              </div>
              <Progress
                value={creditScore.factors.accountAge}
                className="h-1"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Volume History</span>
                <span className="font-medium">
                  {creditScore.factors.transactionVolume}%
                </span>
              </div>
              <Progress
                value={creditScore.factors.transactionVolume}
                className="h-1"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Liquidation Risk</span>
                <span className="font-medium">
                  {creditScore.factors.liquidationEvents}%
                </span>
              </div>
              <Progress
                value={creditScore.factors.liquidationEvents}
                className="h-1"
              />
            </div>
          </div>
        </div>

        {/* Borrow Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Borrow Amount
          </Label>

          <div className="flex gap-2">
            <Select value={borrowAsset} onValueChange={setBorrowAsset}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="DAI">DAI</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Input
                placeholder="0.00"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                type="number"
                step="0.01"
                max={creditScore.creditLimit}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                onClick={() =>
                  setBorrowAmount(creditScore.creditLimit.toString())
                }
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Credit limit: ${formatAmount(creditScore.creditLimit, 0)}
          </div>
        </div>

        {/* Utilization */}
        {borrowAmount && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credit Utilization</span>
              <span
                className={`font-medium ${getUtilizationColor(
                  utilizationPercent
                )}`}
              >
                {utilizationPercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={utilizationPercent} className="h-2" max={100} />
            <div className="text-xs text-muted-foreground">
              Recommended: Keep below 30% for optimal credit health
            </div>
          </div>
        )}

        {/* High Utilization Warning */}
        {utilizationPercent > 70 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <div className="text-xs text-orange-700 dark:text-orange-400">
              High utilization may negatively impact your credit score
            </div>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={
            !borrowAmount ||
            Number(borrowAmount) > creditScore.creditLimit ||
            creditScore.score < 500 // Minimum score requirement
          }
        >
          <Star className="w-4 h-4 mr-2" />
          Borrow {borrowAsset}
        </Button>

        {/* Loan Terms */}
        <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
          <div className="flex justify-between">
            <span>Interest rate:</span>
            <span>{creditScore.interestRate}% APR</span>
          </div>
          <div className="flex justify-between">
            <span>Loan term:</span>
            <span>30-365 days (flexible)</span>
          </div>
          <div className="flex justify-between">
            <span>Origination fee:</span>
            <span>1.0%</span>
          </div>
          <div className="flex justify-between">
            <span>Credit check:</span>
            <span>Soft inquiry (no impact)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LendingTab() {
  const [showManageLoan, setShowManageLoan] = useState(false);
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-min">
        {/* Main Loan Interface */}
        <div className="lg:col-span-2 lg:row-span-3">
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

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <div className="font-medium mb-1">
                  Powered by Onchain Credit
                </div>
                <div>
                  Your credit score is calculated from blockchain data including
                  payment history, transaction patterns, and DeFi protocol
                  usage. No traditional credit check required.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        {!showManageLoan && <PortfolioCard />}
        {!showManageLoan && <LendingStatsCard />}
        <ActiveLoanCard
          showManageLoan={showManageLoan}
          setShowManageLoan={setShowManageLoan}
        />
        {!showManageLoan && <RecentActivityCard />}
      </div>
    </div>
  );
}
