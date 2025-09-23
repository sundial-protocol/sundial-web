import eternlIcon from "@/public/wallets/eternl.png";
import geroIcon from "@/public/wallets/gero.png";
import laceIcon from "@/public/wallets/lace.svg";
import nufiIcon from "@/public/wallets/nufi.svg";
import typhonIcon from "@/public/wallets/typhon.svg";
import yoroiIcon from "@/public/wallets/yoroi.png";
import { StaticImageData } from "next/dist/shared/lib/image-external";

export const chromeStoreUrl = "https://chrome.google.com/webstore/detail/";

export interface WalletExtension {
  id: string;
  display: string;
  icon?: StaticImageData;
  website?: string;
}

export const knownWalletExtensions: Record<string, WalletExtension> = {
  eternl: {
    id: "eternl",
    display: "Eternl",
    icon: eternlIcon,
    website: "https://eternl.io/",
  },
  yoroi: {
    id: "yoroi",
    display: "Yoroi",
    icon: yoroiIcon,
    website: "https://yoroi-wallet.com/",
  },
  gerowallet: {
    id: "gerowallet",
    display: "GeroWallet",
    icon: geroIcon,
    website: "https://gerowallet.io/",
  },
  typhoncip30: {
    id: "typhoncip30",
    display: "Typhon",
    icon: typhonIcon,
    website: "https://typhonwallet.io/",
  },
  nufi: {
    id: "nufi",
    display: "NuFi",
    icon: nufiIcon,
    website: "https://nu.fi/",
  },
  lace: {
    id: "lace",
    display: "Lace",
    icon: laceIcon,
    website: "https://www.lace.io/",
  },
  //begin: {
  //  id: "begin",
  //  display: "Begin",
  //  icon: beginIcon,
  //  website: "https://begin.is/",
  //},
};

// Get list of installed wallet extensions
export function getInstalledWallets(): string[] {
  if (typeof window === "undefined" || !window.cardano) {
    return [];
  }

  const installedWallets: string[] = [];

  for (const walletKey of Object.keys(knownWalletExtensions)) {
    if (window.cardano[walletKey]) {
      installedWallets.push(walletKey);
    }
  }

  return installedWallets;
}

// Get display name for a wallet
export function getWalletDisplayName(walletKey: string): string {
  return knownWalletExtensions[walletKey]?.display || walletKey;
}

// Get icon URL for a wallet
export function getWalletIcon(walletKey: string): StaticImageData | null {
  return knownWalletExtensions[walletKey]?.icon || null;
}

// Get website URL for a wallet
export function getWalletWebsite(walletKey: string): string | null {
  return knownWalletExtensions[walletKey]?.website || null;
}

// Check if a wallet is supported
export function isSupportedWallet(walletKey: string): boolean {
  return walletKey in knownWalletExtensions;
}

// Get all supported wallet keys
export function getSupportedWallets(): string[] {
  return Object.keys(knownWalletExtensions);
}

// Check if wallet supports specific features
export function getWalletFeatures(walletKey: string): string[] {
  // This could be expanded based on wallet capabilities
  const features: string[] = ["basic"];

  // TODO: Add specific features based on wallet
  switch (walletKey) {
    default:
      features.push("staking");
      break;
  }

  return features;
}

// Wallet detection utility
export function detectWallets(): Record<string, boolean> {
  if (typeof window === "undefined" || !window.cardano) {
    return {};
  }

  const detected: Record<string, boolean> = {};

  for (const walletKey of Object.keys(knownWalletExtensions)) {
    detected[walletKey] = !!window.cardano[walletKey];
  }

  return detected;
}

// Type for wallet detection result
export interface WalletDetectionResult {
  isInstalled: boolean;
  isEnabled: boolean;
  version?: string;
  icon?: StaticImageData;
  name: string;
}

// Get detailed wallet information
export async function getWalletInfo(
  walletKey: string
): Promise<WalletDetectionResult | null> {
  if (
    typeof window === "undefined" ||
    !window.cardano ||
    !window.cardano[walletKey]
  ) {
    return null;
  }

  const wallet = window.cardano[walletKey];
  const config = knownWalletExtensions[walletKey];

  try {
    const isEnabled = (await wallet.isEnabled?.()) || false;
    const version = wallet.apiVersion || "unknown";

    return {
      isInstalled: true,
      isEnabled,
      version,
      icon: config?.icon,
      name: config?.display || walletKey,
    };
  } catch (error) {
    console.warn(`Error getting info for wallet ${walletKey}:`, error);
    return {
      isInstalled: true,
      isEnabled: false,
      name: config?.display || walletKey,
      icon: config?.icon,
    };
  }
}
