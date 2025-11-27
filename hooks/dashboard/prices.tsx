import { useCallback, useMemo, useState, useEffect } from "react";
import { useGlobalPrice } from "@/lib/contexts/price-context";

export type CurrencyCode = "USD" | "BTC" | "ADA" | "EUR" | "tBTC" | "tADA";
export type StakingCurrencyCode = "USD" | "BTC";

export type PricesMap = Record<CurrencyCode, number>;

export const DEFAULT_PRICES: PricesMap = {
  USD: 1,
  BTC: 100000,
  ADA: 0.7,
  EUR: 1.05,
  tBTC: 100000,
  tADA: 0.7,
};

export function usePrices(initial?: Partial<PricesMap>) {
  const { btcPrice, isLoading: btcLoading, refreshPrice } = useGlobalPrice();
  const [prices, setPrices] = useState<PricesMap>(() => ({
    ...DEFAULT_PRICES,
    ...(initial ?? {}),
  }));

  // Update BTC prices when global price changes
  useEffect(() => {
    setPrices((prev) => ({
      ...prev,
      BTC: btcPrice,
      tBTC: btcPrice,
    }));
  }, [btcPrice]);

  const getPriceInUSD = useCallback(
    (currency: CurrencyCode) => {
      const val = prices[currency];
      if (typeof val !== "number" || !isFinite(val)) {
        throw new Error(`Unknown or invalid price for currency "${currency}"`);
      }
      return val;
    },
    [prices]
  );

  const getRate = useCallback(
    (from: CurrencyCode, to: CurrencyCode) => {
      const fromUsd = getPriceInUSD(from);
      const toUsd = getPriceInUSD(to);
      return fromUsd / toUsd;
    },
    [getPriceInUSD]
  );

  const convert = useCallback(
    (amount: number, from: CurrencyCode, to: CurrencyCode) => {
      if (typeof amount !== "number" || !isFinite(amount)) {
        throw new Error("amount must be a finite number");
      }
      const rate = getRate(from, to);
      return amount * rate;
    },
    [getRate]
  );

  const addPrice = useCallback((currency: CurrencyCode, usdPerUnit: number) => {
    if (
      typeof usdPerUnit !== "number" ||
      !isFinite(usdPerUnit) ||
      usdPerUnit <= 0
    ) {
      throw new Error("usdPerUnit must be a positive finite number");
    }
    setPrices((prev) => ({ ...prev, [currency]: usdPerUnit }));
  }, []);

  const removeCurrency = useCallback((currency: CurrencyCode) => {
    setPrices((prev) => {
      if (!(currency in prev)) return prev;
      const next = { ...prev };
      delete next[currency];
      return next;
    });
  }, []);

  const utilities = useMemo(
    () => ({
      prices,
      getPriceInUSD,
      getRate,
      convert,
      addPrice,
      removeCurrency,
      refreshBitcoinPrice: refreshPrice, // Use global refresh
      isLoading: btcLoading,
      lastFetch: 0, // Legacy compatibility
      lastUpdated: null, // Use global context for this
    }),
    [
      prices,
      getPriceInUSD,
      getRate,
      convert,
      addPrice,
      removeCurrency,
      refreshPrice,
      btcLoading,
    ]
  );

  return utilities;
}

export function convertWithPrices(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  prices: PricesMap
) {
  if (typeof amount !== "number" || !isFinite(amount)) {
    throw new Error("amount must be a finite number");
  }
  const fromUsd = prices[from];
  const toUsd = prices[to];
  if (typeof fromUsd !== "number" || typeof toUsd !== "number") {
    throw new Error("unknown currency in prices map");
  }
  return (fromUsd / toUsd) * amount;
}

export function formatAmount(amount: number, decimals = 6) {
  if (!isFinite(amount)) return String(amount);
  const d = Math.max(0, Math.min(12, decimals));
  return Number(amount).toLocaleString(undefined, { maximumFractionDigits: d });
}

export default usePrices;
