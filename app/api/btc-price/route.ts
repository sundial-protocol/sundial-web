import { NextResponse } from "next/server";

// In-memory cache with session tracking
let priceCache: { price: number; timestamp: number } | null = null;
let sessionStart: number = Date.now(); // Track when the server session started
let requestCount: number = 0; // Track number of requests in this session

// Cache duration configuration
const BASE_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes base
const MAX_CACHE_DURATION = 60 * 60 * 1000; // 60 minutes max
const SESSION_MULTIPLIER = 0.1; // How much session age affects cache duration

export async function GET() {
  const now = Date.now();
  requestCount++;

  // Calculate adaptive cache duration based on session length
  const sessionAge = now - sessionStart;
  const sessionAgeMinutes = sessionAge / (60 * 1000);

  // Adaptive cache duration: longer session = longer cache
  // Formula: base + (session_age_minutes * multiplier * base)
  // This gradually increases cache time as session gets longer
  const adaptiveCacheDuration = Math.min(
    BASE_CACHE_DURATION +
      sessionAgeMinutes * SESSION_MULTIPLIER * BASE_CACHE_DURATION,
    MAX_CACHE_DURATION
  );

  console.log(
    `Session: ${Math.round(sessionAgeMinutes)}min, Cache TTL: ${Math.round(
      adaptiveCacheDuration / 1000
    )}s, Request #${requestCount}`
  );

  // Check if we have valid cached data
  if (priceCache && now - priceCache.timestamp < adaptiveCacheDuration) {
    const cacheAge = now - priceCache.timestamp;
    console.log(
      `Serving cached Bitcoin price: $${priceCache.price.toLocaleString()} (${Math.round(
        cacheAge / 1000
      )}s old)`
    );

    return NextResponse.json({
      price: priceCache.price,
      cached: true,
      age: cacheAge,
      sessionAge,
      requestCount,
      cacheDuration: adaptiveCacheDuration,
      nextRefreshIn: adaptiveCacheDuration - cacheAge,
    });
  }

  // Fetch fresh data
  try {
    const price = await getBitcoinPrice();

    if (price) {
      // Update cache
      priceCache = { price, timestamp: now };
      console.log(
        `Fresh Bitcoin price fetched and cached: $${price.toLocaleString()}`
      );

      return NextResponse.json({
        price,
        cached: false,
        timestamp: now,
        sessionAge,
        requestCount,
        cacheDuration: adaptiveCacheDuration,
        nextRefreshIn: adaptiveCacheDuration,
      });
    }

    // If fetch fails but we have old cache, use it
    if (priceCache) {
      const cacheAge = now - priceCache.timestamp;
      console.log("Using stale cache due to fetch failure");

      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        stale: true,
        age: cacheAge,
        sessionAge,
        requestCount,
        cacheDuration: adaptiveCacheDuration,
      });
    }

    throw new Error("No price data available");
  } catch (error) {
    console.error("API Error:", error);

    // Return cached data if available, even if stale
    if (priceCache) {
      const cacheAge = now - priceCache.timestamp;

      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        error: true,
        age: cacheAge,
        sessionAge,
        requestCount,
        cacheDuration: adaptiveCacheDuration,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch price", sessionAge, requestCount },
      { status: 500 }
    );
  }
}

export async function getBitcoinPrice(): Promise<number | null> {
  const apiKey = process.env.CMC_API_KEY;
  if (!apiKey) {
    throw new Error("CMC_API_KEY is not set in environment variables.");
  }

  const url =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC";

  const res = await fetch(url, {
    headers: {
      "X-CMC_PRO_API_KEY": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
    // Add timeout to prevent hanging requests
    signal: AbortSignal.timeout(10000), // 10 second timeout
  });

  if (!res.ok) {
    console.error("CoinMarketCap API error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data?.data?.BTC?.quote?.USD?.price ?? null;
}

// Optional: Add session reset endpoint for testing
export async function POST() {
  sessionStart = Date.now();
  requestCount = 0;
  priceCache = null;

  return NextResponse.json({
    message: "Session reset",
    sessionStart,
    requestCount,
  });
}
