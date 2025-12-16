export type DeploymentEnvironment = "development" | "production" | "preview";

export const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";
export const isLocal = process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
export const isProd = !isDev;

export const Flags = {
  DISABLE_DASHBOARD: isProd,
  DISABLE_STAKE_PAGE: isProd,
  DISABLE_VALIDATORS_PAGE: isProd,
  DISABLE_STAKING_PAGE: isProd,
  DISABLE_VALIDATOR_PAGES: isProd,
  DISABLE_TESTNET: isProd,
};
