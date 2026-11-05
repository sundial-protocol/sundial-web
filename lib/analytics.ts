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

// Asks the server for this wallet's PostHog ID (a keyed hash of the address).
// The address itself never reaches PostHog. Returns null when PostHog isn't
// running, the server has no key, or the request fails.
export async function fetchWalletId(address: string): Promise<string | null> {
  if (!posthog.__loaded) return null;
  try {
    const response = await fetch("/api/analytics/wallet-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) return null;
    const { id } = (await response.json()) as { id?: string };
    return id ?? null;
  } catch {
    return null;
  }
}

export function identify(id: string) {
  if (!posthog.__loaded) return;
  posthog.identify(id);
}

// Starts a fresh anonymous ID. posthog.reset() also clears super properties,
// so `product` (registered once at startup) is put back afterwards.
export function resetIdentity() {
  if (!posthog.__loaded) return;
  const product = posthog.get_property("product");
  posthog.reset();
  if (product) posthog.register({ product });
}
