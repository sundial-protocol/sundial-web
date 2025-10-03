import { BrowserWallet } from "@meshsdk/core";
import { type WalletContextSetters, loadMesh } from "./context";
import {
  getWalletApi,
  getBalanceAda,
  getChangeAddress,
  getStakeAddress,
  getNetwork,
} from "./wallet";
import { getInstalledWallets } from "./support";
import {
  notifyError,
  WalletConnectError,
  WalletNotInstalledError,
  ServerWalletNotSupported,
} from "./errors";
import { NetworkType } from "./util";

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
    setApi,
    setEnabled,
    setNetwork,
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

    // Use existing wallet API functions
    const api = await getWalletApi(walletName);
    if (!api) {
      throw new WalletConnectError(walletName, "Failed to get wallet API");
    }

    // Get wallet information using existing functions
    const changeAddr = await getChangeAddress(api);
    const stakeAddr = await getStakeAddress(api);
    const balance = await getBalanceAda(api);
    const networkType = await getNetwork(api);

    // Convert network type to our format
    const network = networkType === NetworkType.MAINNET ? "mainnet" : "testnet";

    // Try to create MeshSDK BrowserWallet as well for compatibility
    let wallet: BrowserWallet | null = null;
    try {
      const meshModule = await loadMesh();
      if (meshModule) {
        const { BrowserWallet } = meshModule;
        wallet = await BrowserWallet.enable(walletName);
      }
    } catch (error) {
      console.warn("Failed to create MeshSDK wallet, using API only:", error);
    }

    // Update context
    setApi(api);
    setWallet(wallet);
    setChangeAddress(changeAddr);
    setStakeAddress(stakeAddr);
    setAccountBalance(balance);
    setNetwork(network);
    setSelectedWallet(walletName);
    setLastSelectedWallet(walletName);
    setEnabled(true);
    setConnected(true);

    console.log(`Successfully connected to ${walletName}`);
  } catch (error: any) {
    console.error(`Failed to connect to ${walletName}:`, error);

    // Use existing error handling
    notifyError(error);
    throw error;
  } finally {
    setConnecting(false);
  }
}

export async function disconnect(setters: WalletContextSetters): Promise<void> {
  const {
    setWallet,
    setApi,
    setConnected,
    setEnabled,
    setSelectedWallet,
    setChangeAddress,
    setStakeAddress,
    setAccountBalance,
  } = setters;

  setWallet(null);
  setApi(null);
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
