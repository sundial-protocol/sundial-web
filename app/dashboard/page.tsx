"use client";

import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { DashboardProvider } from "@/lib/contexts/dashboard-context";
import { useState } from "react";
import { PortfolioOverview } from "./portfolio-overview";
import { TransactionHistory } from "./tx-history";
import { YieldCatalog } from "./yield-catalog";
import { PrebuiltStrategies } from "./prebuilt-strategies";
import Deposit from "./deposit/deposit";
import WithdrawTab from "./deposit/withdraw";
import { Section } from "@/components/ui/section";

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("portfolio");

  const tabs = [
    { id: "portfolio", label: "Portfolio" },
    { id: "deposit", label: "Deposit" },
    { id: "withdraw", label: "Withdraw" },
    { id: "yield", label: "Yield", disabled: true },
    { id: "strategies", label: "Strategies", disabled: true },
    { id: "history", label: "History" },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "portfolio":
        return <PortfolioOverview />;
      case "deposit":
        return <Deposit />;
      case "withdraw":
        return <WithdrawTab />;
      case "yield":
        return <YieldCatalog />;
      case "strategies":
        return <PrebuiltStrategies />;
      case "history":
        return <TransactionHistory />;
      default:
        return <PortfolioOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  tab.disabled
                    ? "text-muted-foreground/50 cursor-not-allowed opacity-50"
                    : activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
                title={tab.disabled ? "Coming Soon" : undefined}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.disabled && (
                  <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderActiveTab()}
      </div>
    </div>
  );
}

export default function DashboardPage() {
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
      <DashboardProvider>
        <div className="min-h-screen">
          <Section className="pb-24">
            <div className="container mx-auto px-4">
              <DashboardContent />
            </div>
          </Section>
        </div>
      </DashboardProvider>
    </SunbeamBackground>
  );
}
