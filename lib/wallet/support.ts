import { BrowserWallet } from "@meshsdk/core";

export const knownWalletExtensions = {
  nami: "Nami",
  eternl: "Eternl",
  flint: "Flint",
  yoroi: "Yoroi",
  gerowallet: "GeroWallet",
  typhoncip30: "Typhon",
  nufi: "NuFi",
  cardwallet: "CardWallet",
  lace: "Lace",
} as const;

export type KnownWalletName = keyof typeof knownWalletExtensions;

export type WalletExtension = keyof typeof knownWalletExtensions;

export async function getInstalledWallets(): Promise<string[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const installed: string[] = [];

  try {
    // Use MeshSDK's method to get available wallets
    const availableWallets = BrowserWallet.getInstalledWallets();

    for (const { name: walletName } of availableWallets) {
      if (walletName in knownWalletExtensions) {
        installed.push(walletName);
      }
    }
  } catch (error) {
    console.warn("Failed to get installed wallets:", error);
  }

  return installed;
}

export function getWalletDisplayName(walletName: string): string {
  return knownWalletExtensions[walletName as WalletExtension] || walletName;
}

export function getWalletIcon(walletName: string): string {
  const iconMap: Record<string, string> = {
    nami: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMkwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEyTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMxOTc2RDIiLz4KPC9zdmc+",
    eternl:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGRjU3MjIiLz4KPC9zdmc+",
    flint:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM2MzY2RjEiLz4KPC9zdmc+",
    yoroi:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPC9zdmc+",
    gerowallet:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMEIxMDEiLz4KPC9zdmc+",
    lace: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGNTk4NDIiLz4KPC9zdmc+",
  };

  return iconMap[walletName] || iconMap.nami;
}
