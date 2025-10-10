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
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WalletButton } from "@/components/ui/wallet-button";
import {
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from "chart.js";
import { formatCurrency, formatPercentage } from "@/hooks/dashboard/dashboard";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

export function PortfolioOverview() {
  const { portfolioData, earningsData, isLoading, error } =
    useDashboardContext();
  const [timeRange, setTimeRange] = useState("12m");
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

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const btcValue = data.btcEarnings || data.btcProjected;
      const adaValue = data.adaEarnings || data.adaProjected;
      const totalValue = data.total || data.totalProjected;
      const isProjected =
        data.btcProjected !== null && data.btcEarnings === null;

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-orange-400 rounded mr-2"></span>
              Bitcoin: ${btcValue}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-blue-400 rounded mr-2"></span>
              Cardano: ${adaValue}
            </p>
            <p className="text-sm font-semibold">Total: ${totalValue}</p>
            {isProjected && (
              <p className="text-xs text-gray-500 italic">Projected</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate derived values from portfolioData
  const isPositive = portfolioData.dailyChange > 0;

  if (isLoading)
    return <div className="p-4 text-center">Loading dashboard...</div>;
  if (error)
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 md:col-span-4">
          {/* Graph of past and future earnings */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Earnings Overview</CardTitle>
                  <CardDescription>
                    Historical performance and projected earnings across Bitcoin
                    and Other assets
                  </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6m">6M</SelectItem>
                    <SelectItem value="12m">12M</SelectItem>
                    <SelectItem value="24m">24M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={earningsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: "USD ($)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Historical stacked areas (solid) */}
                    <Area
                      type="monotone"
                      dataKey="btcEarnings"
                      stackId="1"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.6}
                      name="Bitcoin Earnings"
                      strokeWidth={2}
                      connectNulls={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="adaEarnings"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Cardano Earnings"
                      strokeWidth={2}
                      connectNulls={false}
                    />

                    {/* Projected stacked areas */}
                    <Area
                      type="monotone"
                      dataKey="btcProjected"
                      stackId="2"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.4}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Bitcoin Projected"
                      connectNulls={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="adaProjected"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Cardano Projected"
                      connectNulls={false}
                    />

                    {/* Historical total line (solid) */}
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#1f2937"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Total Earnings"
                      connectNulls={false}
                    />

                    {/* Projected total line (dashed) */}
                    <Line
                      type="monotone"
                      dataKey="totalProjected"
                      stroke="#1f2937"
                      strokeWidth={3}
                      strokeDasharray="8 4"
                      dot={{ r: 4, strokeDasharray: "0" }}
                      name="Total Projected"
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legend indicators */}
              <div className="flex justify-center mt-4 gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gray-800"></div>
                  <span>Historical Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 border-2 border-gray-800 border-dashed"></div>
                  <span>Projected Earnings</span>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    ${earningsData[earningsData.length - 1]?.btcProjected || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Projected BTC
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    ${earningsData[earningsData.length - 1]?.adaProjected || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Projected ADA
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    $
                    {earningsData[earningsData.length - 1]?.totalProjected || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Monthly
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Connection Section */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Wallet Connections</CardTitle>
            <CardDescription>
              View and connect wallets from different ecosystems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:gap-8">
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

              {/* Other */}
              <div className="flex-1 border rounded p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Other</span>
                </div>
                <WalletButton />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Summary Cards - Using portfolioData from hook */}
        <div className="col-span-2 grid gap-4 grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioData.totalValue)}
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
                {formatPercentage(portfolioData.dailyChangePercent)} (
                {formatCurrency(portfolioData.dailyChange)})
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bitcoin
              </CardTitle>
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
                {formatCurrency(portfolioData.monthlyRewards)}
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>
              Your Bitcoin is distributed across different yield strategies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolioData.positions.map((position, index) => {
              const percentage =
                (position.amount / portfolioData.totalBTC) * 100;
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
                        {formatCurrency(position.value)}
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
      </div>

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
