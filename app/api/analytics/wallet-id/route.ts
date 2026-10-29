import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

// Turns a wallet address into its PostHog distinct_id: "w_" + hex HMAC-SHA256
// keyed with POSTHOG_WALLET_ID_KEY. The key stays on the server, so PostHog
// and anyone reading its data can't match IDs back to addresses by hashing
// the chain. Rules: docs-v2 operations/analytics.md, "Wallet identity".

const ADDRESS = /^[A-Za-z0-9]{14,90}$/;

// This route is a hashing oracle for whoever calls it, so cap how fast one
// caller can use it. Per instance only; it slows bulk matching, it doesn't
// stop a determined caller.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const recent = new Map<string, number[]>();

function rateLimited(caller: string): boolean {
  const now = Date.now();
  const hits = (recent.get(caller) ?? []).filter((t) => now - t < WINDOW_MS);
  // Refused calls aren't recorded, so a caller never holds more than
  // MAX_PER_WINDOW timestamps.
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(caller, hits);
    return true;
  }
  hits.push(now);
  recent.set(caller, hits);
  if (recent.size > 10_000) recent.clear();
  return false;
}

function normalize(address: string): string {
  // Bech32 addresses are case-insensitive; base58 ones are not.
  return /^(bc1|tb1|bcrt1)/i.test(address) ? address.toLowerCase() : address;
}

export async function POST(request: NextRequest) {
  const key = process.env.POSTHOG_WALLET_ID_KEY;
  if (!key) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const caller =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(caller)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  if (!ADDRESS.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const id =
    "w_" + createHmac("sha256", key).update(normalize(address)).digest("hex");
  return NextResponse.json({ id });
}
