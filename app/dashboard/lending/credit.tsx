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
import { AlertTriangle, Badge, RefreshCw, Shield, Star, X } from "lucide-react";
import { useState } from "react";
import { usePsbtGeneration } from "@/components/btc/psbt-signing";
import {
  TransactionFlow,
  useTransactionFlow,
  TransactionMethod,
} from "@/components/transactions/transaction-flow";
import { useToast } from "@/components/ui/toast";
import { useConfirmation } from "@/components/ui/confirmation";

export default function CreditLoan() {
  const { addLoan, isProcessingNewLoan, stats } = useLending();
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
  const [showBitcoinCreditLoan, setShowBitcoinCreditLoan] = useState(false);
  const [creditLoanPsbt, setCreditLoanPsbt] = useState("");
  const { generatePsbt, loading: generatingPsbt } = usePsbtGeneration();

  // Mock credit score data - enhanced based on user's actual lending history
  const [creditScore, setCreditScore] = useState({
    score: 742 + stats.paymentSuccessRate * 0.5, // Boost score based on success rate
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
      liquidationEvents: 100, // No liquidations = 100%
      protocolUsage: 67,
    },
    creditLimit: Math.min(50000, 5000 + stats.totalLoans * 2500), // Increase limit with loan history
    interestRate: Math.max(5, 15 - stats.paymentSuccessRate * 0.1), // Better rate for good history
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

    // Update score based on current stats
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
    days: number
  ) => {
    const monthlyRate = rate / 100 / 12;
    const months = days / 30;
    const totalWithInterest = amount * (1 + (rate / 100) * (days / 365));
    return totalWithInterest / months;
  };

  const calculateOriginationFee = (amount: number) => {
    return amount * 0.01; // 1% origination fee
  };

  const handleBorrow = async () => {
    if (!borrowAmount) return;

    const originationFee = calculateOriginationFee(Number(borrowAmount));
    const netAmount = Number(borrowAmount) - originationFee;

    const confirmed = await confirm({
      title: "Create Credit-Based Loan",
      message: `Borrow: ${borrowAmount} ${borrowAsset}\nNet Amount (after fees): ${netAmount.toFixed(
        2
      )} ${borrowAsset}\nOrigination Fee: ${originationFee.toFixed(
        2
      )} ${borrowAsset}\nInterest Rate: ${creditScore.interestRate.toFixed(
        1
      )}% APR\nTerm: ${loanTerm} days\nCredit Score: ${creditScore.score} (${
        creditScore.grade
      })\n\nThis is an unsecured loan based on your credit history.`,
      confirmText: "Create Loan",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      const loanData = {
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
          Number(loanTerm)
        ),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentsRemaining: Math.ceil(Number(loanTerm) / 30),
        totalPaid: 0,
        interestPaid: 0,
      };

      await addLoan(loanData);

      // Reset form
      setBorrowAmount("");
      setLoanTerm("30");

      addToast({
        type: "success",
        title: "Credit Loan Created",
        message: `Borrowed: ${borrowAmount} ${borrowAsset}\nNet amount: ${netAmount.toFixed(
          2
        )} ${borrowAsset}\nOrigination fee: ${originationFee.toFixed(
          2
        )} ${borrowAsset}`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Loan Creation Failed",
        message: "Failed to create loan. Please try again.",
      });
      console.error("Loan creation error:", error);
    }
  };

  const handleBitcoinCreditLoan = async () => {
    if (!borrowAmount) return;

    const bitcoinSignatureRequired = Math.floor(
      Number(borrowAmount) * 0.1 * 100000000
    );

    const confirmed = await confirm({
      title: "Create Bitcoin-Backed Credit Loan",
      message: `Borrow: ${borrowAmount} ${borrowAsset}\nCredit Score Boost: +50 points for Bitcoin verification\nInterest Rate: ${(
        creditScore.interestRate * 0.7
      ).toFixed(
        1
      )}% APR (30% discount)\nTerm: ${loanTerm} days\n\nSign a small Bitcoin transaction (${(
        bitcoinSignatureRequired / 100000000
      ).toFixed(8)} BTC) to prove Bitcoin ownership and get better terms.`,
      confirmText: "Generate Transaction",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      const psbt = await generatePsbt({
        sourceAddress: "user-btc-address",
        targetAddress: "credit-verification-address",
        amount: bitcoinSignatureRequired / 100000000,
        chain: "btc",
      });

      setCreditLoanPsbt(psbt);
      setShowBitcoinCreditLoan(true);
    } catch (error) {
      addToast({
        type: "error",
        title: "Transaction Generation Failed",
        message:
          "Failed to generate credit verification transaction. Please try again.",
      });
    }
  };

  const isFormValid =
    borrowAmount &&
    Number(borrowAmount) <= creditScore.creditLimit &&
    Number(borrowAmount) > 0 &&
    creditScore.score >= 500; // Minimum score requirement

  const handleCreateCreditLoan = (withBitcoinBoost = false) => {
    if (!borrowAmount) return;

    const availableMethods: TransactionMethod[] = withBitcoinBoost
      ? ["bitcoin"]
      : ["traditional"];
    const enhancedRate = withBitcoinBoost
      ? creditScore.interestRate * 0.7
      : creditScore.interestRate;
    const originationFee = withBitcoinBoost
      ? Number(borrowAmount) * 0.005
      : Number(borrowAmount) * 0.01;

    startTransaction({
      type: withBitcoinBoost ? "verification" : "deposit",
      amount: withBitcoinBoost
        ? Number(borrowAmount) * 0.1
        : Number(borrowAmount), // 10% verification amount for Bitcoin
      asset: borrowAsset,
      availableMethods,
      details: {
        description: withBitcoinBoost
          ? `Verify Bitcoin ownership to unlock enhanced credit terms for ${borrowAmount} ${borrowAsset} loan`
          : `Create credit loan for ${borrowAmount} ${borrowAsset}`,
        toAddress: withBitcoinBoost
          ? "verification-address"
          : "credit-loan-address",
        benefits: withBitcoinBoost
          ? [
              "+50 credit score boost",
              "30% lower interest rate",
              "50% higher credit limit",
              "50% lower origination fee",
              `Enhanced rate: ${enhancedRate.toFixed(1)}% APR`,
            ]
          : [
              `Borrow ${borrowAmount} ${borrowAsset}`,
              `${creditScore.interestRate.toFixed(1)}% APR rate`,
              "Unsecured credit loan",
              "Build credit history",
            ],
        fees: {
          traditional: originationFee,
          bitcoin: originationFee,
        },
      },
      onComplete: async (result) => {
        try {
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
              Number(loanTerm)
            ),
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paymentsRemaining: Math.ceil(Number(loanTerm) / 30),
            totalPaid: 0,
            interestPaid: 0,
            bitcoinVerified: withBitcoinBoost,
            verificationTxid: result.txid,
          };

          await addLoan(loanData);

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
              withBitcoinBoost ? "Bitcoin-Verified" : ""
            } Credit Loan Created`,
            message: `Successfully borrowed ${borrowAmount} ${borrowAsset}. ${
              withBitcoinBoost
                ? `Enhanced rate: ${enhancedRate.toFixed(1)}% APR`
                : ""
            }`,
          });
        } catch (error) {
          addToast({
            type: "error",
            title: "Loan Creation Failed",
            message: "Failed to create loan. Please try again.",
          });
        } finally {
          closeTransaction();
        }
      },
      onCancel: closeTransaction,
      showAsModal: true,
      title: withBitcoinBoost
        ? "Bitcoin Credit Verification"
        : "Create Credit Loan",
    });
  };

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
                  Credit Limit
                </div>
              </div>
            </div>

            {/* Credit Factors */}
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

            <div className="text-xs text-muted-foreground">
              Credit limit: ${formatAmount(creditScore.creditLimit, 0)}
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
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Utilization */}
          {borrowAmount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Credit Utilization
                </span>
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

          {/* Loan Summary */}
          {isFormValid && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm font-medium mb-2">Loan Summary</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Origination Fee (1%):</span>
                  <span className="font-medium">
                    $
                    {formatAmount(
                      calculateOriginationFee(Number(borrowAmount)),
                      2
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Net Amount:</span>
                  <span className="font-medium">
                    $
                    {formatAmount(
                      Number(borrowAmount) -
                        calculateOriginationFee(Number(borrowAmount)),
                      2
                    )}
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
                        Number(loanTerm)
                      ),
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

          {/* High Utilization Warning */}
          {utilizationPercent > 70 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="text-xs text-orange-700 dark:text-orange-400">
                High utilization may negatively impact your credit score
              </div>
            </div>
          )}

          {/* Low Credit Score Warning */}
          {creditScore.score < 600 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="text-xs text-red-700 dark:text-red-400">
                Credit score below 600. Consider building credit history first.
              </div>
            </div>
          )}

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
                <Star className="w-4 h-4 mr-2" />
              )}
              Create Loan
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

          {/* Bitcoin Credit Benefits */}
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-sm text-orange-700 dark:text-orange-400">
              <strong>Bitcoin Credit Boost:</strong> Prove Bitcoin ownership for
              +50 credit score points, 30% lower interest rates, and higher
              credit limits.
            </div>
          </div>

          {/* Loan Terms - update to show Bitcoin benefits */}
          <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
            <div className="flex justify-between">
              <span>Interest rate:</span>
              <span>{creditScore.interestRate.toFixed(1)}% APR</span>
            </div>
            <div className="flex justify-between">
              <span>Bitcoin-verified rate:</span>
              <span className="text-orange-600 font-medium">
                {(creditScore.interestRate * 0.7).toFixed(1)}% APR (-30%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Loan term:</span>
              <span>{loanTerm} days (flexible)</span>
            </div>
            <div className="flex justify-between">
              <span>Origination fee:</span>
              <span>1.0%</span>
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
