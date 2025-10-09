"use client";

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
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  Coins,
  DollarSign,
  Droplets,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useYieldOpportunities } from "@/hooks/dashboard/yield-opportunities";

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

const getTypeIcon = (type: string) => {
  switch (type) {
    case "staking":
      return <Coins className="h-4 w-4" />;
    case "lending":
      return <DollarSign className="h-4 w-4" />;
    case "liquidity":
      return <Droplets className="h-4 w-4" />;
    case "alternative":
      return <Building2 className="h-4 w-4" />;
    default:
      return <TrendingUp className="h-4 w-4" />;
  }
};

export function YieldCatalog() {
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [minAPY, setMinAPY] = useState([0]);
  const [sortBy, setSortBy] = useState("apy");
  const { opportunities } = useYieldOpportunities();

  const filteredOpportunities = opportunities
    .filter((opp) => {
      const matchesType = filterType === "all" || opp.type === filterType;
      const matchesRisk = filterRisk === "all" || opp.risk === filterRisk;
      const matchesAPY = opp.apy >= minAPY[0];
      return matchesType && matchesRisk && matchesAPY;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy;
        case "risk":
          const riskOrder = { Low: 1, Medium: 2, High: 3 };
          return (
            riskOrder[a.risk as keyof typeof riskOrder] -
            riskOrder[b.risk as keyof typeof riskOrder]
          );
        case "locked":
          return b.totalLocked - a.totalLocked;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Yield Catalog</CardTitle>
          <CardDescription>
            Discover yield-generating opportunities for your Bitcoin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="staking">Staking</SelectItem>
                  <SelectItem value="lending">Lending</SelectItem>
                  <SelectItem value="liquidity">Liquidity</SelectItem>
                  <SelectItem value="alternative">Alternative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Risk Level
              </label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue placeholder="All Risks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
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
                max={20}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by APY" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apy">Highest APY</SelectItem>
                  <SelectItem value="risk">Lowest Risk</SelectItem>
                  <SelectItem value="locked">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOpportunities.map((opportunity) => (
          <Card
            key={opportunity.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(opportunity.type)}
                  <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                </div>
                <Badge className={getRiskColor(opportunity.risk)}>
                  {opportunity.risk}
                </Badge>
              </div>
              <CardDescription>{opportunity.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {opportunity.apy}%
                  </div>
                  <div className="text-sm text-muted-foreground">APY</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {opportunity.lockPeriod}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lock Period
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Min Amount:</span>
                  <span>{opportunity.minAmount} BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Locked:</span>
                  <span>${opportunity.totalLocked.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Provider:</span>
                  <span>{opportunity.provider}</span>
                </div>
              </div>

              <Button className="w-full" asChild>
                <Link href={opportunity.type === "staking" ? "/stake" : "#"}>
                  Start Earning
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No opportunities found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
