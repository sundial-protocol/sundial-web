"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAmount } from "@/hooks/dashboard/prices";
import {
  Activity,
  AlertTriangle,
  Clock,
  CreditCard,
  RefreshCw,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";

interface ActiveLoanCardProps {
  showManageLoan: boolean;
  setShowManageLoan: (show: boolean) => void;
  isExpanded?: boolean;
}

export default function ActiveLoanCard({
  showManageLoan,
  setShowManageLoan,
  isExpanded = false,
}: ActiveLoanCardProps) {
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

  // Expanded Loan Management View - Takes 2x2 grid space when expanded
  if (showManageLoan) {
    return (
      <Card
        className={isExpanded ? "lg:col-span-2 lg:row-span-2" : "lg:col-span-2"}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
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
          {/* Enhanced layout for expanded view */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Overview and Payment */}
            <div className="space-y-6">
              {/* Loan Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-white/70 rounded-lg">
                  <div className="text-xl font-bold">
                    ${formatAmount(activeLoan.amount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Original Amount
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-700">
                    ${formatAmount(activeLoan.totalOwed, 2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Owed
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-700">
                    ${formatAmount(activeLoan.interestAccrued, 2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Interest Accrued
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-700">
                    {activeLoan.interestRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">APR</div>
                </div>
              </div>

              {/* Due Date Warning */}
              {daysToDue <= 7 && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
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
                <Label className="text-lg font-semibold">Make Payment</Label>

                {/* Quick Payment Options */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPaymentAmount(activeLoan.monthlyPayment.toString())
                    }
                    className="w-full justify-between"
                  >
                    Monthly Payment
                    <span className="font-bold">
                      ${formatAmount(activeLoan.monthlyPayment, 2)}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPaymentAmount(activeLoan.totalOwed.toString())
                    }
                    className="w-full justify-between"
                  >
                    Pay in Full
                    <span className="font-bold">
                      ${formatAmount(activeLoan.totalOwed, 2)}
                    </span>
                  </Button>
                </div>

                {/* Custom Payment Amount */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    type="number"
                    step="0.01"
                    className="flex-1"
                  />
                  {/* <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={!paymentAmount || Number(paymentAmount) <= 0}
                        className="min-w-[120px]"
                      >
                        {isProcessingPayment ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to make a payment of ${" "}
                          {paymentAmount} {activeLoan.asset}? This action cannot
                          be undone.
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
            </div>

            {/* Right side - Details and Actions */}
            <div className="space-y-6">
              {/* Next Payment Info */}
              <div className="p-6 bg-white/70 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Next Payment Due</h4>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">
                    ${formatAmount(activeLoan.monthlyPayment, 2)}
                  </div>
                  <div className="text-muted-foreground">
                    Due: {activeLoan.nextPaymentDate.toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal</span>
                    <span className="font-medium">
                      ${formatAmount(activeLoan.monthlyPayment * 0.8, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest</span>
                    <span className="font-medium">
                      ${formatAmount(activeLoan.monthlyPayment * 0.2, 2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Terms */}
              <div className="p-6 bg-white/70 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Loan Terms</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Type</span>
                    <span className="capitalize font-medium">
                      {activeLoan.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-medium">
                      {activeLoan.interestRate}% APR
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">
                      {activeLoan.startDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">
                      {activeLoan.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Payments Remaining
                    </span>
                    <span className="font-medium">
                      {activeLoan.paymentsRemaining}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Extend Term
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refinance
                </Button>
                <Button variant="outline" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Payment History
                </Button>
                <Button variant="outline" className="w-full">
                  Download Statements
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary View (Default) - Normal card for grid
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Active Loans
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
          Manage Loans
        </Button>
      </CardContent>
    </Card>
  );
}
