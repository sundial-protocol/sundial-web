"use client";

import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { useState } from "react";
import { Section } from "@/components/ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioOverview } from "./portfolio-overview";
import { TransactionHistory } from "./tx-history";
import { YieldCatalog } from "./yield-catalog";
import { PrebuiltStrategies } from "./prebuilt-strategies";
import DepositBtcTab from "./deposit";
import {
  Wallet,
  TrendingUp,
  History,
  Target,
  ArrowDownCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("portfolio");

  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            content: '""',
            position: "absolute",
            left: "0",
            top: "300px",
            width: "100%",
            height: "1200px",
            background:
              "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <div className="min-h-screen">
        <Section className="pb-24">
          <div className="container mx-auto px-4">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold mb-2">Financial Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your Bitcoin portfolio and explore yield opportunities
              </p>
            </div>

            {/* Dashboard Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-8">
                <TabsTrigger
                  value="portfolio"
                  className="flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Portfolio</span>
                </TabsTrigger>
                <TabsTrigger
                  value="depositbtc"
                  className="flex items-center gap-2"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Deposit</span>
                </TabsTrigger>
                <TabsTrigger value="yield" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Yield</span>
                </TabsTrigger>
                <TabsTrigger
                  value="strategies"
                  className="flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Strategies</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <TabsContent value="portfolio">
                <PortfolioOverview />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionHistory />
              </TabsContent>

              <TabsContent value="yield">
                <YieldCatalog />
              </TabsContent>

              <TabsContent value="strategies">
                <PrebuiltStrategies />
              </TabsContent>

              <TabsContent value="depositbtc">
                <DepositBtcTab />
              </TabsContent>
            </Tabs>
          </div>
        </Section>
      </div>
    </SunbeamBackground>
  );
}
