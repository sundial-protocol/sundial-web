export type DeploymentEnvironment = "development" | "production" | "preview";

export const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";
export const isLocal = process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
export const isProd = !isDev;
