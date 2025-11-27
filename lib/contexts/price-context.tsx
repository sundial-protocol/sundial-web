"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

interface PriceContextType {
  btcPrice: number;
  isLoading: boolean;
  lastUpdated: string | null;
  error: string | null;
  refreshPrice: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [btcPrice, setBtcPrice] = useState(100000); // Default fallback
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef(0);

  const RATE_LIMIT = 60 * 1000; // 1 minute between fetches
  const AUTO_REFRESH = 5 * 60 * 1000; // 5 minutes auto refresh

  const fetchPrice = async (force = false) => {
    const now = Date.now();

    if (!force && now - lastFetchRef.current < RATE_LIMIT) {
      console.log("Price fetch rate limited");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/btc-price");
      const data = await response.json();

      if (data.price) {
        setBtcPrice(data.price);
        setLastUpdated(new Date().toLocaleTimeString());
        lastFetchRef.current = now;
        console.log("✅ Global price updated:", data.price);
      } else {
        throw new Error("Invalid price data");
      }
    } catch (err) {
      console.error("Global price fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch price");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPrice = async () => {
    await fetchPrice(true);
  };

  // Initialize and set up auto-refresh
  useEffect(() => {
    fetchPrice(true); // Initial fetch

    // Set up auto-refresh interval
    intervalRef.current = setInterval(() => {
      fetchPrice(false);
    }, AUTO_REFRESH);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <PriceContext.Provider
      value={{
        btcPrice,
        isLoading,
        lastUpdated,
        error,
        refreshPrice,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
}

export function useGlobalPrice() {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error("useGlobalPrice must be used within PriceProvider");
  }
  return context;
}
