import type { LucidEvolution, Network, WalletApi } from "@evolution-sdk/lucid";
import type { WalletContextSetters } from "./context";
import { getInstalledWallets } from "./support";
import { notifyError } from "./errors";

// Dynamic import function for @evolution-sdk/lucid
export const loadLucid = async () => {
  if (typeof window === "undefined") {
    return null; // Don't load on server
  }

  try {
    const { Lucid, Blockfrost } = await import("@evolution-sdk/lucid");
    return { Lucid, Blockfrost };
  } catch (error) {
    console.error("Failed to load Lucid:", error);
    return null;
  }
};

export async function initWallet(
  lastSelectedWallet: string,
  setters: WalletContextSetters
) {
  setters.setInitializing(true);

  try {
    // Only initialize on client side
    if (typeof window === "undefined") {
      setters.setInitializing(false);
      return;
    }

    // Load Lucid dynamically
    const lucidModule = await loadLucid();
    if (!lucidModule) {
      throw new Error("Failed to load Lucid library");
    }

    const { Lucid, Blockfrost } = lucidModule;

    // Initialize Lucid with Blockfrost
    const lucid = await Lucid(
      new Blockfrost(
        process.env.NEXT_PUBLIC_BLOCKFROST_URL ||
          "https://cardano-mainnet.blockfrost.io/api/v0",
        process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "mainnetdefault"
      ),
      "Mainnet"
    );

    setters.setLucid(lucid);
    setters.setNetwork("Mainnet");

    // Get installed wallets
    const installedWallets = getInstalledWallets();
    setters.setInstalledExtensions(installedWallets);

    // Auto-connect to last selected wallet if available
    if (lastSelectedWallet && installedWallets.includes(lastSelectedWallet)) {
      await connect(lucid, lastSelectedWallet, setters);
    }

    setters.setInitialized(true);
  } catch (error) {
    console.error("Failed to initialize wallet:", error);
    notifyError(error);
  } finally {
    setters.setInitializing(false);
  }
}

export async function connect(
  lucid: LucidEvolution,
  walletName: string,
  setters: WalletContextSetters
) {
  setters.setConnecting(true);

  try {
    // Check if wallet extension is available
    if (!window.cardano || !window.cardano[walletName]) {
      throw new Error(
        `${walletName} wallet not found. Please make sure it's installed and enabled.`
      );
    }

    // Enable the wallet
    const api = await window.cardano[walletName].enable();

    // Select wallet in Lucid
    lucid.selectWallet.fromAPI(api);

    setters.setApi(api);
    setters.setSelectedWallet(walletName);
    setters.setLastSelectedWallet(walletName);
    setters.setEnabled(true);
    setters.setConnected(true);

    // Get addresses and balance
    const changeAddress = await lucid.wallet().address();
    const stakeAddress = await lucid.wallet().rewardAddress();
    const utxos = await lucid.wallet().getUtxos();

    // Calculate balance from UTXOs
    const balance = utxos.reduce((total, utxo) => {
      const lovelace = utxo.assets.lovelace || BigInt(0);
      return total + Number(lovelace);
    }, 0);

    setters.setChangeAddress(changeAddress);
    setters.setStakeAddress(stakeAddress || "");
    setters.setAccountBalance(balance / 1_000_000); // Convert from Lovelace to ADA
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    setters.setConnecting(false);
    setters.setConnected(false);
    throw error;
  } finally {
    setters.setConnecting(false);
  }
}

export function disconnect(setters: WalletContextSetters) {
  setters.setApi(null);
  setters.setEnabled(false);
  setters.setConnected(false);
  setters.setSelectedWallet("");
  setters.setChangeAddress("");
  setters.setStakeAddress("");
  setters.setAccountBalance(0);
  setters.setLastSelectedWallet("");
}

// Helper function to check wallet availability
export function isWalletAvailable(walletName: string): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.cardano && window.cardano[walletName]);
}

// Helper function to get wallet API version
export async function getWalletApiVersion(walletName: string): Promise<string> {
  if (!isWalletAvailable(walletName)) {
    throw new Error(`${walletName} wallet not available`);
  }

  try {
    const apiVersion = await window.cardano[walletName].apiVersion;
    return apiVersion || "unknown";
  } catch (error) {
    return "unknown";
  }
}
