import eternlIcon from "@/public/wallets/eternl.png";
import geroIcon from "@/public/wallets/gero.png";
import laceIcon from "@/public/wallets/lace.svg";
import nufiIcon from "@/public/wallets/nufi.svg";
import typhonIcon from "@/public/wallets/typhon.svg";
import yoroiIcon from "@/public/wallets/yoroi.png";
import vesprIcon from "@/public/wallets/vespr.webp";
import Wallet from "@/public/wallets/wallet.svg";
import { StaticImageData } from "next/image";
import { BrowserWallet } from "@meshsdk/core";

export const knownWalletExtensions = {
  eternl: "Eternl",
  yoroi: "Yoroi",
  gerowallet: "GeroWallet",
  typhoncip30: "Typhon",
  nufi: "NuFi",
  lace: "Lace",
  vespr: "Vespr",
} as const;

export type KnownWalletName = keyof typeof knownWalletExtensions;

export type WalletExtension = keyof typeof knownWalletExtensions;

export async function getInstalledWallets(): Promise<string[]> {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const installed: string[] = [];

    if (window.cardano) {
      console.log(
        "🔍 Wallet detection - window.cardano keys:",
        Object.keys(window.cardano)
      );

      // Use the same detection method as the debug component
      for (const [key, displayName] of Object.entries(knownWalletExtensions)) {
        const exists = window.cardano && window.cardano[key];
        if (exists) {
          console.log(`Found wallet: ${displayName} (${key})`);
          installed.push(key);
        }
      }

      // Log any unknown wallets for future reference
      const unknownWallets = window.cardano
        ? Object.keys(window.cardano).filter(
            (key) =>
              !Object.keys(knownWalletExtensions).includes(key) &&
              typeof window.cardano?.[key] === "object" &&
              window.cardano?.[key] !== null &&
              key !== "cardano" // Exclude the cardano object itself
          )
        : [];

      if (unknownWallets.length > 0) {
        console.log("Unknown wallets detected:", unknownWallets);
      }
    } else {
      console.log("window.cardano not found");
    }

    console.log("🔍 Final detected wallets:", installed);
    return installed;
  } catch (error) {
    console.warn("Failed to get installed wallets:", error);
    return [];
  }
}

export function getWalletDisplayName(walletName: string): string {
  return knownWalletExtensions[walletName as WalletExtension] || walletName;
}

export function getWalletIcon(walletName: string): StaticImageData {
  const iconMap: Record<string, StaticImageData> = {
    eternl: eternlIcon,
    yoroi: yoroiIcon,
    gerowallet: geroIcon,
    lace: laceIcon,
    typhoncip30: typhonIcon,
    nufi: nufiIcon,
    vespr: vesprIcon,
  };

  return iconMap[walletName] || Wallet;
}
