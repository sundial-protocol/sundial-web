import { createContext, useContext } from "react";
import { BrowserWallet } from "@meshsdk/core";
import { WalletApi } from "@/global";

export type Network = "mainnet" | "testnet" | "preview" | "preprod";

export const loadMesh = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    console.log("Loading MeshSDK...");
    const meshModule = await import("@meshsdk/core");
    console.log("MeshSDK loaded successfully");
    return meshModule;
  } catch (error) {
    console.error("Failed to load MeshSDK:", error);
    return null;
  }
};

export interface WalletContextSetters {
  setWallet: (wallet: BrowserWallet | null) => void;
  setApi: (api: WalletApi | null) => void;
  setInitializing: (initializing: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setNetwork: (network: Network) => void;
  setSelectedWallet: (wallet: string) => void;
  setLastSelectedWallet: (wallet: string) => void;
  setChangeAddress: (address: string) => void;
  setStakeAddress: (address: string) => void;
  setInstalledExtensions: (extensions: string[]) => void;
  setAccountBalance: (balance: number) => void;
}

export interface WalletContextType {
  wallet: BrowserWallet | null;
  api: WalletApi | null;
  isInitializing: boolean;
  isInitialized: boolean;
  isEnabled: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  network: Network;
  selectedWallet: string;
  lastSelectedWallet: string;
  changeAddress: string;
  stakeAddress: string;
  installedExtensions: string[];
  accountBalance: number;
  connect: (wallet: string) => Promise<void>;
  disconnect: () => void;
}

// Create context with a default value instead of null
const defaultContext: WalletContextType = {
  wallet: null,
  api: null,
  isInitializing: true,
  isInitialized: false,
  isEnabled: false,
  isConnecting: false,
  isConnected: false,
  network: "mainnet",
  selectedWallet: "",
  lastSelectedWallet: "",
  changeAddress: "",
  stakeAddress: "",
  installedExtensions: [],
  accountBalance: 0,
  connect: async () => {
    throw new Error("WalletProvider not initialized");
  },
  disconnect: () => {
    throw new Error("WalletProvider not initialized");
  },
};

export const WalletContext = createContext<WalletContextType>(defaultContext);

export function useWallet() {
  const context = useContext(WalletContext);

  // Since we now have a default context, this should never be undefined
  // But we can still check if it's the default uninitialized context
  if (context === defaultContext) {
    console.warn("useWallet called before WalletProvider is mounted");
    // Return the default context instead of throwing
    return context;
  }

  return context;
}
