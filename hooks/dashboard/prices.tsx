import { useCallback, useMemo, useState } from "react";

export type CurrencyCode = "USD" | "BTC" | "ADA" | "EUR" | "tBTC" | "tADA";
export type StakingCurrencyCode = "USD" | "BTC";

export type PricesMap = Record<CurrencyCode, number>;

export const DEFAULT_PRICES: PricesMap = {
  USD: 1,
  BTC: 100000, // 1 BTC = 100,000 USD (hardcoded example)
  ADA: 0.7, // 1 ADA = $0.70 USD (hardcoded example)
  EUR: 1.05,
  // Testnet currencies - will have to split based on environment later
  tBTC: 100000,
  tADA: 0.7,
};

/**
 * Hook providing conversion utilities between currencies.
 *
 * Basic usage:
 * const { convert, getRate, addPrice, prices } = usePrices();
 * convert(2, "BTC", "USD") // => ~200000
 */
export function usePrices(initial?: Partial<PricesMap>) {
  const [prices, setPrices] = useState<PricesMap>(() => ({
    ...DEFAULT_PRICES,
    ...(initial ?? {}),
  }));

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

  /**
   * Returns the conversion rate to multiply an amount in `from` to get amount in `to`.
   * rate = (USD per to unit) / (USD per from unit)
   */
  const getRate = useCallback(
    (from: CurrencyCode, to: CurrencyCode) => {
      const fromUsd = getPriceInUSD(from);
      const toUsd = getPriceInUSD(to);
      return fromUsd / toUsd;
    },
    [getPriceInUSD]
  );

  /**
   * Convert an amount from one currency to another.
   * Example: convert(1, "BTC", "USD") => 100000
   */
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

  /**
   * Add or update a currency price (USD per unit).
   * Useful for dynamic updates or adding new currencies.
   */
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

  /**
   * Remove a currency from the map.
   */
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
    }),
    [prices, getPriceInUSD, getRate, convert, addPrice, removeCurrency]
  );

  return utilities;
}

/**
 * Lightweight standalone helpers (non-hook).
 */
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

/**
 * Small formatter.
 */
export function formatAmount(amount: number, decimals = 6) {
  if (!isFinite(amount)) return String(amount);
  const d = Math.max(0, Math.min(12, decimals));
  return Number(amount).toLocaleString(undefined, { maximumFractionDigits: d });
}

export default usePrices;
