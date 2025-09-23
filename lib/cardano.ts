import { Assets } from "@sundial-protocol/ada-locker";

export function lovelaceToAssets(lovelace: number): Assets {
  return { lovelace: BigInt(lovelace) };
}

// Helper function to convert ADA to Lovelace
export function adaToLovelace(ada: number): bigint {
  return BigInt(Math.floor(ada * 1_000_000));
}

// Helper function to convert Lovelace to ADA
export function lovelaceToAda(lovelace: bigint | number): number {
  return Number(lovelace) / 1_000_000;
}
