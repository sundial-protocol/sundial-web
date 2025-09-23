"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

import {
  connect as connectInternal,
  disconnect as disconnectInternal,
  initWallet,
  WalletContext,
  WalletContextSetters,
  WalletContextType,
} from "@/lib/wallet";
import { LucidEvolution, Network, WalletApi } from "@evolution-sdk/lucid";

export function WalletProvider({ children }: PropsWithChildren) {
  const [lucid, setLucid] = useState<LucidEvolution | null>(null);
  const [api, setApi] = useState<WalletApi | null>(null);
  const [isInitializing, setInitializing] = useState(false);
  const [isInitialized, setInitialized] = useState(false);
  const [isEnabled, setEnabled] = useState(false);
  const [isConnecting, setConnecting] = useState(false);
  const [isConnected, setConnected] = useState(false);
  const [network, setNetwork] = useState<Network>("Mainnet");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [lastSelectedWallet, setLastSelectedWallet] = useLocalStorage(
    "mintun:selected:wallet",
    ""
  );
  const [changeAddress, setChangeAddress] = useState("");
  const [stakeAddress, setStakeAddress] = useState("");
  const [installedExtensions, setInstalledExtensions] = useState<Array<string>>(
    []
  );
  const [accountBalance, setAccountBalance] = useState<number>(0);

  const setters: WalletContextSetters = useMemo(
    () => ({
      setLucid,
      setApi,
      setInitializing,
      setInitialized,
      setEnabled,
      setConnecting,
      setConnected,
      setNetwork,
      setSelectedWallet,
      setLastSelectedWallet,
      setChangeAddress,
      setStakeAddress,
      setInstalledExtensions,
      setAccountBalance,
    }),
    [
      setLucid,
      setApi,
      setInitializing,
      setInitialized,
      setEnabled,
      setConnecting,
      setConnected,
      setNetwork,
      setSelectedWallet,
      setLastSelectedWallet,
      setChangeAddress,
      setStakeAddress,
      setInstalledExtensions,
      setAccountBalance,
    ]
  );

  const connect = useCallback(
    async (wallet: string) => {
      if (lucid) {
        await connectInternal(lucid, wallet, setters);
      } else {
        await disconnectInternal(setters);
        toast.error(
          "State was invalid while connecting. The state has been reset. Please try again."
        );
      }
    },
    [lucid, setters]
  );

  const disconnect = useCallback(() => disconnectInternal(setters), [setters]);

  const context: WalletContextType = useMemo(
    () => ({
      lucid,
      api,
      isInitializing,
      isInitialized,
      isEnabled,
      isConnecting,
      isConnected,
      network,
      selectedWallet,
      lastSelectedWallet,
      changeAddress,
      stakeAddress,
      installedExtensions,
      accountBalance,
      connect,
      disconnect,
    }),
    [
      lucid,
      api,
      isInitializing,
      isInitialized,
      isEnabled,
      isConnecting,
      isConnected,
      network,
      selectedWallet,
      lastSelectedWallet,
      changeAddress,
      stakeAddress,
      installedExtensions,
      accountBalance,
      connect,
      disconnect,
    ]
  );

  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initWallet(lastSelectedWallet, setters);
    }
  }, [isInitialized, isInitializing, lastSelectedWallet, setters]);

  return (
    <WalletContext.Provider value={context}>{children}</WalletContext.Provider>
  );
}
