"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatAmount } from "@/hooks/dashboard/prices";
import {
  Activity,
  AlertTriangle,
  Clock,
  RefreshCw,
  TrendingUp,
  X,
  Download,
  CheckCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useLending,
  useActiveLoan,
  usePaymentHistory,
} from "@/hooks/dashboard/lending";

interface ActiveLoanCardProps {
  isExpanded?: boolean;
}

// Simple Modal Component with Portal and CSS Override
function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = "hidden";
      const style = document.createElement("style");
      style.textContent = `
        [data-radix-popper-content-wrapper] {
          z-index: 99999 !important;
        }
        [data-radix-select-content] {
          z-index: 99999 !important;
        }
      `;
      style.id = "modal-select-override";
      document.head.appendChild(style);
    } else {
      document.body.style.overflow = "unset";
      const existingStyle = document.getElementById("modal-select-override");
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      const existingStyle = document.getElementById("modal-select-override");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[9999] ${className}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 relative z-[10000]">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function ActiveLoanCard({
  isExpanded = false,
}: ActiveLoanCardProps) {
  const {
    showManageLoan,
    setShowManageLoan,
    makePayment,
    extendLoan,
    refinanceLoan,
    isProcessingPayment,
    isProcessingExtension,
    isProcessingRefinance,
  } = useLending();

  const activeLoan = useActiveLoan();
  const paymentHistory = usePaymentHistory(activeLoan?.id);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showRefinanceModal, setShowRefinanceModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState("30");
  const [refinanceRate, setRefinanceRate] = useState("10.5");
  const [refinanceTerm, setRefinanceTerm] = useState("90");

  const handlePayment = async () => {
    if (!activeLoan) return;

    const confirmed = confirm(
      `Are you sure you want to make a payment of $${paymentAmount} ${activeLoan.asset}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await makePayment(activeLoan.id, Number(paymentAmount));
      setPaymentAmount("");
      setShowManageLoan(false);
      alert("Payment processed successfully!");
    } catch (error) {
      alert("Payment failed. Please try again.");
    }
  };

  const handleExtendTerm = async () => {
    if (!activeLoan) return;

    try {
      await extendLoan(activeLoan.id, Number(extensionDays));
      const newDueDate = new Date(activeLoan.dueDate);
      newDueDate.setDate(newDueDate.getDate() + Number(extensionDays));
      alert(
        `Loan extended by ${extensionDays} days. New due date: ${newDueDate.toLocaleDateString()}`
      );
      setExtensionDays("30");
      setShowExtendModal(false);
    } catch (error) {
      alert("Failed to extend loan. Please try again.");
    }
  };

  const handleRefinance = async () => {
    if (!activeLoan) return;

    try {
      await refinanceLoan(
        activeLoan.id,
        Number(refinanceRate),
        Number(refinanceTerm)
      );
      alert(
        `Loan refinanced at ${refinanceRate}% APR for ${refinanceTerm} days`
      );
      setRefinanceRate("10.5");
      setRefinanceTerm("90");
      setShowRefinanceModal(false);
    } catch (error) {
      alert("Failed to refinance loan. Please try again.");
    }
  };

  const downloadStatements = () => {
    if (!activeLoan) return;

    const statementData = {
      loanId: activeLoan.id,
      borrower: "User Address: 0x1234...abcd",
      originalAmount: activeLoan.amount,
      currentBalance: activeLoan.totalOwed,
      interestRate: activeLoan.interestRate,
      startDate: activeLoan.startDate.toLocaleDateString(),
      dueDate: activeLoan.dueDate.toLocaleDateString(),
      paymentHistory: paymentHistory,
      generatedAt: new Date().toISOString(),
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(statementData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `loan-statement-${activeLoan.id}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getStatusColor = (status: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-3 w-3" />;
      case "interest":
        return <TrendingUp className="h-3 w-3" />;
      case "fee":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  if (!activeLoan) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Active Loans
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-sm text-muted-foreground">No active loans</div>
        </CardContent>
      </Card>
    );
  }

  const daysToDue = Math.ceil(
    (activeLoan.dueDate.getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Expanded Loan Management View
  if (showManageLoan) {
    return (
      <>
        <Card
          className={
            isExpanded ? "lg:col-span-2 lg:row-span-2" : "lg:col-span-2"
          }
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

                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      type="number"
                      step="0.01"
                      className="flex-1"
                    />
                    <Button
                      disabled={!paymentAmount || Number(paymentAmount) <= 0}
                      className="min-w-[120px]"
                      onClick={handlePayment}
                    >
                      {isProcessingPayment ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        "Pay Now"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right side - Details and Actions */}
              <div className="space-y-6">
                {/* Next Payment Info */}
                <div className="p-6 bg-white/70 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">
                    Next Payment Due
                  </h4>
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
                      <span className="text-muted-foreground">
                        Interest Rate
                      </span>
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowExtendModal(true)}
                    disabled={isProcessingExtension}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Extend Term
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowRefinanceModal(true)}
                    disabled={isProcessingRefinance}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refinance
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPaymentHistoryModal(true)}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={downloadStatements}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Statements
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals - Same as before but now using shared state and actions */}
        {/* Extend Term Modal */}
        <Modal
          isOpen={showExtendModal}
          onClose={() => setShowExtendModal(false)}
          title="Extend Loan Term"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Extend your loan due date. Additional interest will apply for the
              extended period.
            </p>

            <div>
              <Label htmlFor="extension-days">Extension Period</Label>
              <select
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700"
              >
                <option value="7">7 days (+$12.50 interest)</option>
                <option value="14">14 days (+$25.00 interest)</option>
                <option value="30">30 days (+$53.57 interest)</option>
                <option value="60">60 days (+$107.14 interest)</option>
                <option value="90">90 days (+$160.71 interest)</option>
              </select>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>New Due Date:</strong>{" "}
                {new Date(
                  activeLoan.dueDate.getTime() +
                    Number(extensionDays) * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowExtendModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExtendTerm}
                disabled={isProcessingExtension}
              >
                {isProcessingExtension ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Extend Loan
              </Button>
            </div>
          </div>
        </Modal>

        {/* Refinance Modal */}
        <Modal
          isOpen={showRefinanceModal}
          onClose={() => setShowRefinanceModal(false)}
          title="Refinance Loan"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Refinance your current loan with new terms. This will close your
              current loan and create a new one.
            </p>

            <div>
              <Label htmlFor="refi-rate">New Interest Rate</Label>
              <select
                value={refinanceRate}
                onChange={(e) => setRefinanceRate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700"
              >
                <option value="8.5">8.5% APR (Excellent Credit)</option>
                <option value="10.5">10.5% APR (Good Credit)</option>
                <option value="12.0">12.0% APR (Fair Credit)</option>
                <option value="15.0">15.0% APR (Poor Credit)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="refi-term">New Loan Term</Label>
              <select
                value={refinanceTerm}
                onChange={(e) => setRefinanceTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Monthly Savings:</strong> $
                {(
                  (((activeLoan.interestRate - Number(refinanceRate)) / 100) *
                    activeLoan.amount) /
                  12
                ).toFixed(2)}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRefinanceModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRefinance}
                disabled={isProcessingRefinance}
              >
                {isProcessingRefinance ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Refinance Loan
              </Button>
            </div>
          </div>
        </Modal>

        {/* Payment History Modal */}
        <Modal
          isOpen={showPaymentHistoryModal}
          onClose={() => setShowPaymentHistoryModal(false)}
          title="Payment History"
          className="max-w-3xl"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete transaction history for loan {activeLoan.id}
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(payment.type)}
                    <div>
                      <div className="font-medium">
                        ${formatAmount(payment.amount, 2)} {activeLoan.asset}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.date.toLocaleDateString()} • {payment.type}
                      </div>
                      {payment.transactionHash && (
                        <div className="text-xs text-blue-600 font-mono">
                          {payment.transactionHash}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPaymentHistoryModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Summary View (Default)
  return (
    <Card>
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
