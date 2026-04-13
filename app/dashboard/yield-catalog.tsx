"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useYieldOpportunities } from "@/hooks/dashboard/yield-opportunities";
import { YieldOpportunityCard } from "@/components/yield-opportunity-card";

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
                max={10}
                step={0.25}
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
          <YieldOpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
          />
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
