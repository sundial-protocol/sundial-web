"use client";

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
  TrendingUp,
  Coins,
  DollarSign,
  Droplets,
  Building2,
} from "lucide-react";
import Link from "next/link";
import {
  getLockPeriod,
  YieldOpportunity,
} from "@/hooks/dashboard/yield-opportunities";

interface YieldOpportunityCardProps {
  opportunity: YieldOpportunity;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

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

export function YieldOpportunityCard({
  opportunity,
  buttonText = "Start Earning",
  buttonHref = "/stake",
  onButtonClick,
  buttonVariant = "default",
}: YieldOpportunityCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(opportunity.type)}
            <CardTitle>{opportunity.name}</CardTitle>
          </div>
          <Badge className={getRiskColor(opportunity.risk)}>
            {opportunity.risk}
          </Badge>
        </div>
        <CardDescription>{opportunity.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between xl:px-12 transition-all">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {opportunity.apy}%
            </div>
            <div className="text-sm text-muted-foreground">APY</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {getLockPeriod(opportunity.locktime)}
            </div>
            <div className="text-sm text-muted-foreground">Lock Period</div>
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

        {onButtonClick ? (
          <Button
            className="w-full"
            variant={buttonVariant}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        ) : (
          <Button className="w-full" variant={buttonVariant} asChild>
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
