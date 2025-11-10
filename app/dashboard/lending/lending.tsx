"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import LendingStatsCard from "./cards/lending-stats";
import PortfolioCard from "./cards/portfolio-card";
import RecentActivityCard from "./cards/recent-activity";
import ActiveLoanCard from "./cards/active-loan";
import CollateralizedLoan from "./collateralized";
import CreditLoan from "./credit";

export interface LoanHistory {
  id: string;
  type: "collateral" | "credit";
  amount: number;
  asset: string;
  collateral?: {
    amount: number;
    asset: string;
  };
  interestRate: number;
  startDate: Date;
  dueDate: Date;
  status: "active" | "paid" | "overdue" | "liquidated";
  totalPaid: number;
  interestPaid: number;
}

export default function LendingTab() {
  const [showManageLoan, setShowManageLoan] = useState(false);
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-min">
        {/* Main Loan Interface */}
        <div className="lg:col-span-2 lg:row-span-3">
          <Tabs defaultValue="collateral" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="collateral">Collateral Loan</TabsTrigger>
              <TabsTrigger value="credit">Credit Loan</TabsTrigger>
            </TabsList>

            <TabsContent value="collateral">
              <CollateralizedLoan />
            </TabsContent>

            <TabsContent value="credit">
              <CreditLoan />
            </TabsContent>
          </Tabs>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <div className="font-medium mb-1">
                  Powered by Onchain Credit
                </div>
                <div>
                  Your credit score is calculated from blockchain data including
                  payment history, transaction patterns, and DeFi protocol
                  usage. No traditional credit check required.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        {!showManageLoan && <PortfolioCard />}
        {!showManageLoan && <LendingStatsCard />}
        <ActiveLoanCard
          showManageLoan={showManageLoan}
          setShowManageLoan={setShowManageLoan}
        />
        {!showManageLoan && <RecentActivityCard />}
      </div>
    </div>
  );
}
