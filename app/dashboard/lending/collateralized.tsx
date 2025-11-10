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
import { AlertTriangle, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function CollateralizedLoan() {
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
