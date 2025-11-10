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
  RefreshCw,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ActiveLoanCard({
  showManageLoan,
  setShowManageLoan,
}: {
  showManageLoan: boolean;
  setShowManageLoan: (value: boolean) => void;
}) {
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
