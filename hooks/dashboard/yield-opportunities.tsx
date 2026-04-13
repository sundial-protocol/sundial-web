"use client";

import { useState, useEffect } from "react";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";
import type { ServerProvider } from "@/app/api/providers/types";

export function getLockPeriod(locktime: number): string {
  if (locktime <= 0) {
    return "None";
  }

  const minutes = locktime / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (minutes < 60) {
    const roundedMinutes = Math.round(minutes);
    return roundedMinutes === 1 ? "1 minute" : `${roundedMinutes} minutes`;
  } else if (hours < 24) {
    const roundedHours = Math.round(hours);
    return roundedHours === 1 ? "1 hour" : `${roundedHours} hours`;
  } else if (days < 7) {
    const roundedDays = Math.round(days);
    return roundedDays === 1 ? "1 day" : `${roundedDays} days`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  } else {
    const years = Math.round(days / 365);
    return years === 1 ? "1 year" : `${years} years`;
  }
}

export interface YieldOpportunity {
  // basic info
  id: number;
  name: string;
  description: string;
  provider: string;
  totalLocked: number;

  // tags
  type: "staking" | "lending" | "liquidity" | "alternative";
  risk: "Low" | "Medium" | "High"; // Or use RiskEval if you want to keep it consistent

  // yield details
  apy: number;
  minAmount: number;
  payments: number; // Number of payments per year (for lending)

  // blockchain details
  publicKey: string; // Public key for the provider
  locktime: number; // unix duration for lockup in seconds

  // backend ID (optional – populated when backend providers are available)
  provider_id?: string; // UUID from btc-yield backend
}

export function useYieldOpportunities() {
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/providers");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const providers: ServerProvider[] = await res.json();
        const mapped = Array.isArray(providers)
          ? mapProvidersToOpportunities(providers)
          : [];
        // Fall back to mock data if the server returned nothing usable
        setOpportunities(mapped.length > 0 ? mapped : fallbackOpportunities);
      } catch (err: any) {
        console.error("Failed to fetch yield opportunities:", err);
        setError(err.message ?? "Failed to load opportunities");
        // Fall back to static mock data so the UI remains usable
        setOpportunities(fallbackOpportunities);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  const filterOpportunities = (
    type?: "staking" | "lending" | "liquidity" | "alternative",
    risk?: "Low" | "Medium" | "High",
    minAPY?: number,
    maxMinAmount?: number,
  ) => {
    return opportunities.filter((opportunity) => {
      if (type && opportunity.type !== type) return false;
      if (risk && opportunity.risk !== risk) return false;
      if (minAPY && opportunity.apy < minAPY) return false;
      if (maxMinAmount && opportunity.minAmount > maxMinAmount) return false;
      return true;
    });
  };

  const sortOpportunities = (
    sortBy: "apy" | "totalLocked" | "minAmount" | "name" = "apy",
  ) => {
    return [...opportunities].sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy;
        case "totalLocked":
          return b.totalLocked - a.totalLocked;
        case "minAmount":
          return a.minAmount - b.minAmount;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  return {
    opportunities,
    isLoading,
    error,
    filterOpportunities,
    sortOpportunities,
  };
}

const TEST_PROVIDER_ID = "8efe4835-126d-477b-9266-ece47a663cf1";

// ---------------------------------------------------------------------------
// Server → YieldOpportunity mapping
// ---------------------------------------------------------------------------

/**
 * Map the GET /v1/providers response to the local YieldOpportunity shape.
 *
 * Fields that are not returned by the server are noted with MOCKED and listed
 * in the hook file comment below.
 */
function mapProvidersToOpportunities(
  providers: ServerProvider[],
): YieldOpportunity[] {
  const opportunities: YieldOpportunity[] = [];
  let index = 1;

  for (const provider of providers) {
    if (provider.programs.length > 0) {
      for (const program of provider.programs) {
        opportunities.push({
          // ── From server ────────────────────────────────────────────────────
          id: index++,
          name: provider.name,
          description: program.description ?? "",
          provider: provider.name,
          apy: program.expected_yield_bps / 100, // bps → percentage
          locktime: program.min_lock_ms / 1000, // ms → seconds
          provider_id: provider.provider_id,

          // ── MOCKED – not currently returned by GET /v1/providers ───────────
          // See the comment block at the bottom of this file for full details.
          totalLocked: 0,
          type: "staking",
          risk: "Low",
          minAmount: 0.0001,
          payments: 12,
          publicKey: YIELD_PROVIDER_PUBKEY,
        });
      }
    } else {
      // Provider exists but has no active programs yet — create a default
      // opportunity so the real provider_id is available for new deposits.
      opportunities.push({
        id: index++,
        name: provider.name,
        description: "",
        provider: provider.name,
        apy: 3.5, // TODO: System will default to this unless the first program is created manually. We need to move this field to the provider.
        locktime: 30 * 24 * 60 * 60, // 30-day default in seconds
        provider_id: provider.provider_id,
        totalLocked: 0,
        type: "staking",
        risk: "Low",
        minAmount: 0.0001,
        payments: 12,
        publicKey: YIELD_PROVIDER_PUBKEY,
      });
    }
  }

  return opportunities;
}

// ---------------------------------------------------------------------------
// Fallback mock data (used when the server is unreachable)
// ---------------------------------------------------------------------------

/*
 * Fields that remain mocked even when live data is available:
 *
 *   - totalLocked  : total BTC locked in the program.
 *                    The server does not currently aggregate this per program.
 *   - type         : staking | lending | liquidity | alternative.
 *                    The server has no category field. All live programs default
 *                    to "staking".  Add a category to the program schema if
 *                    other types are needed in the UI filter.
 *   - risk         : Low | Medium | High.
 *                    Not in the server schema.  Could be derived from program
 *                    metadata or a separate lookup table.
 *   - minAmount    : minimum deposit in BTC.
 *                    The server tracks min_lock_ms (time), not a minimum amount.
 *                    Consider adding min_amount_sats to the program schema.
 *   - payments     : number of yield payments per year.
 *                    Not in the server schema.  Relevant for the yield projection
 *                    maths; consider adding a payment_frequency field.
 *   - publicKey    : provider public key used to build PSBTs.
 *                    GET /v1/providers returns program_vault_address (an address),
 *                    not a raw public key.  The key is stored server-side as
 *                    provider_pubkey_hex; exposing it in the providers response
 *                    would allow the client to build PSBTs without a separate call.
 */

// Mock yield opportunities data
const fallbackOpportunities: YieldOpportunity[] = [
  {
    id: 1,
    name: "Bitcoin Staking",
    description: "Stake your Bitcoin with trusted validators and earn rewards",
    provider: "Sundial Network",
    totalLocked: 1250000,
    type: "staking",
    risk: "Low",
    apy: 3.5,
    minAmount: 0.0001,
    payments: 12, // Number of payments per year
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 604800, // 7 days in seconds
    provider_id: TEST_PROVIDER_ID,
  },
  {
    id: 2,
    name: "Liquid Staking",
    description: "Stake Bitcoin and receive liquid tokens for DeFi",
    provider: "Sundial Protocol",
    totalLocked: 850000,
    type: "staking",
    risk: "Low",
    apy: 3.2,
    minAmount: 0.001,
    payments: 12, // Number of payments per year
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 60 * 60 * 24 * 30, // 30 days in seconds
    provider_id: TEST_PROVIDER_ID,
  },
  {
    id: 3,
    name: "BTC Lending Pool",
    description: "Lend Bitcoin to borrowers and earn interest",
    provider: "DeFi Lending",
    totalLocked: 500000,
    type: "lending",
    risk: "Medium",
    apy: 5.3,
    minAmount: 0.1,
    payments: 12, // Number of payments per year (for lending)
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 60 * 60 * 24 * 30, // 30 days in seconds
  },
  {
    id: 4,
    name: "BTC-USDC LP",
    description: "Provide liquidity and earn trading fees",
    provider: "DEX Protocol",
    totalLocked: 300000,
    type: "liquidity",
    risk: "High",
    apy: 7.7,
    minAmount: 0.05,
    payments: 365, // Daily rewards
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 60 * 60 * 24 * 30, // 30 days in seconds
  },
  {
    id: 5,
    name: "Real Estate Token",
    description: "Invest in tokenized real estate assets",
    provider: "RealFi",
    totalLocked: 750000,
    type: "alternative",
    risk: "Medium",
    apy: 4.8,
    minAmount: 0.5,
    payments: 4, // Quarterly payments
    publicKey: YIELD_PROVIDER_PUBKEY, // Example public key
    locktime: 60 * 60 * 24 * 30, // 30 days in seconds
  },
];

export function yieldFromProvider(
  principal: number,
  provider: YieldOpportunity | null,
  fullProjection: boolean = false,
) {
  if (!provider) {
    console.log("No yield provider selected, returning 0 yield");
    return 0;
  }
  return yieldFromApy(
    provider.apy,
    principal,
    fullProjection ? 1 : provider.payments,
  );
}

export function yieldFromApy(
  apy: number,
  principal: number,
  paymentsPerYear: number = 12,
) {
  return (apy / 100 / paymentsPerYear) * principal;
}
