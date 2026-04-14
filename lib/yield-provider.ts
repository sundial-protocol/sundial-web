function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`[yield-provider] Missing env var: ${key}`);
  }
  return value ?? "";
}

export const YIELD_PROVIDER_PUBKEY = requireEnv("YIELD_PROVIDER_PUBKEY");
export const YIELD_PROVIDER_ADDRESS = requireEnv("YIELD_PROVIDER_ADDRESS");
// NEXT_PUBLIC_* vars must use direct property access so Next.js can inline
// them into the client bundle. Dynamic process.env[key] resolves to "" on
// the client side and would make provider_id falsy in fallback data.
export const TEST_PROVIDER_ID = process.env.NEXT_PUBLIC_TEST_PROVIDER_ID ?? "";
