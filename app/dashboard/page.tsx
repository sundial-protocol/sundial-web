"use client";

import { Suspense } from "react";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { DashboardProvider } from "@/lib/contexts/dashboard-context";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PortfolioOverview } from "./overview/portfolio-overview";
import { TransactionHistory } from "./tx-history";
import { YieldCatalog } from "./yield-catalog";
import PrebuiltStrategies from "./prebuilt-strategies";
import Deposit from "./deposit/deposit";
import WithdrawTab from "./deposit/withdraw";
import { Section } from "@/components/ui/section";
import LendingTab from "./lending/lending";
import { ConfirmationProvider } from "@/components/ui/confirmation";
import DemoDisclaimer from "./demo-disclaimer";
import { PriceProvider } from "@/lib/contexts/price-context";
import MaintenanceSunset from "@/components/reusable-sections/maintenance-sunset/maintenance-sunset";
import { Flags } from "@/lib/flags";
import ContextProvider from "@/lib/wallet/bitcoin/context";

// Loading component
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}

// Extract the component that uses useSearchParams
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = [
    { id: "portfolio", label: "Portfolio" },
    { id: "deposit", label: "Deposit" },
    { id: "withdraw", label: "Withdraw" },
    { id: "lend", label: "Lend", disabled: true },
    { id: "yield", label: "Yield", disabled: true },
    { id: "strategies", label: "Strategies", disabled: true },
    { id: "history", label: "History" },
  ];

  // Validate tab from URL params before setting initial state
  const getValidatedTab = (urlTab: string | null) => {
    if (!urlTab) return "portfolio";
    const validTab = tabs.find((tab) => tab.id === urlTab && !tab.disabled);
    return validTab ? urlTab : "portfolio";
  };

  const [activeTab, setActiveTab] = useState(() =>
    getValidatedTab(searchParams.get("tab")),
  );

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // Update URL search params
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  };

  // Sync state with URL on initial load and when URL changes
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    const validatedTab = getValidatedTab(urlTab);

    if (validatedTab !== activeTab) {
      setActiveTab(validatedTab);

      // If we had to change the tab due to validation, update the URL
      if (urlTab !== validatedTab) {
        const params = new URLSearchParams(searchParams);
        params.set("tab", validatedTab);
        router.replace(`/dashboard?${params.toString()}`, { scroll: false });
      }
    }
  }, [searchParams]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlTab =
        new URLSearchParams(window.location.search).get("tab") || "portfolio";
      setActiveTab(urlTab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
      case "lend":
        return <LendingTab />;
      case "strategies":
        return <PrebuiltStrategies />;
      case "history":
        return <TransactionHistory />;
      default:
        return <PortfolioOverview />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Demo Disclaimer - visible on all tabs */}
        <DemoDisclaimer classes="mb-6" />

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
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
  if (Flags.DISABLE_DASHBOARD) {
    return <MaintenanceSunset />;
  }

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
      <PriceProvider>
        <DashboardProvider>
          <ConfirmationProvider>
            <ContextProvider>
              <div className="min-h-screen">
                <Section className="pb-24">
                  <div className="container mx-auto px-4">
                    <Suspense fallback={<DashboardLoading />}>
                      <DashboardContent />
                    </Suspense>
                  </div>
                </Section>
              </div>
            </ContextProvider>
          </ConfirmationProvider>
        </DashboardProvider>
      </PriceProvider>
    </SunbeamBackground>
  );
}
