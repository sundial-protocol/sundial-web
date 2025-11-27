import { NextResponse } from "next/server";

// In-memory cache
let priceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes server-side cache

export async function GET() {
  const now = Date.now();

  // Check if we have valid cached data
  if (priceCache && now - priceCache.timestamp < CACHE_DURATION) {
    console.log("Serving cached Bitcoin price:", priceCache.price);
    return NextResponse.json({
      price: priceCache.price,
      cached: true,
      age: now - priceCache.timestamp,
    });
  }

  // Fetch fresh data
  try {
    const price = await getBitcoinPrice();

    if (price) {
      // Update cache
      priceCache = { price, timestamp: now };
      console.log("Fresh Bitcoin price fetched and cached:", price);

      return NextResponse.json({
        price,
        cached: false,
        timestamp: now,
      });
    }

    // If fetch fails but we have old cache, use it
    if (priceCache) {
      console.log("Using stale cache due to fetch failure");
      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        stale: true,
        age: now - priceCache.timestamp,
      });
    }

    throw new Error("No price data available");
  } catch (error) {
    console.error("API Error:", error);

    // Return cached data if available, even if stale
    if (priceCache) {
      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        error: true,
        age: now - priceCache.timestamp,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch price" },
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
