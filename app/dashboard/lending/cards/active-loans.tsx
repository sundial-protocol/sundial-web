"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLending, usePaymentHistory } from "@/hooks/dashboard/lending";
// Get both transaction and loan context
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { PsbtSigning, usePsbtGeneration } from "@/components/btc/psbt-signing";
import {
  TransactionFlow,
  useTransactionFlow,
  TransactionMethod,
} from "@/components/transactions/transaction-flow";
import Modal from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useConfirmation } from "@/components/ui/confirmation";

interface ActiveLoansCardProps {
  isExpanded?: boolean;
}

export default function ActiveLoansCard({
  isExpanded = false,
}: ActiveLoansCardProps) {
  const {
    showManageLoan,
    setShowManageLoan,
    makePayment,
    extendLoan,
    refinanceLoan,
    isProcessingPayment,
    isProcessingExtension,
    isProcessingRefinance,
    // We'll get loans from dashboard context instead
    // loans,
    // activeLoans,
  } = useLending();

  // Get both transaction functions and loan data from dashboard context
  const {
    addPendingTransaction,
    updateTransactionStatus,
    getLendingTransactions,
    // Get loan data from dashboard context
    portfolioData,
    transactions,
  } = useDashboardContext();

  // Calculate active loans from dashboard transactions
  const activeLoans = useMemo(() => {
    // Get all loan creation transactions
    const loanCreationTxs = getLendingTransactions().filter(
      (tx) => tx.type === "loan_created" && tx.status === "completed"
    );

    // Get all loan payment transactions
    const loanPayments = getLendingTransactions().filter(
      (tx) => tx.type === "loan_payment" && tx.status === "completed"
    );

    // Calculate current loan states
    const loans = loanCreationTxs
      .map((creationTx) => {
        // Find all payments for this loan
        const payments = loanPayments.filter(
          (payment) => payment.loanId === creationTx.loanId
        );

        const totalPaid = payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        const originalAmount = creationTx.amount;
        const interestRate = creationTx.interestRate || 10.5;

        // Calculate days since loan creation
        const daysSinceCreation = Math.floor(
          (new Date().getTime() - creationTx.timestamp.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Calculate accrued interest (simple daily compounding)
        const dailyRate = interestRate / 100 / 365;
        const interestAccrued = originalAmount * dailyRate * daysSinceCreation;
        const totalOwed = originalAmount + interestAccrued;

        // Calculate due date (assume 30-day loans by default)
        const dueDate = new Date(
          creationTx.timestamp.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        // Calculate monthly payment (assuming 30-day term)
        const monthlyPayment = totalOwed / 1; // Single payment for 30-day loan

        return {
          id: creationTx.loanId || creationTx.id,
          type: creationTx.collateral ? "collateral" : "credit",
          amount: originalAmount,
          asset: creationTx.asset.toUpperCase(),
          interestRate,
          startDate: creationTx.timestamp,
          dueDate,
          status: totalPaid >= totalOwed ? "paid" : "active",
          totalOwed: Math.max(0, totalOwed - totalPaid),
          interestAccrued,
          monthlyPayment,
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentsRemaining: totalPaid >= totalOwed ? 0 : 1,
          totalPaid,
          interestPaid: Math.min(totalPaid, interestAccrued),
          collateral: creationTx.collateral,
          creationTxHash: creationTx.txHash,
          bitcoinVerified: creationTx.details?.includes("Bitcoin"),
        };
      })
      .filter((loan) => loan.status === "active" && loan.totalOwed > 0);

    return loans;
  }, [getLendingTransactions]);

  console.log("Active loans calculated from dashboard context:", {
    totalLoans: activeLoans.length,
    loans: activeLoans.map((loan) => ({
      id: loan.id,
      amount: loan.amount,
      totalOwed: loan.totalOwed,
      status: loan.status,
    })),
  });

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

  // Add the transaction flow hook
  const {
    isOpen: showPaymentFlow,
    config: paymentConfig,
    startTransaction,
    closeTransaction,
  } = useTransactionFlow();

  // Add the Bitcoin payment state
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [paymentPsbt, setPaymentPsbt] = useState("");

  // Add the PSBT generation hook
  const { generatePsbt, loading: generatingPsbt } = usePsbtGeneration();

  // Get the currently selected loan for management
  const selectedLoan = activeLoans.find((loan) => loan.id === selectedLoanId);

  // Calculate payment history from dashboard transactions
  const paymentHistory = useMemo(() => {
    if (!selectedLoan) return [];

    // Get all payment transactions for this loan
    const loanPayments = getLendingTransactions().filter(
      (tx) => tx.loanId === selectedLoan.id && tx.type === "loan_payment"
    );

    return loanPayments.map((payment) => ({
      id: payment.id,
      type: "payment",
      amount: payment.amount,
      date: payment.timestamp,
      status: payment.status,
      transactionHash: payment.txHash,
      loanId: payment.loanId,
    }));
  }, [selectedLoan, getLendingTransactions]);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showRefinanceModal, setShowRefinanceModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState("30");
  const [refinanceRate, setRefinanceRate] = useState("10.5");
  const [refinanceTerm, setRefinanceTerm] = useState("90");

  // Add the new hooks
  const { addToast } = useToast();
  const { confirm } = useConfirmation();

  // Toggle expanded view for a specific loan
  const toggleLoanExpansion = (loanId: string) => {
    const newExpanded = new Set(expandedLoans);
    if (newExpanded.has(loanId)) {
      newExpanded.delete(loanId);
    } else {
      newExpanded.add(loanId);
    }
    setExpandedLoans(newExpanded);
  };

  // Select a loan for management
  const selectLoanForManagement = (loanId: string) => {
    setSelectedLoanId(loanId);
    setShowManageLoan(true);
  };

  // Enhanced payment handler using dashboard transactions
  const handlePayment = async () => {
    if (!selectedLoan) return;

    const confirmed = await confirm({
      title: "Confirm Payment",
      message: `Are you sure you want to make a payment of $${paymentAmount} ${selectedLoan.asset}? This action cannot be undone.`,
      confirmText: "Make Payment",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    let transactionId = "";

    try {
      // Step 1: Create pending transaction in dashboard
      transactionId = addPendingTransaction(
        selectedLoan.asset.toLowerCase(),
        Number(paymentAmount),
        "loan_payment",
        {
          loanId: selectedLoan.id,
          details: `Payment of ${paymentAmount} ${
            selectedLoan.asset
          } for loan ${selectedLoan.id.slice(-6)}`,
        }
      );

      // Step 2: Process payment through lending system
      await makePayment(selectedLoan.id, Number(paymentAmount));

      // Step 3: Mark transaction as completed
      updateTransactionStatus(
        transactionId,
        "completed",
        `payment-${Date.now()}`
      );

      // Step 4: Reset form and close modal
      setPaymentAmount("");
      setShowManageLoan(false);

      addToast({
        type: "success",
        title: "Payment Successful",
        message: `Payment of $${paymentAmount} ${selectedLoan.asset} has been processed successfully.`,
      });

      console.log("Payment completed successfully:", {
        transactionId,
        loanId: selectedLoan.id,
        amount: paymentAmount,
      });
    } catch (error) {
      // Mark transaction as failed if something went wrong
      if (transactionId) {
        updateTransactionStatus(transactionId, "failed");
      }

      console.error("Payment failed:", error);
      addToast({
        type: "error",
        title: "Payment Failed",
        message: "Unable to process your payment. Please try again.",
      });
    }
  };

  // Enhanced quick payment with transaction logging
  const handleQuickPayment = async (loan: any, amount: number) => {
    let transactionId = "";

    try {
      // Create pending transaction first
      transactionId = addPendingTransaction(
        loan.asset.toLowerCase(),
        amount,
        "loan_payment",
        {
          loanId: loan.id,
          details: `Quick payment of ${amount} ${
            loan.asset
          } for loan ${loan.id.slice(-6)}`,
        }
      );

      // Show transaction flow with callback to complete the transaction
      const availableMethods: TransactionMethod[] = ["traditional", "bitcoin"];

      startTransaction({
        type: "loan_payment",
        amount,
        asset: loan.asset,
        availableMethods,
        details: {
          description: `Loan payment for loan #${loan.id}`,
          toAddress: "loan-payment-contract-address",
          benefits: [
            "Reduce outstanding balance",
            "Improve payment history",
            "Avoid late fees",
          ],
          fees: {
            traditional: 2.5,
            bitcoin: 0.25,
          },
        },
        onComplete: async (result) => {
          try {
            // Process payment through lending system
            await makePayment(loan.id, amount);

            // Mark transaction as completed
            updateTransactionStatus(transactionId, "completed");

            addToast({
              type: "success",
              title: "Payment Successful",
              message: `Payment of $${amount} via ${result.method} completed successfully.`,
            });
            closeTransaction();
          } catch (error) {
            updateTransactionStatus(transactionId, "failed");
            addToast({
              type: "error",
              title: "Payment Failed",
              message: "Unable to process your payment. Please try again.",
            });
            closeTransaction();
          }
        },
        onCancel: () => {
          // Mark transaction as failed if cancelled
          updateTransactionStatus(transactionId, "failed");
          closeTransaction();
        },
        showAsModal: true,
        title: `Pay Loan #${loan.id}`,
      });
    } catch (error) {
      if (transactionId) {
        updateTransactionStatus(transactionId, "failed");
      }
      addToast({
        type: "error",
        title: "Payment Setup Failed",
        message: "Unable to setup payment. Please try again.",
      });
    }
  };

  // Enhanced Bitcoin payment with transaction logging
  const handleBitcoinPayment = async (amount: number) => {
    if (!selectedLoan) return;

    let transactionId = "";

    try {
      // Step 1: Create pending Bitcoin payment transaction
      transactionId = addPendingTransaction(
        "btc", // Bitcoin payments
        amount / 50000, // Convert USD to BTC (assuming $50k BTC price)
        "loan_payment",
        {
          loanId: selectedLoan.id,
          details: `Bitcoin payment of $${amount} for loan ${selectedLoan.id.slice(
            -6
          )}`,
        }
      );

      // Step 2: Generate PSBT
      const psbt = await generatePsbt({
        sourceAddress: "user-btc-address", // Get from wallet context
        targetAddress: "loan-payment-address", // Loan payment address
        amount: amount / 50000, // Convert USD to BTC
        chain: "btc",
      });

      setPaymentPsbt(psbt);
      setShowBitcoinPayment(true);
    } catch (error) {
      if (transactionId) {
        updateTransactionStatus(transactionId, "failed");
      }

      addToast({
        type: "error",
        title: "Transaction Generation Failed",
        message:
          "Unable to generate Bitcoin payment transaction. Please try again.",
      });
    }
  };

  // Enhanced loan extension with transaction logging
  const handleExtendTerm = async () => {
    if (!selectedLoan) return;

    const confirmed = await confirm({
      title: "Extend Loan Term",
      message: `Extend loan by ${extensionDays} days? This will add interest charges.`,
      confirmText: "Extend Loan",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    let transactionId = "";

    try {
      // Create transaction for loan extension
      transactionId = addPendingTransaction(
        selectedLoan.asset.toLowerCase(),
        0, // No amount for extension
        "loan_extended",
        {
          loanId: selectedLoan.id,
          details: `Loan ${selectedLoan.id.slice(
            -6
          )} extended by ${extensionDays} days`,
        }
      );

      // Process extension
      await extendLoan(selectedLoan.id, Number(extensionDays));

      // Mark transaction as completed
      updateTransactionStatus(transactionId, "completed");

      const newDueDate = new Date(selectedLoan.dueDate);
      newDueDate.setDate(newDueDate.getDate() + Number(extensionDays));

      addToast({
        type: "success",
        title: "Loan Extended",
        message: `Loan extended by ${extensionDays} days. New due date: ${newDueDate.toLocaleDateString()}`,
      });

      setExtensionDays("30");
      setShowExtendModal(false);
    } catch (error) {
      if (transactionId) {
        updateTransactionStatus(transactionId, "failed");
      }
      addToast({
        type: "error",
        title: "Extension Failed",
        message: "Failed to extend loan. Please try again.",
      });
    }
  };

  // Enhanced loan refinancing with transaction logging
  const handleRefinance = async () => {
    if (!selectedLoan) return;

    const confirmed = await confirm({
      title: "Refinance Loan",
      message: `Refinance loan to ${refinanceRate}% APR for ${refinanceTerm} days? This will close your current loan and create a new one.`,
      confirmText: "Refinance",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    let transactionId = "";

    try {
      // Create transaction for loan refinancing
      transactionId = addPendingTransaction(
        selectedLoan.asset.toLowerCase(),
        selectedLoan.totalOwed,
        "loan_refinanced",
        {
          loanId: selectedLoan.id,
          interestRate: Number(refinanceRate),
          details: `Loan ${selectedLoan.id.slice(
            -6
          )} refinanced - ${refinanceRate}% APR for ${refinanceTerm} days`,
        }
      );

      // Process refinancing
      await refinanceLoan(
        selectedLoan.id,
        Number(refinanceRate),
        Number(refinanceTerm)
      );

      // Mark transaction as completed
      updateTransactionStatus(transactionId, "completed");

      addToast({
        type: "success",
        title: "Loan Refinanced",
        message: `Loan refinanced at ${refinanceRate}% APR for ${refinanceTerm} days`,
      });

      setRefinanceRate("10.5");
      setRefinanceTerm("90");
      setShowRefinanceModal(false);
    } catch (error) {
      if (transactionId) {
        updateTransactionStatus(transactionId, "failed");
      }
      addToast({
        type: "error",
        title: "Refinancing Failed",
        message: "Failed to refinance loan. Please try again.",
      });
    }
  };

  const downloadStatements = () => {
    if (!selectedLoan) return;

    // Include all transactions related to this loan
    const loanTransactions = getLendingTransactions().filter(
      (tx) => tx.loanId === selectedLoan.id
    );

    const statementData = {
      loanId: selectedLoan.id,
      borrower: "User Address: 0x1234...abcd",
      originalAmount: selectedLoan.amount,
      currentBalance: selectedLoan.totalOwed,
      interestRate: selectedLoan.interestRate,
      startDate: selectedLoan.startDate.toLocaleDateString(),
      dueDate: selectedLoan.dueDate.toLocaleDateString(),
      paymentHistory: paymentHistory,
      transactionHistory: loanTransactions, // Include all loan transactions
      generatedAt: new Date().toISOString(),
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(statementData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `loan-statement-${selectedLoan.id}.json`
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

  // Helper function to get status color for loan
  const getLoanStatusColor = (loan: any) => {
    const daysToDue = Math.ceil(
      (loan.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysToDue <= 0) return "bg-red-100 text-red-700";
    if (daysToDue <= 7) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const getLoanStatus = (loan: any) => {
    const daysToDue = Math.ceil(
      (loan.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysToDue <= 0) return "Overdue";
    if (daysToDue <= 7) return "Due Soon";
    return "Current";
  };

  // Show debug info when no active loans
  if (!activeLoans || activeLoans.length === 0) {
    const allLendingTxs = getLendingTransactions();
    const loanCreationTxs = allLendingTxs.filter(
      (tx) => tx.type === "loan_created"
    );

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Active Loans
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-sm text-muted-foreground mb-2">
            No active loans
          </div>
          {/* NEW: Debug information */}
          <div className="text-xs text-muted-foreground">
            {allLendingTxs.length} lending transactions found (
            {loanCreationTxs.length} loan creations)
          </div>
        </CardContent>
      </Card>
    );
  }

  // If managing a specific loan, show the detailed management view
  if (showManageLoan && selectedLoan) {
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
                Manage Loan #{selectedLoan.id}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowManageLoan(false);
                  setSelectedLoanId(null);
                }}
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
                      ${formatAmount(selectedLoan.amount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Original Amount
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-700">
                      ${formatAmount(selectedLoan.totalOwed, 2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Owed
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-700">
                      ${formatAmount(selectedLoan.interestAccrued, 2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Interest Accrued
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-700">
                      {selectedLoan.interestRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">APR</div>
                  </div>
                </div>

                {/* Due Date Warning */}
                {(() => {
                  const daysToDue = Math.ceil(
                    (selectedLoan.dueDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    daysToDue <= 7 && (
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
                    )
                  );
                })()}

                {/* Payment Interface */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Make Payment</Label>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPaymentAmount(selectedLoan.monthlyPayment.toString())
                      }
                      className="w-full justify-between"
                    >
                      Monthly Payment
                      <span className="font-bold">
                        ${formatAmount(selectedLoan.monthlyPayment, 2)}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPaymentAmount(selectedLoan.totalOwed.toString())
                      }
                      className="w-full justify-between"
                    >
                      Pay in Full
                      <span className="font-bold">
                        ${formatAmount(selectedLoan.totalOwed, 2)}
                      </span>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Custom amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      type="number"
                      step="0.01"
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      <Button
                        disabled={!paymentAmount || Number(paymentAmount) <= 0}
                        className="min-w-[100px]"
                        onClick={handlePayment}
                      >
                        {isProcessingPayment ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Pay USD"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={
                          !paymentAmount ||
                          Number(paymentAmount) <= 0 ||
                          generatingPsbt
                        }
                        onClick={() =>
                          handleBitcoinPayment(Number(paymentAmount))
                        }
                      >
                        {generatingPsbt ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Pay BTC"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Bitcoin Payment Instructions */}
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-sm text-orange-700 dark:text-orange-400">
                      <strong>Bitcoin Payments:</strong> Pay directly from your
                      Bitcoin wallet. Lower fees and instant settlement on
                      Bitcoin network.
                    </div>
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
                      ${formatAmount(selectedLoan.monthlyPayment, 2)}
                    </div>
                    <div className="text-muted-foreground">
                      Due: {selectedLoan.nextPaymentDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal</span>
                      <span className="font-medium">
                        ${formatAmount(selectedLoan.monthlyPayment * 0.8, 2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest</span>
                      <span className="font-medium">
                        ${formatAmount(selectedLoan.monthlyPayment * 0.2, 2)}
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
                        {selectedLoan.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Interest Rate
                      </span>
                      <span className="font-medium">
                        {selectedLoan.interestRate.toFixed(1)}% APR
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">
                        {selectedLoan.startDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium">
                        {selectedLoan.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payments Remaining
                      </span>
                      <span className="font-medium">
                        {selectedLoan.paymentsRemaining}
                      </span>
                    </div>
                    {/* Show collateral info if available */}
                    {selectedLoan.collateral && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Collateral
                        </span>
                        <span className="font-medium">
                          {selectedLoan.collateral.amount}{" "}
                          {selectedLoan.collateral.asset}
                        </span>
                      </div>
                    )}
                    {/* Show Bitcoin verification status */}
                    {selectedLoan.bitcoinVerified && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Verification
                        </span>
                        <span className="font-medium text-orange-600">
                          🟠 Bitcoin Verified
                        </span>
                      </div>
                    )}
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
                  selectedLoan.dueDate.getTime() +
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
                  (((selectedLoan.interestRate - Number(refinanceRate)) / 100) *
                    selectedLoan.amount) /
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
              Complete transaction history for loan {selectedLoan.id}
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
                        ${formatAmount(payment.amount, 2)} {selectedLoan.asset}
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

        {/* Bitcoin Payment Modal */}
        {showBitcoinPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Bitcoin Payment - ${paymentAmount}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBitcoinPayment(false);
                    setPaymentPsbt("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <PsbtSigning
                  psbtBase64={paymentPsbt}
                  targetAddress="loan-payment-address"
                  expectedAmount={Math.floor(
                    (Number(paymentAmount) * 100000000) / 50000
                  )} // Convert USD to sats
                  chain="btc"
                  onTransactionFound={(txid) => {
                    // Process the Bitcoin payment with transaction logging
                    makePayment(selectedLoan.id, Number(paymentAmount));

                    setShowBitcoinPayment(false);
                    setPaymentPsbt("");
                    setPaymentAmount("");

                    addToast({
                      type: "success",
                      title: "Bitcoin Payment Confirmed",
                      message: `Payment of $${paymentAmount} confirmed on Bitcoin network.`,
                    });
                  }}
                  onError={(error) => {
                    addToast({
                      type: "error",
                      title: "Bitcoin Payment Failed",
                      message: "Bitcoin payment failed. Please try again.",
                    });
                  }}
                  title={`Pay $${paymentAmount} in Bitcoin`}
                  description={`Complete your loan payment of $${paymentAmount} by signing this Bitcoin transaction`}
                  instructions="Sign this transaction in your Bitcoin wallet to complete your loan payment. The payment will be processed once the transaction is confirmed on the Bitcoin network."
                  showCard={false}
                />
              </div>
            </div>
          </div>
        )}

        {showPaymentFlow && paymentConfig && paymentConfig.type && (
          <TransactionFlow
            {...(paymentConfig as Required<typeof paymentConfig>)}
            showAsModal={true}
          />
        )}
      </>
    );
  }

  // Multi-loan overview
  return (
    <Card className={isExpanded ? "lg:col-span-2 lg:row-span-2" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Active Loans ({activeLoans.length})
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            Total: $
            {formatAmount(
              activeLoans.reduce((sum, loan) => sum + loan.totalOwed, 0),
              2
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeLoans.map((loan) => {
          const daysToDue = Math.ceil(
            (loan.dueDate.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const isExpanded = expandedLoans.has(loan.id);

          return (
            <div
              key={loan.id}
              className="border rounded-lg p-4 bg-white/50 hover:bg-white/70 transition-colors"
            >
              {/* Loan Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 px-2">
                  <h4 className="font-medium">Loan #{loan.id.slice(-6)}</h4>
                  <Badge className={getLoanStatusColor(loan)}>
                    {getLoanStatus(loan)}
                  </Badge>
                  {/* NEW: Show loan type indicator */}
                  {loan.type === "collateral" && (
                    <Badge variant="outline" className="text-xs">
                      Collateral
                    </Badge>
                  )}
                  {loan.bitcoinVerified && (
                    <Badge
                      variant="outline"
                      className="text-xs text-orange-600"
                    >
                      🟠 BTC
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    ${formatAmount(loan.totalOwed, 2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLoanExpansion(loan.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <div className="font-medium">
                    ${formatAmount(loan.amount, 0)} {loan.asset}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">APR</span>
                  <div className="font-medium">
                    {loan.interestRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date</span>
                  <div className="font-medium">
                    {loan.dueDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Days Left</span>
                  <div
                    className={`font-medium ${
                      daysToDue <= 7
                        ? "text-orange-600"
                        : daysToDue <= 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {daysToDue > 0
                      ? daysToDue
                      : `${Math.abs(daysToDue)} overdue`}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Interest Accrued
                      </span>
                      <div className="font-medium">
                        ${formatAmount(loan.interestAccrued, 2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Monthly Payment
                      </span>
                      <div className="font-medium">
                        ${formatAmount(loan.monthlyPayment, 2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Paid</span>
                      <div className="font-medium">
                        ${formatAmount(loan.totalPaid, 2)}
                      </div>
                    </div>
                    {/* NEW: Show collateral if present */}
                    {loan.collateral && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">
                          Collateral
                        </span>
                        <div className="font-medium">
                          {loan.collateral.amount} {loan.collateral.asset}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => selectLoanForManagement(loan.id)}
                    >
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleQuickPayment(loan, loan.monthlyPayment)
                      }
                    >
                      Quick Pay
                    </Button>
                  </div>
                </div>
              )}

              {/* Warning for overdue/due soon */}
              {daysToDue <= 7 && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    {daysToDue > 0
                      ? `Payment due in ${daysToDue} days`
                      : `Payment is ${Math.abs(daysToDue)} days overdue`}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary Actions */}
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {
                activeLoans.filter((loan) => {
                  const days = Math.ceil(
                    (loan.dueDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return days <= 7;
                }).length
              }{" "}
              loans need attention
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Expand all loans that need attention
                const needAttention = activeLoans
                  .filter((loan) => {
                    const days = Math.ceil(
                      (loan.dueDate.getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return days <= 7;
                  })
                  .map((loan) => loan.id);
                setExpandedLoans(new Set(needAttention));
              }}
            >
              Show Due Soon
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
