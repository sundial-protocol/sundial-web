import { WalletApi } from "@/global";
import { decode as decodeCbor } from "cborg";

import { knownWalletExtensions, KnownWalletName } from ".";
import {
  ServerWalletNotSupported,
  WalletExtensionNotFoundError,
  WalletNetworkDetectError,
  WalletNotCip30CompatibleError,
  WalletNotInstalledError,
  WrongNetworkTypeError,
} from "./errors";
import { decodeHexAddress, NetworkType } from "./util";

export function getInstalledWalletExtensions(supportedWallets?: string[]) {
  if (typeof window === "undefined" || typeof window.cardano === "undefined") {
    return [];
  }

  const { cardano } = window;
  const installedExtensions = Object.keys(cardano)
    .filter(
      (walletExtension) =>
        walletExtension !== "typhon" &&
        !!cardano[walletExtension].enable &&
        typeof cardano[walletExtension].enable === "function"
    )
    .map((walletExtension) => walletExtension.toLowerCase());

  if (supportedWallets) {
    const lowerCaseNames = supportedWallets.map((walletName) =>
      walletName.toLowerCase()
    );

    return installedExtensions.filter((wallet) =>
      lowerCaseNames.includes(wallet)
    );
  } else {
    return installedExtensions;
  }
}

export function getWalletApi(wallet: string) {
  const displayName =
    knownWalletExtensions[wallet as KnownWalletName]?.display ?? wallet;
  if (typeof window === "undefined") {
    throw new ServerWalletNotSupported();
  } else if (typeof window.cardano === "undefined") {
    throw new WalletExtensionNotFoundError(displayName);
  } else if (typeof window.cardano[wallet] === "undefined") {
    throw new WalletNotInstalledError(displayName);
  } else if (typeof window.cardano[wallet].enable !== "function") {
    throw new WalletNotCip30CompatibleError(displayName);
  } else {
    return window.cardano[wallet].enable();
  }
}

export async function getRewardAddresses(api: WalletApi) {
  if (typeof api.getRewardAddresses === "function") {
    const hexAddresses = await api.getRewardAddresses();
    if (hexAddresses && hexAddresses.length > 0) {
      return hexAddresses.map((hexAddress: string) =>
        decodeHexAddress(hexAddress)
      );
    } else {
      return [];
    }
  }
}

export async function getNetwork(api: WalletApi) {
  if (typeof api.getRewardAddresses === "function") {
    const hexAddresses = await api.getRewardAddresses();

    if (hexAddresses && hexAddresses.length > 0) {
      try {
        const bech32Address = decodeHexAddress(hexAddresses[0]);

        let networkType = NetworkType.MAINNET;
        if (bech32Address.startsWith("stake_test")) {
          networkType = NetworkType.TESTNET;
        }

        return networkType;
      } catch (error) {
        console.log(error);
      }
    }
  }

  throw new WalletNetworkDetectError();
}

export async function getBalanceAda(api: WalletApi) {
  if (typeof api.getBalance === "function") {
    const cborBalance = await api.getBalance();
    const balance = decodeCbor(Buffer.from(cborBalance, "hex"), {
      useMaps: true,
    });
    return Array.isArray(balance)
      ? balance[0] / 1_000_000
      : balance / 1_000_000;
  }

  return 0;
}

export async function getStakeAddress(api: WalletApi) {
  if (typeof api.getRewardAddresses === "function") {
    const hexAddresses = await api.getRewardAddresses();

    if (hexAddresses && hexAddresses.length > 0) {
      try {
        return decodeHexAddress(hexAddresses[0]);
      } catch (error) {}
    }
  }

  return "";
}

export async function getChangeAddress(api: WalletApi) {
  if (typeof api.getChangeAddress === "function") {
    const hexAddress = await api.getChangeAddress();

    if (hexAddress) {
      try {
        return decodeHexAddress(hexAddress);
      } catch (error) {}
    }
  }

  return "";
}

export async function signMessage(
  walletName: string,
  message: string,
  onSignMessage?: (signature: string, key: string | undefined) => void,
  onSignError?: (error: Error) => void,
  network?: NetworkType
) {
  if (!walletName || typeof message === "undefined") {
    return;
  }

  const onError = (error: Error) => {
    if (typeof onSignError === "function") {
      onSignError(error);
    } else {
      console.warn(error);
    }
  };

  let api: WalletApi;
  let networkType: NetworkType;
  try {
    api = await getWalletApi(walletName);
    networkType = await getNetwork(api);
  } catch (error) {
    onError(error as Error);
    return;
  }

  if (network && network !== networkType) {
    onError(new WrongNetworkTypeError(network, networkType));
  } else {
    const hexAddresses = await api.getRewardAddresses();
    if (hexAddresses.length > 0) {
      const hexAddress = hexAddresses[0];
      let hexMessage = "";
      for (var i = 0, l = message.length; i < l; i++) {
        hexMessage += message.charCodeAt(i).toString(16);
      }
      try {
        const dataSignature = await api.signData(hexAddress, hexMessage);
        if (typeof onSignMessage === "function") {
          const { signature, key } = dataSignature;
          onSignMessage(signature, key);
        }
      } catch (error) {
        onError(error as Error);
      }
    }
  }
}
