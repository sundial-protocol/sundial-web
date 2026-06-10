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
import { formatAmount } from "@/hooks/dashboard/prices";
import { useLending } from "@/hooks/dashboard/lending";
// Import dashboard context for transaction recording
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import {
  AlertTriangle,
  Badge,
  RefreshCw,
  Shield,
  Download,
} from "lucide-react";
import { useState } from "react";
import {
  TransactionFlow,
  useTransactionFlow,
  TransactionMethod,
} from "@/components/transactions/transaction-flow";
import { useToast } from "@/components/ui/toast";
import { useConfirmation } from "@/components/ui/confirmation";

export default function CreditLoan() {
  const { addLoan, isProcessingNewLoan, stats } = useLending();

  // Get dashboard context for transaction recording
  const { addPendingTransaction, updateTransactionStatus } =
    useDashboardContext();

  const {
    isOpen: showCreditFlow,
    config: creditConfig,
    startTransaction,
    closeTransaction,
  } = useTransactionFlow();
  const { addToast } = useToast();
  const { confirm } = useConfirmation();

  const [borrowAsset, setBorrowAsset] = useState("USDC");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("30");
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Mock credit score data - enhanced based on user's actual lending history
  const [creditScore, setCreditScore] = useState({
    score: 742 + stats.paymentSuccessRate * 0.5,
    grade:
      stats.paymentSuccessRate > 90
        ? "A"
        : stats.paymentSuccessRate > 80
          ? "A-"
          : "B+",
    factors: {
      paymentHistory: Math.min(95, stats.paymentSuccessRate + 5),
      accountAge: 78,
      transactionVolume: 82,
      liquidationEvents: 100,
      protocolUsage: 67,
    },
    creditLimit: Math.min(50000, 5000 + stats.totalLoans * 2500),
    interestRate: Math.max(5, 15 - stats.paymentSuccessRate * 0.1),
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newScore =
      742 +
      stats.paymentSuccessRate * 0.5 +
      Math.floor(Math.random() * 20 - 10);
    const newGrade =
      newScore >= 800
        ? "A+"
        : newScore >= 750
          ? "A"
          : newScore >= 700
            ? "A-"
            : "B+";

    setCreditScore((prev) => ({
      ...prev,
      score: Math.max(300, Math.min(850, newScore)),
      grade: newGrade,
      factors: {
        ...prev.factors,
        paymentHistory: Math.min(100, stats.paymentSuccessRate + 5),
      },
      creditLimit: Math.min(50000, 5000 + stats.totalLoans * 2500),
      interestRate: Math.max(5, 15 - stats.paymentSuccessRate * 0.1),
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

  const calculateDueDate = (days: number) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  };

  const calculateMonthlyPayment = (
    amount: number,
    rate: number,
    days: number,
  ) => {
    const months = days / 30;
    const totalWithInterest = amount * (1 + (rate / 100) * (days / 365));
    return totalWithInterest / months;
  };

  const calculateOriginationFee = (amount: number) => {
    return amount * 0.01; // 1% origination fee
  };

  // UPDATED: Direct loan creation handler (traditional flow)
  const _handleBorrow = async () => {
    if (!borrowAmount) return;

    const originationFee = calculateOriginationFee(Number(borrowAmount));
    const netAmount = Number(borrowAmount) - originationFee;

    const confirmed = await confirm({
      title: "Create Credit-Based Loan",
      message: `You will receive: ${netAmount.toFixed(
        2,
      )} ${borrowAsset}\nLoan Amount: ${borrowAmount} ${borrowAsset}\nOrigination Fee: ${originationFee.toFixed(
        2,
      )} ${borrowAsset}\nInterest Rate: ${creditScore.interestRate.toFixed(
        1,
      )}% APR\nTerm: ${loanTerm} days\nCredit Score: ${creditScore.score} (${
        creditScore.grade
      })\n\nThis is an unsecured loan - no collateral required.`,
      confirmText: "Receive Loan",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    let transactionId = "";

    try {
      // Create pending transaction first
      transactionId = addPendingTransaction(
        borrowAsset.toLowerCase(),
        Number(borrowAmount),
        "loan_created",
        {
          details: `Credit loan approved - receiving ${netAmount.toFixed(
            2,
          )} ${borrowAsset} at ${creditScore.interestRate.toFixed(1)}% APR`,
          interestRate: creditScore.interestRate,
        },
      );

      const _loanData = {
        type: "credit" as const,
        amount: Number(borrowAmount),
        asset: borrowAsset,
        interestRate: creditScore.interestRate,
        startDate: new Date(),
        dueDate: calculateDueDate(Number(loanTerm)),
        status: "active" as const,
        totalOwed:
          Number(borrowAmount) +
          (((Number(borrowAmount) * creditScore.interestRate) / 100) *
            Number(loanTerm)) /
            365,
        interestAccrued: 0,
        monthlyPayment: calculateMonthlyPayment(
          Number(borrowAmount),
          creditScore.interestRate,
          Number(loanTerm),
        ),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentsRemaining: Math.ceil(Number(loanTerm) / 30),
        totalPaid: 0,
        interestPaid: 0,
      };

      // Mark transaction as completed
      updateTransactionStatus(transactionId, "completed");

      // Reset form
      setBorrowAmount("");
      setLoanTerm("30");

      addToast({
        type: "success",
        title: "Credit Loan Approved!",
        message: `You will receive: ${netAmount.toFixed(
          2,
        )} ${borrowAsset}\nOrigination fee: ${originationFee.toFixed(
          2,
        )} ${borrowAsset}\nFunds will be transferred to your account.`,
      });
    } catch {
      // Mark transaction as failed
      if (transactionId) {
        updateTransactionStatus(transactionId, "failed");
      }

      addToast({
        type: "error",
        title: "Loan Application Failed",
        message: "Failed to process your loan application. Please try again.",
      });
    }
  };

  // Enhanced transaction flow handler
  const handleCreateCreditLoan = (withBitcoinBoost = false) => {
    if (!borrowAmount) return;

    const availableMethods: TransactionMethod[] = ["traditional"];
    if (withBitcoinBoost) {
      availableMethods.push("bitcoin");
    }

    const enhancedRate = withBitcoinBoost
      ? creditScore.interestRate * 0.7
      : creditScore.interestRate;
    const originationFee = withBitcoinBoost
      ? Number(borrowAmount) * 0.005
      : Number(borrowAmount) * 0.01;
    const netAmount = Number(borrowAmount) - originationFee;

    startTransaction({
      type: "loan_created",
      amount: netAmount, // Show net amount user will receive
      asset: borrowAsset,
      availableMethods,
      details: {
        description: withBitcoinBoost
          ? `Verify Bitcoin ownership for enhanced credit terms and receive ${netAmount.toFixed(
              2,
            )} ${borrowAsset}`
          : `Receive ${netAmount.toFixed(
              2,
            )} ${borrowAsset} credit loan (after ${originationFee.toFixed(
              2,
            )} ${borrowAsset} origination fee)`,
        toAddress: "your-wallet-address",
        benefits: withBitcoinBoost
          ? [
              "+50 credit score boost",
              "30% lower interest rate",
              "50% higher credit limit",
              "50% lower origination fee",
              `Enhanced rate: ${enhancedRate.toFixed(1)}% APR`,
              `You receive: ${(Number(borrowAmount) * 0.995).toFixed(
                2,
              )} ${borrowAsset}`,
            ]
          : [
              `Receive ${netAmount.toFixed(2)} ${borrowAsset}`,
              `${creditScore.interestRate.toFixed(1)}% APR rate`,
              "No collateral required",
              "Build credit history",
              "Instant approval",
            ],
        fees: {
          traditional: originationFee,
          bitcoin: originationFee * 0.5, // Lower fee for Bitcoin verification
        },
      },
      onComplete: async (result) => {
        let transactionId = "";

        try {
          // Create pending transaction for loan disbursement
          transactionId = addPendingTransaction(
            borrowAsset.toLowerCase(),
            Number(borrowAmount),
            "loan_created",
            {
              details: withBitcoinBoost
                ? `Bitcoin-verified credit loan - receiving ${netAmount.toFixed(
                    2,
                  )} ${borrowAsset} at ${enhancedRate.toFixed(1)}% APR`
                : `Credit loan approved - receiving ${netAmount.toFixed(
                    2,
                  )} ${borrowAsset} at ${enhancedRate.toFixed(1)}% APR`,
              interestRate: enhancedRate,
            },
          );

          const loanData = {
            type: "credit" as const,
            amount: Number(borrowAmount),
            asset: borrowAsset,
            interestRate: enhancedRate,
            startDate: new Date(),
            dueDate: calculateDueDate(Number(loanTerm)),
            status: "active" as const,
            totalOwed:
              Number(borrowAmount) +
              (((Number(borrowAmount) * enhancedRate) / 100) *
                Number(loanTerm)) /
                365,
            interestAccrued: 0,
            monthlyPayment: calculateMonthlyPayment(
              Number(borrowAmount),
              enhancedRate,
              Number(loanTerm),
            ),
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paymentsRemaining: Math.ceil(Number(loanTerm) / 30),
            totalPaid: 0,
            interestPaid: 0,
            bitcoinVerified: withBitcoinBoost,
            verificationTxid: result.txid,
            disbursementMethod: result.method,
          };

          await addLoan(loanData);

          // Mark transaction as completed with loan ID
          updateTransactionStatus(transactionId, "completed");

          if (withBitcoinBoost) {
            setCreditScore((prev) => ({
              ...prev,
              score: Math.min(850, prev.score + 50),
              creditLimit: prev.creditLimit * 1.5,
            }));
          }

          setBorrowAmount("");
          setLoanTerm("30");

          addToast({
            type: "success",
            title: `${
              withBitcoinBoost ? "Bitcoin-Verified " : ""
            }Credit Loan Approved!`,
            message: `Funds disbursed: ${netAmount.toFixed(
              2,
            )} ${borrowAsset}\nMethod: ${result.method}\n${
              withBitcoinBoost
                ? `Enhanced rate: ${enhancedRate.toFixed(1)}% APR`
                : ""
            }`,
          });

          console.log("✅ Credit loan disbursement completed:", {
            transactionId,
            method: result.method,
            netAmount: netAmount.toFixed(2),
            bitcoinBoost: withBitcoinBoost,
          });
        } catch (error) {
          // Mark transaction as failed
          if (transactionId) {
            updateTransactionStatus(transactionId, "failed");
          }

          addToast({
            type: "error",
            title: "Loan Disbursement Failed",
            message: "Failed to disburse loan funds. Please try again.",
          });
          console.error("❌ Credit loan disbursement failed:", error);
        } finally {
          closeTransaction();
        }
      },
      onCancel: () => {
        console.log("📝 Credit loan application cancelled by user");
        closeTransaction();
      },
      showAsModal: true,
      title: withBitcoinBoost
        ? "Bitcoin Credit Verification & Disbursement"
        : "Credit Loan Disbursement",
    });
  };

  const isFormValid =
    borrowAmount &&
    Number(borrowAmount) <= creditScore.creditLimit &&
    Number(borrowAmount) > 0 &&
    creditScore.score >= 500;

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Credit-Based Loan</CardTitle>
            <div className="text-2xl font-bold text-purple-600">
              {creditScore.interestRate.toFixed(1)}%
            </div>
          </div>
          {/* UPDATED: Clarify this is about receiving funds */}
          <p className="text-sm text-muted-foreground">
            Receive funds instantly - no collateral required
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Credit Score Display - no changes needed */}
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
                    creditScore.score,
                  )}`}
                >
                  {creditScore.score.toFixed(0)}
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
                <div className="text-sm text-muted-foreground">
                  Available Credit
                </div>
              </div>
            </div>

            {/* Credit Factors - unchanged */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Payment History</span>
                  <span className="font-medium">
                    {creditScore.factors.paymentHistory.toFixed(0)}%
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

          {/* UPDATED: Borrow Section - emphasize receiving money */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Amount to Receive
            </Label>

            <div className="flex gap-2">
              <Select value={borrowAsset} onValueChange={setBorrowAsset}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="DJED">DJED</SelectItem>
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
                  disabled={isProcessingNewLoan}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                  onClick={() =>
                    setBorrowAmount(creditScore.creditLimit.toString())
                  }
                  disabled={isProcessingNewLoan}
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* UPDATED: Clarify this is about credit availability */}
            <div className="text-xs text-muted-foreground">
              Available to borrow: ${formatAmount(creditScore.creditLimit, 0)}
            </div>

            {/* NEW: Show what user will actually receive after fees */}
            {borrowAmount && Number(borrowAmount) > 0 && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="text-sm text-green-700 dark:text-green-400">
                  <Download className="w-4 h-4 inline mr-1" />
                  You will receive: $
                  {formatAmount(
                    Number(borrowAmount) -
                      calculateOriginationFee(Number(borrowAmount)),
                    2,
                  )}{" "}
                  {borrowAsset}
                </div>
              </div>
            )}
          </div>

          {/* Loan Term - unchanged */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Repayment Term
            </Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Utilization - unchanged */}
          {borrowAmount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Credit Utilization
                </span>
                <span
                  className={`font-medium ${getUtilizationColor(
                    utilizationPercent,
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

          {/* UPDATED: Loan Summary - emphasize what user receives */}
          {isFormValid && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm font-medium mb-2">Loan Summary</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Loan Amount:</span>
                  <span className="font-medium">
                    ${formatAmount(Number(borrowAmount), 2)} {borrowAsset}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Origination Fee (1%):</span>
                  <span className="font-medium">
                    -$
                    {formatAmount(
                      calculateOriginationFee(Number(borrowAmount)),
                      2,
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-green-700 font-medium">
                    You Receive:
                  </span>
                  <span className="font-bold text-green-700">
                    $
                    {formatAmount(
                      Number(borrowAmount) -
                        calculateOriginationFee(Number(borrowAmount)),
                      2,
                    )}{" "}
                    {borrowAsset}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Payment:</span>
                  <span className="font-medium">
                    $
                    {formatAmount(
                      calculateMonthlyPayment(
                        Number(borrowAmount),
                        creditScore.interestRate,
                        Number(loanTerm),
                      ),
                      2,
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

          {/* Warning sections - unchanged */}
          {utilizationPercent > 70 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="text-xs text-orange-700 dark:text-orange-400">
                High utilization may negatively impact your credit score
              </div>
            </div>
          )}

          {creditScore.score < 600 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="text-xs text-red-700 dark:text-red-400">
                Credit score below 600. Consider building credit history first.
              </div>
            </div>
          )}

          {/* Action Buttons - emphasize receiving funds */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              disabled={!isFormValid || isProcessingNewLoan}
              onClick={() => handleCreateCreditLoan(false)}
            >
              {isProcessingNewLoan ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Get Loan
            </Button>

            <Button
              variant="outline"
              size="lg"
              disabled={!isFormValid}
              onClick={() => handleCreateCreditLoan(true)}
            >
              🟠 Bitcoin Boost
            </Button>
          </div>

          {/* Bitcoin Credit Benefits - clarify the flow */}
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-sm text-orange-700 dark:text-orange-400">
              <strong>Bitcoin Credit Boost:</strong> Verify Bitcoin ownership
              for +50 credit score points, 30% lower interest rates, and higher
              credit limits. No Bitcoin deposit required - just proof of
              ownership.
            </div>
          </div>

          {/* Loan Terms - clarify the benefits */}
          <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
            <div className="flex justify-between">
              <span>Standard interest rate:</span>
              <span>{creditScore.interestRate.toFixed(1)}% APR</span>
            </div>
            <div className="flex justify-between">
              <span>Bitcoin-verified rate:</span>
              <span className="text-orange-600 font-medium">
                {(creditScore.interestRate * 0.7).toFixed(1)}% APR (-30%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Repayment term:</span>
              <span>{loanTerm} days (flexible)</span>
            </div>
            <div className="flex justify-between">
              <span>Origination fee:</span>
              <span>1.0% (deducted from loan amount)</span>
            </div>
            <div className="flex justify-between">
              <span>Collateral required:</span>
              <span className="text-green-600 font-medium">None</span>
            </div>
            <div className="flex justify-between">
              <span>Credit check:</span>
              <span>Soft inquiry (no impact)</span>
            </div>
            <div className="flex justify-between">
              <span>Based on {stats.totalLoans} loan history:</span>
              <span>{stats.paymentSuccessRate.toFixed(0)}% success rate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreditFlow && creditConfig && (
        <TransactionFlow
          {...(creditConfig as Required<typeof creditConfig>)}
          showAsModal={true}
        />
      )}
    </>
  );
}
