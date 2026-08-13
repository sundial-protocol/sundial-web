export type DeploymentEnvironment = "development" | "production" | "preview";

export const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";
export const isLocal = process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
export const isProd = !isDev;

export const Flags = {
  DISABLE_DASHBOARD: false,
  DISABLE_LENDING: true,
  DISABLE_STAKE_PAGE: isProd,
  DISABLE_VALIDATORS_PAGE: isProd,
  DISABLE_STAKING_PAGE: isProd,
  DISABLE_VALIDATOR_PAGES: isProd,
  DISABLE_TESTNET: false,
  DISABLE_SOLSTICE: true,
  // The peg-in bridge is mocked end to end (app/dashboard/bridge/README.md).
  // Gated on prod rather than a bare `true` so it stays exercisable in preview
  // and locally, but cannot reach a user who would take it for real.
  DISABLE_BRIDGE: isProd,
};
