import { WalletApi } from "@/global";
import { decode as decodeCbor } from "cborg";

import { knownWalletExtensions } from ".";
import {
  ServerWalletNotSupported,
  WalletExtensionNotFoundError,
  WalletNetworkDetectError,
  WalletNotCip30CompatibleError,
  WalletNotInstalledError,
  WrongNetworkTypeError,
} from "./errors";
import { decodeHexAddress, NetworkType } from "./util";
import type {
  Lucid,
  UTxO,
  Assets,
  TxBuilder,
  LucidEvolution,
} from "@evolution-sdk/lucid";
import { adaToLovelace, lovelaceToAda } from "../cardano";
import {
  TransactionError,
  InsufficientFundsError,
  handleWalletError,
} from "./errors";

// Wallet utility class for common operations
export class WalletUtils {
  constructor(private lucid: LucidEvolution) {}

  // Get wallet balance
  async getBalance(): Promise<{ ada: number; assets: Assets }> {
    try {
      const utxos = await this.lucid.wallet().getUtxos();
      let totalLovelace = BigInt(0);
      const allAssets: Assets = { lovelace: BigInt(0) };

      for (const utxo of utxos) {
        totalLovelace += utxo.assets.lovelace || BigInt(0);

        // Aggregate all assets
        for (const [unit, amount] of Object.entries(utxo.assets)) {
          if (unit === "lovelace") continue;
          allAssets[unit] = (allAssets[unit] || BigInt(0)) + amount;
        }
      }

      allAssets.lovelace = totalLovelace;

      return {
        ada: lovelaceToAda(totalLovelace),
        assets: allAssets,
      };
    } catch (error) {
      throw handleWalletError(error);
    }
  }

  // Get UTxOs with minimum ADA value
  async getUtxosWithMinAda(minAda: number): Promise<UTxO[]> {
    try {
      const utxos = await this.lucid.wallet().getUtxos();
      const minLovelace = adaToLovelace(minAda);

      return utxos.filter(
        (utxo) => (utxo.assets.lovelace || BigInt(0)) >= minLovelace
      );
    } catch (error) {
      throw handleWalletError(error);
    }
  }

  // Create a simple ADA transfer transaction
  async createAdaTransfer(
    toAddress: string,
    adaAmount: number
  ): Promise<string> {
    try {
      const lovelaceAmount = adaToLovelace(adaAmount);

      // Check if we have sufficient balance
      const balance = await this.getBalance();
      if (balance.assets.lovelace < lovelaceAmount) {
        throw new InsufficientFundsError();
      }

      const tx = await this.lucid
        .newTx()
        .pay.ToAddress(toAddress, { lovelace: lovelaceAmount })
        .complete();

      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      return txHash;
    } catch (error) {
      throw handleWalletError(error);
    }
  }

  // Create a transaction with multiple outputs
  async createMultiOutput(
    outputs: Array<{ address: string; assets: Assets }>
  ): Promise<string> {
    try {
      let tx = this.lucid.newTx();

      for (const output of outputs) {
        tx = tx.pay.ToAddress(output.address, output.assets);
      }

      const completeTx = await tx.complete();
      const signedTx = await completeTx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      return txHash;
    } catch (error) {
      throw handleWalletError(error);
    }
  }

  // Estimate transaction fee
  async estimateTransactionFee(
    toAddress: string,
    assets: Assets
  ): Promise<bigint> {
    try {
      const tx = await this.lucid
        .newTx()
        .pay.ToAddress(toAddress, assets)
        .complete();

      return tx.toTransaction().body().fee();
    } catch (error) {
      throw handleWalletError(error);
    }
  }

  // Get transaction history (requires additional API integration)
  async getTransactionHistory(limit = 10): Promise<
    Array<{
      hash: string;
      timestamp?: number;
      inputs: UTxO[];
      outputs: UTxO[];
    }>
  > {
    try {
      // This would require integration with a blockchain explorer API
      // For now, return empty array
      console.warn("Transaction history requires additional API integration");
      return [];
    } catch (error) {
      throw handleWalletError(error);
    }
  }

  // Wait for transaction confirmation
  async waitForConfirmation(
    txHash: string,
    maxWaitTime = 300000 // 5 minutes
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // This would require integration with a blockchain explorer API
        // For now, just wait and return true
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        return true;
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
      }
    }

    return false;
  }

  // Get current network
  getNetwork(): string {
    return this.lucid.config().network || "unknown";
  }

  // Get current wallet address
  async getCurrentAddress(): Promise<string> {
    try {
      return await this.lucid.wallet().address();
    } catch (error) {
      throw handleWalletError(error);
    }
  }

  // Get stake address
  async getStakeAddress(): Promise<string | null> {
    try {
      return await this.lucid.wallet().rewardAddress();
    } catch (error) {
      console.warn("Failed to get stake address:", error);
      return null;
    }
  }

  // Sign arbitrary data
  async signData(
    payload: string,
    address?: string
  ): Promise<{ signature: string; key: string }> {
    try {
      const addr = address || (await this.getCurrentAddress());
      const signature = await this.lucid.wallet().signMessage(addr, payload);

      return {
        signature: signature.signature,
        key: signature.key,
      };
    } catch (error) {
      throw handleWalletError(error);
    }
  }
}

// Factory function to create WalletUtils instance
export function createWalletUtils(lucid: LucidEvolution): WalletUtils {
  return new WalletUtils(lucid);
}

// Helper functions for common wallet operations
export async function getWalletBalance(lucid: LucidEvolution): Promise<number> {
  const utils = createWalletUtils(lucid);
  const balance = await utils.getBalance();
  return balance.ada;
}

export async function sendAda(
  lucid: LucidEvolution,
  toAddress: string,
  amount: number
): Promise<string> {
  const utils = createWalletUtils(lucid);
  return utils.createAdaTransfer(toAddress, amount);
}

export function getInstalledWalletExtensions(supportedWallets?: string[]) {
  if (typeof window === "undefined" || typeof window.cardano === "undefined") {
    return [];
  }

  const { cardano } = window;
  const installedExtensions = Object.keys(cardano)
    .filter(
      (walletExtension) =>
        walletExtension !== "typhon" &&
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
  const displayName = knownWalletExtensions[wallet]?.display ?? wallet;
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
