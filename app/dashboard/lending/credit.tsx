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
import { AlertTriangle, Badge, RefreshCw, Shield, Star } from "lucide-react";
import { useState } from "react";

export interface CreditScore {
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

export default function CreditLoan() {
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
