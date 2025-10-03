import { createContext, useContext } from "react";
import { BrowserWallet } from "@meshsdk/core";

export type Network = "mainnet" | "testnet" | "preview" | "preprod";

export interface WalletContextSetters {
  setWallet: (wallet: BrowserWallet | null) => void;
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

export const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
