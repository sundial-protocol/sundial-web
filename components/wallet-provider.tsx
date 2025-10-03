"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserWallet } from "@meshsdk/core";
import { toast } from "sonner";

import {
  connect as connectInternal,
  disconnect as disconnectInternal,
  initWallet,
  WalletContext,
  WalletContextSetters,
  WalletContextType,
  type Network,
} from "@/lib/wallet";

export function WalletProvider({ children }: PropsWithChildren) {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [isInitializing, setInitializing] = useState(false);
  const [isInitialized, setInitialized] = useState(false);
  const [isEnabled, setEnabled] = useState(false);
  const [isConnecting, setConnecting] = useState(false);
  const [isConnected, setConnected] = useState(false);
  const [network, setNetwork] = useState<Network>("mainnet");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [lastSelectedWallet, setLastSelectedWallet] = useState("");
  const [changeAddress, setChangeAddress] = useState("");
  const [stakeAddress, setStakeAddress] = useState("");
  const [installedExtensions, setInstalledExtensions] = useState<Array<string>>(
    []
  );
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  const setters: WalletContextSetters = useMemo(
    () => ({
      setWallet,
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
    []
  );

  const connect = useCallback(
    async (walletName: string) => {
      try {
        await connectInternal(walletName, setters);
      } catch (error) {
        console.error("Connection failed:", error);
        await disconnectInternal(setters);
        toast.error("Failed to connect wallet. Please try again.");
      }
    },
    [setters]
  );

  const disconnect = useCallback(() => disconnectInternal(setters), [setters]);

  const context: WalletContextType = useMemo(
    () => ({
      wallet,
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
      wallet,
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

  // Handle localStorage in useEffect to avoid hydration issues
  useEffect(() => {
    setMounted(true);

    // Load last selected wallet from localStorage
    const savedWallet = localStorage.getItem("sundial:selected:wallet") || "";
    setLastSelectedWallet(savedWallet);
  }, []);

  // Save lastSelectedWallet to localStorage when it changes
  useEffect(() => {
    if (mounted && lastSelectedWallet) {
      localStorage.setItem("sundial:selected:wallet", lastSelectedWallet);
    }
  }, [lastSelectedWallet, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const initializeWallet = async () => {
      try {
        console.log("Starting wallet initialization...");

        // Initialize wallet system
        await initWallet(lastSelectedWallet, setters);

        console.log("Wallet initialization completed");
      } catch (error) {
        console.error("Failed to initialize wallet system:", error);
        toast.error("Failed to initialize wallet system");
      }
    };

    // Add a delay to ensure the page is fully loaded
    const timeoutId = setTimeout(initializeWallet, 1000);

    return () => clearTimeout(timeoutId);
  }, [mounted, lastSelectedWallet, setters]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WalletContext.Provider value={context}>{children}</WalletContext.Provider>
  );
}
