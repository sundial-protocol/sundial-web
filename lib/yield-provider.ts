function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`[yield-provider] Missing env var: ${key}`);
  }
  return value ?? "";
}

export const YIELD_PROVIDER_PUBKEY = requireEnv("YIELD_PROVIDER_PUBKEY");
export const YIELD_PROVIDER_ADDRESS = requireEnv("YIELD_PROVIDER_ADDRESS");
export const TEST_PROVIDER_ID = requireEnv("NEXT_PUBLIC_TEST_PROVIDER_ID");
