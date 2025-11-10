"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, X } from "lucide-react";
import LendingStatsCard from "./cards/lending-stats";
import ActiveLoanCard from "./cards/active-loan";
import CollateralizedLoan from "./collateralized";
import CreditLoan from "./credit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioActivityCard from "./cards/portfolio-card";

export default function LendingTab() {
  const [showManageLoan, setShowManageLoan] = useState(false);
  const [showFullLoanInterface, setShowFullLoanInterface] = useState(false);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
        {/* Full Loan Interface Card - Takes 2x2 when expanded */}
        {showFullLoanInterface ? (
          <FullLoanInterfaceCard
            onClose={() => setShowFullLoanInterface(false)}
          />
        ) : (
          !showManageLoan && (
            <LoanInterfaceSummaryCard
              onExpand={() => setShowFullLoanInterface(true)}
            />
          )
        )}

        <PortfolioActivityCard />

        {/* Active Loan Card - Normal or expanded */}
        {!showFullLoanInterface && (
          <ActiveLoanCard
            showManageLoan={showManageLoan}
            setShowManageLoan={setShowManageLoan}
            isExpanded={showManageLoan}
          />
        )}

        {/* Sidebar Cards - Hide when expanded views are shown */}
        {!showFullLoanInterface && !showManageLoan && <LendingStatsCard />}
      </div>
    </div>
  );
}

// Summary Card Component for the Loan Interface
function LoanInterfaceSummaryCard({ onExpand }: { onExpand: () => void }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Apply for Loan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Get instant access to liquidity with our flexible lending options.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Collateral Loan Summary */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
              Collateral Loan
            </h3>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-medium">8-15% APR</span>
              </div>
              <div className="flex justify-between">
                <span>Max LTV:</span>
                <span className="font-medium">80%</span>
              </div>
              <div className="flex justify-between">
                <span>Term:</span>
                <span className="font-medium">7-365 days</span>
              </div>
            </div>
          </div>

          {/* Credit Loan Summary */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium mb-2 text-green-900 dark:text-green-100">
              Credit Loan
            </h3>
            <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-medium">5-25% APR</span>
              </div>
              <div className="flex justify-between">
                <span>Max Amount:</span>
                <span className="font-medium">$50,000</span>
              </div>
              <div className="flex justify-between">
                <span>Term:</span>
                <span className="font-medium">30-360 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                $2.4M
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Lent</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                12.5%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Avg APR</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                847
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Active Loans
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full mt-4" onClick={onExpand}>
          Apply for Loan
        </Button>

        {/* Info Footer */}
        <div className="text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield className="h-3 w-3 mt-0.5" />
            <div>
              Powered by Onchain Credit - No traditional credit check required
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Full Loan Interface Component - Takes 2x2 grid space
function FullLoanInterfaceCard({ onClose }: { onClose: () => void }) {
  return (
    <Card className="lg:col-span-2 lg:row-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">New Loan Application</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
              <div className="font-medium mb-1">Powered by Onchain Credit</div>
              <div>
                Your credit score is calculated from blockchain data including
                payment history, transaction patterns, and DeFi protocol usage.
                No traditional credit check required.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
