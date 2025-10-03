import eternlIcon from "@/public/wallets/eternl.png";
import geroIcon from "@/public/wallets/gero.png";
import laceIcon from "@/public/wallets/lace.svg";
import nufiIcon from "@/public/wallets/nufi.svg";
import typhonIcon from "@/public/wallets/typhon.svg";
import yoroiIcon from "@/public/wallets/yoroi.png";
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

export function getWalletIcon(walletName: string): StaticImageData {
  const iconMap: Record<string, StaticImageData> = {
    eternl: eternlIcon,
    yoroi: yoroiIcon,
    gerowallet: geroIcon,
    lace: laceIcon,
    typhoncip30: typhonIcon,
    nufi: nufiIcon,
    vespr: nufiIcon, // Vespr uses the NuFi icon for now
  };

  return iconMap[walletName] || Wallet;
}
