import { BrowserWallet } from "@meshsdk/core";
import type { WalletContextSetters } from "./context";
import { getInstalledWallets } from "./support";
import {
  notifyError,
  WalletConnectError,
  ExtensionNotInjectedError,
  WalletNotInstalledError,
  EnablementFailedError,
  ServerWalletNotSupported,
} from "./errors";

export const loadMesh = async () => {
  if (typeof window === "undefined") {
    throw new ServerWalletNotSupported();
  }

  try {
    console.log("Loading MeshSDK...");
    const meshModule = await import("@meshsdk/core");
    console.log("MeshSDK loaded successfully");
    return meshModule;
  } catch (error) {
    console.error("Failed to load MeshSDK:", error);
    throw new Error("Failed to load MeshSDK");
  }
};

export async function connect(
  walletName: string,
  setters: WalletContextSetters
): Promise<void> {
  const {
    setConnecting,
    setConnected,
    setSelectedWallet,
    setLastSelectedWallet,
    setChangeAddress,
    setStakeAddress,
    setAccountBalance,
    setWallet,
    setEnabled,
  } = setters;

  try {
    setConnecting(true);

    // Check if we're in browser environment
    if (typeof window === "undefined") {
      throw new ServerWalletNotSupported();
    }

    // Check if wallet is installed
    const installedWallets = await getInstalledWallets();
    if (!installedWallets.includes(walletName)) {
      throw new WalletNotInstalledError(walletName);
    }

    // Load MeshSDK dynamically
    const meshModule = await loadMesh();
    if (!meshModule) {
      throw new Error("Failed to load MeshSDK");
    }

    const { BrowserWallet } = meshModule;

    // Check if wallet extension is available
    if (!window.cardano || !window.cardano[walletName]) {
      throw new ExtensionNotInjectedError(walletName);
    }

    // Connect to the wallet
    let wallet: BrowserWallet;
    try {
      wallet = await BrowserWallet.enable(walletName);
    } catch (error) {
      throw new EnablementFailedError(walletName);
    }

    if (!wallet) {
      throw new WalletConnectError(
        walletName,
        "Wallet connection returned null"
      );
    }

    // Get wallet addresses
    const changeAddress = await wallet.getChangeAddress();
    const rewardAddresses = await wallet.getRewardAddresses();
    const stakeAddress = rewardAddresses.length > 0 ? rewardAddresses[0] : "";

    // Get wallet balance
    const utxos = await wallet.getUtxos();
    let totalLovelace = 0;

    for (const utxo of utxos) {
      const lovelaceAmount = utxo.output.amount.find(
        (asset) => asset.unit === "lovelace"
      );
      if (lovelaceAmount) {
        totalLovelace += parseInt(lovelaceAmount.quantity);
      }
    }

    const adaBalance = totalLovelace / 1_000_000; // Convert lovelace to ADA

    // Update context
    setWallet(wallet);
    setChangeAddress(changeAddress);
    setStakeAddress(stakeAddress);
    setAccountBalance(adaBalance);
    setSelectedWallet(walletName);
    setLastSelectedWallet(walletName);
    setEnabled(true);
    setConnected(true);

    console.log(`Successfully connected to ${walletName}`);
  } catch (error: any) {
    console.error(`Failed to connect to ${walletName}:`, error);

    // Use existing error handling
    if (
      error instanceof WalletConnectError ||
      error instanceof ExtensionNotInjectedError ||
      error instanceof WalletNotInstalledError ||
      error instanceof EnablementFailedError ||
      error instanceof ServerWalletNotSupported
    ) {
      notifyError(error);
    } else {
      notifyError(
        new WalletConnectError(walletName, error.message || "Unknown error")
      );
    }

    throw error;
  } finally {
    setConnecting(false);
  }
}

export async function disconnect(setters: WalletContextSetters): Promise<void> {
  const {
    setWallet,
    setConnected,
    setEnabled,
    setSelectedWallet,
    setChangeAddress,
    setStakeAddress,
    setAccountBalance,
  } = setters;

  setWallet(null);
  setConnected(false);
  setEnabled(false);
  setSelectedWallet("");
  setChangeAddress("");
  setStakeAddress("");
  setAccountBalance(0);

  console.log("Wallet disconnected");
}

export async function initWallet(
  lastSelectedWallet: string,
  setters: WalletContextSetters
): Promise<void> {
  const { setInitializing, setInitialized, setInstalledExtensions } = setters;

  try {
    setInitializing(true);

    // Check if we're in browser environment
    if (typeof window === "undefined") {
      throw new ServerWalletNotSupported();
    }

    // Get installed wallet extensions
    const installedWallets = await getInstalledWallets();
    setInstalledExtensions(installedWallets);

    // Auto-connect to last selected wallet if available
    if (lastSelectedWallet && installedWallets.includes(lastSelectedWallet)) {
      try {
        await connect(lastSelectedWallet, setters);
      } catch (error) {
        console.warn("Failed to auto-connect to last wallet:", error);
        // Don't throw - just continue with initialization
      }
    }

    setInitialized(true);
  } catch (error) {
    console.error("Failed to initialize wallet:", error);
    if (!(error instanceof ServerWalletNotSupported)) {
      notifyError(error);
    }
    setInitialized(true); // Still mark as initialized even if there's an error
  } finally {
    setInitializing(false);
  }
}
