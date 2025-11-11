"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePrices, { formatAmount } from "@/hooks/dashboard/prices";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { useLending } from "@/hooks/dashboard/lending";
import { AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function CollateralizedLoan() {
  const { portfolioData } = useDashboardContext();
  const { convert } = usePrices();
  const { addLoan, isProcessingNewLoan, setShowFullLoanInterface } =
    useLending();

  const [collateralAsset, setCollateralAsset] = useState("BTC");
  const [borrowAsset, setBorrowAsset] = useState("USDC");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("30");

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

  const calculateDueDate = (days: number) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  };

  const calculateMonthlyPayment = (
    amount: number,
    rate: number,
    days: number
  ) => {
    const monthlyRate = rate / 100 / 12;
    const months = days / 30;
    const totalWithInterest = amount * (1 + (rate / 100) * (days / 365));
    return totalWithInterest / months;
  };

  const handleBorrow = async () => {
    if (!collateralAmount || !borrowAmount) return;

    const confirmed = confirm(
      `Create collateralized loan?\n\n` +
        `Collateral: ${collateralAmount} ${collateralAsset}\n` +
        `Borrow: ${borrowAmount} ${borrowAsset}\n` +
        `Interest Rate: ${currentBorrowRate}% APR\n` +
        `Term: ${loanTerm} days\n` +
        `LTV: ${currentLTV.toFixed(1)}%\n\n` +
        `This will lock your collateral until the loan is repaid.`
    );

    if (!confirmed) return;

    try {
      const loanData = {
        type: "collateral" as const,
        amount: Number(borrowAmount),
        asset: borrowAsset,
        collateral: {
          amount: Number(collateralAmount),
          asset: collateralAsset,
        },
        interestRate: currentBorrowRate,
        startDate: new Date(),
        dueDate: calculateDueDate(Number(loanTerm)),
        status: "active" as const,
        totalOwed:
          Number(borrowAmount) +
          (((Number(borrowAmount) * currentBorrowRate) / 100) *
            Number(loanTerm)) /
            365,
        interestAccrued: 0,
        monthlyPayment: calculateMonthlyPayment(
          Number(borrowAmount),
          currentBorrowRate,
          Number(loanTerm)
        ),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentsRemaining: Math.ceil(Number(loanTerm) / 30),
        totalPaid: 0,
        interestPaid: 0,
      };

      await addLoan(loanData);

      // Reset form
      setCollateralAmount("");
      setBorrowAmount("");
      setLoanTerm("30");

      alert(
        `Loan created successfully!\nBorrowed: ${borrowAmount} ${borrowAsset}\nCollateral locked: ${collateralAmount} ${collateralAsset}`
      );
    } catch (error) {
      alert("Failed to create loan. Please try again.");
      console.error("Loan creation error:", error);
    }
  };

  const isFormValid =
    collateralAmount &&
    borrowAmount &&
    currentLTV <= maxLTV &&
    Number(borrowAmount) <= maxBorrow &&
    Number(collateralAmount) <=
      availableCollateral[collateralAsset as keyof typeof availableCollateral];

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
                disabled={isProcessingNewLoan}
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
                disabled={isProcessingNewLoan}
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
                disabled={isProcessingNewLoan}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                onClick={() =>
                  maxBorrow > 0 && setBorrowAmount(maxBorrow.toFixed(2))
                }
                disabled={!collateralAmount || isProcessingNewLoan}
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Max borrow: ${formatAmount(maxBorrow, 2)}
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Loan Term
          </Label>
          <Select value={loanTerm} onValueChange={setLoanTerm}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
            </SelectContent>
          </Select>
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

        {/* Loan Summary */}
        {isFormValid && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium mb-2">Loan Summary</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Monthly Payment:</span>
                <span className="font-medium">
                  $
                  {formatAmount(
                    calculateMonthlyPayment(
                      Number(borrowAmount),
                      currentBorrowRate,
                      Number(loanTerm)
                    ),
                    2
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-medium">
                  $
                  {formatAmount(
                    (((Number(borrowAmount) * currentBorrowRate) / 100) *
                      Number(loanTerm)) /
                      365,
                    2
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className="font-medium">
                  {calculateDueDate(Number(loanTerm)).toLocaleDateString()}
                </span>
              </div>
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

        {/* Insufficient Collateral Warning */}
        {Number(collateralAmount) >
          availableCollateral[
            collateralAsset as keyof typeof availableCollateral
          ] &&
          collateralAmount && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="text-xs text-red-700 dark:text-red-400">
                Insufficient {collateralAsset} balance
              </div>
            </div>
          )}

        <Button
          className="w-full"
          size="lg"
          disabled={!isFormValid || isProcessingNewLoan}
          onClick={handleBorrow}
        >
          {isProcessingNewLoan ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-2" />
          )}
          {isProcessingNewLoan ? "Creating Loan..." : `Borrow ${borrowAsset}`}
        </Button>
      </CardContent>
    </Card>
  );
}
