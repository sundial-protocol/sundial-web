"use client";

import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";

// Mock prebuilt strategies data
const strategies = [
  {
    id: 1,
    name: "Conservative Growth",
    description:
      "Low-risk strategy focused on stable returns with minimal volatility",
    risk: "Low",
    expectedAPY: 6.5,
    minAmount: 0.1,
    timeHorizon: "6 months",
    popularity: 95,
    allocation: [
      { type: "Bitcoin Staking", percentage: 60, apy: 8.5 },
      { type: "Liquid Staking", percentage: 30, apy: 7.2 },
      { type: "Stable Lending", percentage: 10, apy: 4.0 },
    ],
    features: [
      "Automated rebalancing",
      "Low volatility",
      "Stable returns",
      "Easy exit strategy",
    ],
    totalUsers: 1250,
    totalLocked: 850000,
    performance: {
      "1M": 0.52,
      "3M": 1.63,
      "6M": 3.12,
      "1Y": 6.45,
    },
  },
  {
    id: 2,
    name: "Balanced Yield",
    description: "Moderate risk strategy balancing growth and stability",
    risk: "Medium",
    expectedAPY: 10.2,
    minAmount: 0.05,
    timeHorizon: "3 months",
    popularity: 88,
    allocation: [
      { type: "Bitcoin Staking", percentage: 40, apy: 8.5 },
      { type: "BTC Lending", percentage: 35, apy: 12.3 },
      { type: "Liquid Staking", percentage: 25, apy: 7.2 },
    ],
    features: [
      "Moderate risk exposure",
      "Higher yields",
      "Diversified allocation",
      "Monthly rebalancing",
    ],
    totalUsers: 982,
    totalLocked: 650000,
    performance: {
      "1M": 0.85,
      "3M": 2.45,
      "6M": 5.12,
      "1Y": 10.18,
    },
  },
  {
    id: 3,
    name: "High Yield Hunter",
    description:
      "Aggressive strategy targeting maximum returns with higher risk",
    risk: "High",
    expectedAPY: 18.7,
    minAmount: 0.25,
    timeHorizon: "1 month",
    popularity: 72,
    allocation: [
      { type: "BTC-USDC LP", percentage: 40, apy: 15.7 },
      { type: "DeFi Lending", percentage: 35, apy: 22.5 },
      { type: "Yield Farming", percentage: 25, apy: 18.2 },
    ],
    features: [
      "Maximum yield potential",
      "Active management",
      "High liquidity",
      "Daily optimization",
    ],
    totalUsers: 456,
    totalLocked: 320000,
    performance: {
      "1M": 1.55,
      "3M": 4.72,
      "6M": 9.85,
      "1Y": 18.23,
    },
  },
  {
    id: 4,
    name: "Bitcoin Maximalist",
    description: "Pure Bitcoin strategy with no exposure to other assets",
    risk: "Low",
    expectedAPY: 8.8,
    minAmount: 0.01,
    timeHorizon: "1 year",
    popularity: 91,
    allocation: [
      { type: "Bitcoin Staking", percentage: 70, apy: 8.5 },
      { type: "Lightning Liquidity", percentage: 20, apy: 9.8 },
      { type: "Mining Pool", percentage: 10, apy: 7.2 },
    ],
    features: [
      "100% Bitcoin exposure",
      "No altcoin risk",
      "Long-term focus",
      "Network security support",
    ],
    totalUsers: 1580,
    totalLocked: 1200000,
    performance: {
      "1M": 0.73,
      "3M": 2.21,
      "6M": 4.42,
      "1Y": 8.75,
    },
  },
  {
    id: 5,
    name: "DeFi Explorer",
    description: "Experimental strategy exploring cutting-edge DeFi protocols",
    risk: "High",
    expectedAPY: 24.5,
    minAmount: 0.5,
    timeHorizon: "2 weeks",
    popularity: 58,
    allocation: [
      { type: "New Protocol A", percentage: 35, apy: 28.5 },
      { type: "Experimental LP", percentage: 30, apy: 22.3 },
      { type: "Beta Staking", percentage: 35, apy: 21.8 },
    ],
    features: [
      "Early access to protocols",
      "Highest potential returns",
      "Regular strategy updates",
      "Expert management",
    ],
    totalUsers: 187,
    totalLocked: 95000,
    performance: {
      "1M": 2.05,
      "3M": 6.12,
      "6M": 12.45,
      "1Y": 23.87,
    },
  },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "High":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRiskIcon = (risk: string) => {
  switch (risk) {
    case "Low":
      return <Shield className="h-4 w-4 text-green-600" />;
    case "Medium":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case "High":
      return <Zap className="h-4 w-4 text-red-600" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
};

export function PrebuiltStrategies() {
  const [filterRisk, setFilterRisk] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [minAPY, setMinAPY] = useState([0]); // Add this line

  const filteredStrategies = strategies
    .filter((strategy) => {
      const matchesRisk = filterRisk === "all" || strategy.risk === filterRisk;
      const matchesAPY = strategy.expectedAPY >= minAPY[0]; // Add this line
      return matchesRisk && matchesAPY; // Update this line
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.expectedAPY - a.expectedAPY;
        case "risk":
          const riskOrder = { Low: 1, Medium: 2, High: 3 };
          return (
            riskOrder[a.risk as keyof typeof riskOrder] -
            riskOrder[b.risk as keyof typeof riskOrder]
          );
        case "popularity":
          return b.popularity - a.popularity;
        case "locked":
          return b.totalLocked - a.totalLocked;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Prebuilt Strategies</CardTitle>
          <CardDescription>
            Choose from professionally managed investment strategies tailored to
            different risk profiles and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Risk Level
              </label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Min APY: {minAPY[0]}%
              </label>
              <Slider
                value={minAPY}
                onValueChange={setMinAPY}
                max={25}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Most Popular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="apy">Highest APY</SelectItem>
                  <SelectItem value="risk">Lowest Risk</SelectItem>
                  <SelectItem value="locked">Most Trusted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStrategies.map((strategy) => (
          <Card
            key={strategy.id}
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedStrategy === strategy.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() =>
              setSelectedStrategy(
                selectedStrategy === strategy.id ? null : strategy.id
              )
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRiskIcon(strategy.risk)}
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRiskColor(strategy.risk)}>
                    {strategy.risk}
                  </Badge>
                  {strategy.popularity > 90 && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </div>
              <CardDescription>{strategy.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {strategy.expectedAPY}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expected APY
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {strategy.timeHorizon}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time Horizon
                  </div>
                </div>
              </div>

              {/* Popularity */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Popularity</span>
                  <span>{strategy.popularity}%</span>
                </div>
                <Progress value={strategy.popularity} className="h-2" />
              </div>

              {/* Strategy Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Min Amount:</span>
                  <span>{strategy.minAmount} BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Users:</span>
                  <span>{strategy.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Locked:</span>
                  <span>${strategy.totalLocked.toLocaleString()}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedStrategy === strategy.id && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Asset Allocation */}
                  <div>
                    <h4 className="font-medium mb-2">Asset Allocation</h4>
                    <div className="space-y-2">
                      {strategy.allocation.map((allocation, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{allocation.type}</span>
                            <span>
                              {allocation.percentage}% ({allocation.apy}% APY)
                            </span>
                          </div>
                          <Progress
                            value={allocation.percentage}
                            className="h-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance */}
                  <div>
                    <h4 className="font-medium mb-2">Historical Performance</h4>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          +{strategy.performance["1M"]}%
                        </div>
                        <div className="text-muted-foreground">1M</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          +{strategy.performance["3M"]}%
                        </div>
                        <div className="text-muted-foreground">3M</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          +{strategy.performance["6M"]}%
                        </div>
                        <div className="text-muted-foreground">6M</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          +{strategy.performance["1Y"]}%
                        </div>
                        <div className="text-muted-foreground">1Y</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {strategy.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Button className="w-full" asChild>
                <Link href="/stake">Deploy Strategy</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStrategies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No strategies found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                How Prebuilt Strategies Work
              </h4>
              <p className="text-sm text-blue-700">
                These strategies are professionally managed and automatically
                rebalanced based on market conditions. You can enter or exit
                most strategies at any time, though some may have minimum lock
                periods. All strategies are backtested and monitored by our team
                of DeFi experts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
