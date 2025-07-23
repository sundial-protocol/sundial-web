import { NextResponse } from "next/server";

export async function GET() {
  const marketCap = await getBitcoinMarketCap();
  return NextResponse.json({ marketCap });
}

export async function getBitcoinMarketCap(): Promise<number | null> {
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
  });

  if (!res.ok) {
    console.error("CoinMarketCap API error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  // Market cap is in data.data.BTC.quote.USD.market_cap
  return data?.data?.BTC?.quote?.USD?.market_cap ?? null;
}
