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
    "sundial:selected:wallet",
    ""
  );
  const [changeAddress, setChangeAddress] = useState("");
  const [stakeAddress, setStakeAddress] = useState("");
  const [installedExtensions, setInstalledExtensions] = useState<Array<string>>(
    []
  );
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [walletReady, setWalletReady] = useState(false);

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
      console.log("Starting wallet initialization from provider...");
      initWallet(lastSelectedWallet, setters).catch((error) => {
        console.error("Wallet initialization failed in provider:", error);
        // Prevent infinite retry loop
        setInitialized(true);
        setInitializing(false);
      });
    }
  }, [isInitialized, isInitializing, lastSelectedWallet, setters]);

  useEffect(() => {
    // Ensure we're on client-side
    if (typeof window === "undefined") return;

    // Add BigInt polyfill check
    if (typeof BigInt === "undefined") {
      console.error("BigInt not supported in this environment");
      return;
    }

    setIsClient(true);

    // Load wallet libraries safely
    const loadWallet = async () => {
      try {
        // Only load after client is ready
        await import("@evolution-sdk/lucid");
        setWalletReady(true);
      } catch (error) {
        console.error("Failed to load wallet libraries:", error);
        setWalletReady(true); // Still render to prevent hanging
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(loadWallet, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient || !walletReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading wallet services...</p>
        </div>
      </div>
    );
  }

  return (
    <WalletContext.Provider value={context}>{children}</WalletContext.Provider>
  );
}
