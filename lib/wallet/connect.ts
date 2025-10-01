import type { LucidEvolution, Network, WalletApi } from "@evolution-sdk/lucid";
import type { WalletContextSetters } from "./context";
import { getInstalledWallets } from "./support";
import { notifyError } from "./errors";
import { connect as connectInternal } from "@/lib/wallet";

// Dynamic import function for @evolution-sdk/lucid
export const loadLucid = async () => {
  if (typeof window === "undefined") {
    return null; // Don't load on server
  }

  // Check BigInt support
  if (typeof BigInt === "undefined") {
    console.error("BigInt not supported");
    return null;
  }

  try {
    console.log("Importing Lucid modules...");

    // Try Evolution SDK first
    const { Lucid, Blockfrost } = await import("@evolution-sdk/lucid");

    if (!Lucid || !Blockfrost) {
      throw new Error("Failed to import required modules");
    }

    console.log("Successfully imported Lucid Evolution");
    return { Lucid, Blockfrost };
  } catch (evolutionError) {
    console.warn("Evolution SDK failed", evolutionError);
  }
};

// Add safe BigInt conversion helper
export const safeBigInt = (value: any): bigint | null => {
  try {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === "bigint") {
      return value;
    }
    if (typeof value === "string" || typeof value === "number") {
      return BigInt(value);
    }
    return null;
  } catch (error) {
    console.error("Failed to convert to BigInt:", error);
    return null;
  }
};

export const initWallet = async (
  lastSelectedWallet: string,
  setters: WalletContextSetters
) => {
  try {
    console.log("Starting wallet initialization...");

    // Check if we're on the client
    if (typeof window === "undefined") {
      console.log("Server-side detected, skipping wallet init");
      return;
    }

    // Check BigInt support
    if (typeof BigInt === "undefined") {
      console.error("BigInt not supported");
      setters.setInitialized(true); // Mark as initialized to prevent retry
      return;
    }

    setters.setInitializing(true);

    console.log("Loading Lucid library...");
    const lucidModule = await loadLucid().then((res) => {
      if (!res) {
        console.error("Failed to load Lucid module");
        throw new Error("Lucid library could not be loaded");
      } else return res;
    });

    const { Lucid, Blockfrost } = lucidModule;

    console.log("Creating Lucid instance...");

    // Create Lucid instance with error handling
    let lucidInstance;
    try {
      const provider = new Blockfrost(
        process.env.NEXT_PUBLIC_BLOCKFROST_URL ||
          "https://cardano-mainnet.blockfrost.io/api/v0",
        process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || ""
      );

      lucidInstance = await Lucid(provider, "Mainnet");
    } catch (providerError) {
      console.error("Failed to create Lucid instance:", providerError);
      throw new Error("Failed to create blockchain provider");
    }

    setters.setLucid(lucidInstance);
    console.log("Lucid instance created successfully");

    // Check for installed wallets
    console.log("Checking installed wallet extensions...");
    const installedWallets = [];

    if (typeof window.cardano !== "undefined") {
      // Common Cardano wallets
      const walletNames = ["nami", "eternl", "flint", "yoroi", "typhoncip30"];

      for (const walletName of walletNames) {
        try {
          if (window.cardano[walletName]) {
            installedWallets.push(walletName);
            console.log(`Found wallet: ${walletName}`);
          }
        } catch (walletCheckError) {
          console.warn(
            `Error checking wallet ${walletName}:`,
            walletCheckError
          );
        }
      }
    }

    setters.setInstalledExtensions(installedWallets);
    console.log("Installed wallets:", installedWallets);

    // Try to reconnect to last selected wallet
    if (lastSelectedWallet && installedWallets.includes(lastSelectedWallet)) {
      console.log(`Attempting to reconnect to ${lastSelectedWallet}...`);
      try {
        await connectInternal(lucidInstance, lastSelectedWallet, setters);
      } catch (reconnectError) {
        console.warn("Failed to reconnect to last wallet:", reconnectError);
        // Don't throw here, just log the warning
      }
    }

    setters.setInitialized(true);
    console.log("Wallet initialization completed successfully");
  } catch (error) {
    console.error("Failed to initialize wallet:", error);

    // Set some fallback state to prevent infinite retry
    setters.setInitialized(true);
    setters.setLucid(null);
    setters.setInstalledExtensions([]);

    // You might want to show a toast error here
    // toast.error("Failed to initialize wallet system");
  } finally {
    setters.setInitializing(false);
  }
};

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
    const apiVersion =
      window.cardano && window.cardano[walletName]
        ? window.cardano[walletName].apiVersion
        : "unknown";
    return apiVersion || "unknown";
  } catch (error) {
    return "unknown";
  }
}
