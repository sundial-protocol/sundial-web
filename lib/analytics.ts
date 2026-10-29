// Product analytics helpers. Event names, properties and privacy rules:
// docs-v2 operations/analytics.md
import posthog from "posthog-js";

type Properties = Record<string, string | number | boolean | null | undefined>;

// No-op unless instrumentation-client.ts started PostHog (it only does when
// NEXT_PUBLIC_POSTHOG_KEY is set), so callers never need to check.
export function track(event: string, properties?: Properties) {
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

// Never send exact amounts: an exact amount plus a timestamp finds the
// transaction on chain.
export function amountBucket(btc: number): string {
  if (!Number.isFinite(btc) || btc <= 0) return "unknown";
  if (btc < 0.001) return "<0.001 BTC";
  if (btc < 0.01) return "0.001-0.01 BTC";
  if (btc < 0.1) return "0.01-0.1 BTC";
  if (btc < 1) return "0.1-1 BTC";
  return "1+ BTC";
}

// Ask the server for this wallet's PostHog ID (a keyed hash of the address)
// and identify the browser as that person. The address itself never reaches
// PostHog.
export async function identifyWallet(address: string): Promise<boolean> {
  if (!posthog.__loaded) return false;
  const response = await fetch("/api/analytics/wallet-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!response.ok) return false;
  const { id } = (await response.json()) as { id?: string };
  if (!id) return false;
  posthog.identify(id);
  return true;
}

export function resetIdentity() {
  if (!posthog.__loaded) return;
  posthog.reset();
}
