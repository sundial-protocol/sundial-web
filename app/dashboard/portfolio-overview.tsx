"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Bitcoin,
  Coins,
  Check,
  Copy,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet";
import {
  getWalletDisplayName,
  getWalletIcon,
  knownWalletExtensions,
} from "@/lib/wallet/support";
import { notifyError } from "@/lib/wallet/errors";
import { WalletButton } from "@/components/ui/wallet-button";

// Mock data - in real app, this would come from API
const portfolioData = {
  totalValue: 125000,
  totalBTC: 2.45,
  totalStaked: 1.8,
  totalLocked: 0.65,
  dailyChange: 2850,
  dailyChangePercent: 2.3,
  monthlyRewards: 325,
  positions: [
    {
      type: "Staked",
      amount: 1.8,
      value: 72000,
      apy: 8.5,
      risk: "Low",
      lockPeriod: "7 days",
    },
    {
      type: "Liquid Staking",
      amount: 0.65,
      value: 26000,
      apy: 7.2,
      risk: "Low",
      lockPeriod: "None",
    },
    {
      type: "Lending",
      amount: 0.5,
      value: 20000,
      apy: 12.3,
      risk: "Medium",
      lockPeriod: "30 days",
    },
    {
      type: "Available",
      amount: 0.5,
      value: 20000,
      apy: 0,
      risk: "No",
      lockPeriod: "None",
    },
  ],
};

export function PortfolioOverview() {
  const isPositive = portfolioData.dailyChange > 0;

  // Bitcoin wallet connection state (placeholder)
  const [btcWallet, setBtcWallet] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(addr: string) {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 1200);
  }

  const formatAddress = (address: string, length = 20) => {
    if (!address) return "";
    if (address.length <= length) return address;
    return `${address.slice(0, length)}...${address.slice(-6)}`;
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Section */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connections</CardTitle>
          <CardDescription>
            View and connect wallets from different ecosystems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            {/* Bitcoin */}
            <div className="flex-1 border rounded p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <Bitcoin className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Bitcoin</span>
              </div>
              {btcWallet ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs truncate">
                      {formatAddress(btcWallet)}
                    </span>
                    <button
                      onClick={() => handleCopy(btcWallet)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy address"
                    >
                      {copied === btcWallet ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBtcWallet(null)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setBtcWallet(null)}>
                  Connect Bitcoin Wallet
                </Button>
              )}
            </div>

            {/* Cardano */}
            <div className="flex-1 border rounded p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Cardano</span>
              </div>

              <WalletButton />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${portfolioData.totalValue.toLocaleString()}
            </div>
            <div
              className={`flex items-center text-xs ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {isPositive ? "+" : ""}$
              {portfolioData.dailyChange.toLocaleString()} (
              {isPositive ? "+" : ""}
              {portfolioData.dailyChangePercent}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bitcoin</CardTitle>
            <Bitcoin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioData.totalBTC} BTC
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioData.totalStaked} BTC staked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Rewards
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${portfolioData.monthlyRewards}
            </div>
            <p className="text-xs text-muted-foreground">
              From staking & lending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Low</div>
            <p className="text-xs text-muted-foreground">
              Conservative allocation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>
            Your Bitcoin is distributed across different yield strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolioData.positions.map((position, index) => {
            const percentage = (position.amount / portfolioData.totalBTC) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{position.type}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                      {position.risk} Risk
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {position.amount} BTC ({percentage.toFixed(1)}%)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${position.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>APY: {position.apy}%</span>
                  <span>Lock: {position.lockPeriod}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions to manage your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/stake">Stake Bitcoin</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard?tab=yield">Find Yield</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard?tab=strategies">View Strategies</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard?tab=transactions">View History</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
