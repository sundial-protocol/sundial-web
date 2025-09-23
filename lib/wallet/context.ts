"use client";

import { createContext, Dispatch, SetStateAction, useContext } from "react";
import type { LucidEvolution, Network, WalletApi } from "@evolution-sdk/lucid";

export type WalletContextType = {
  lucid: LucidEvolution | null;
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
};

export type WalletContextSetters = {
  setLucid: Dispatch<SetStateAction<LucidEvolution | null>>;
  setApi: Dispatch<SetStateAction<WalletApi | null>>;
  setInitializing: Dispatch<SetStateAction<boolean>>;
  setInitialized: Dispatch<SetStateAction<boolean>>;
  setEnabled: Dispatch<SetStateAction<boolean>>;
  setConnecting: Dispatch<SetStateAction<boolean>>;
  setConnected: Dispatch<SetStateAction<boolean>>;
  setNetwork: Dispatch<SetStateAction<Network>>;
  setSelectedWallet: Dispatch<SetStateAction<string>>;
  setLastSelectedWallet: Dispatch<SetStateAction<string>>;
  setChangeAddress: Dispatch<SetStateAction<string>>;
  setStakeAddress: Dispatch<SetStateAction<string>>;
  setInstalledExtensions: Dispatch<SetStateAction<string[]>>;
  setAccountBalance: Dispatch<SetStateAction<number>>;
};

const noop = async (..._: any) => {};

export const WalletContext = createContext<WalletContextType>({
  lucid: null,
  api: null,
  isInitializing: false,
  isInitialized: false,
  isEnabled: false,
  isConnecting: false,
  isConnected: false,
  network: "Mainnet",
  selectedWallet: "",
  lastSelectedWallet: "",
  changeAddress: "",
  stakeAddress: "",
  installedExtensions: [],
  accountBalance: 0,
  connect: noop,
  disconnect: noop,
});

export function useWallet() {
  const context = useContext(WalletContext);

  if (context === undefined)
    throw new Error(
      "Context can only be used withing the CaradanoProvider component"
    );

  return context;
}
