"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserWallet } from "@meshsdk/core";
import { WalletApi } from "@/global";
import { toast } from "sonner";

import {
  connect as connectInternal,
  disconnect as disconnectInternal,
  initWallet,
  WalletContext,
  WalletContextSetters,
  WalletContextType,
  type Network,
  getErrorMessage,
  WalletConnectError,
  ExtensionNotInjectedError,
  WalletNotInstalledError,
  EnablementFailedError,
  WalletApiError,
} from "@/lib/wallet";

export function WalletProvider({ children }: PropsWithChildren) {
  console.log("🚀 WalletProvider: Component rendering started");

  // State
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [api, setApi] = useState<WalletApi | null>(null);
  const [isInitializing, setInitializing] = useState(true); // Start as true
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

  const setters: WalletContextSetters = useMemo(
    () => ({
      setWallet,
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
    []
  );

  const connect = useCallback(
    async (walletName: string) => {
      try {
        console.log("🔌 WalletProvider: Connecting to", walletName);
        await connectInternal(walletName, setters);
        console.log("✅ WalletProvider: Successfully connected to", walletName);
        toast.success(`Connected to ${walletName}`);
      } catch (error) {
        console.error("❌ WalletProvider: Connection failed:", error);
        await disconnectInternal(setters);

        // Use existing error handling
        if (
          error instanceof WalletApiError ||
          error instanceof WalletConnectError ||
          error instanceof ExtensionNotInjectedError ||
          error instanceof WalletNotInstalledError ||
          error instanceof EnablementFailedError
        ) {
          // Error already handled in connect function via notifyError
          // Don't show duplicate toast
        } else {
          toast.error("Failed to connect wallet. Please try again.");
        }

        // Re-throw the error so calling code can handle it
        throw error;
      }
    },
    [setters]
  );

  const disconnect = useCallback(async () => {
    try {
      console.log("🔌 WalletProvider: Disconnecting wallet");
      await disconnectInternal(setters);
      console.log("✅ WalletProvider: Successfully disconnected");
      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("❌ WalletProvider: Disconnect failed:", error);
      toast.error("Failed to disconnect wallet");
    }
  }, [setters]);

  const context: WalletContextType = useMemo(() => {
    const ctx = {
      wallet,
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
    };
    console.log("🔧 WalletProvider: Context updated:", {
      isInitializing,
      isInitialized,
      isConnected,
      selectedWallet,
      installedExtensions: installedExtensions.length,
    });
    return ctx;
  }, [
    wallet,
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
  ]);

  // Initialize immediately on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log("🏁 WalletProvider: Starting initialization");

        // Load last selected wallet from localStorage
        let savedWallet = "";
        if (typeof window !== "undefined") {
          savedWallet = localStorage.getItem("sundial:selected:wallet") || "";
          console.log("📦 WalletProvider: Loaded saved wallet:", savedWallet);
          if (mounted) {
            setLastSelectedWallet(savedWallet);
          }
        }

        // Initialize wallet system
        await initWallet(savedWallet, setters);

        console.log("✅ WalletProvider: Initialization completed");
      } catch (error) {
        console.error(
          "❌ WalletProvider: Failed to initialize wallet system:",
          error
        );
        // Don't show toast for ServerWalletNotSupported as it's expected on server
        if (
          !(error instanceof Error && error.name === "ServerWalletNotSupported")
        ) {
          toast.error("Failed to initialize wallet system");
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [setters]);

  // Save lastSelectedWallet to localStorage when it changes
  useEffect(() => {
    if (lastSelectedWallet && typeof window !== "undefined") {
      console.log(
        "💾 WalletProvider: Saving wallet to localStorage:",
        lastSelectedWallet
      );
      localStorage.setItem("sundial:selected:wallet", lastSelectedWallet);
    }
  }, [lastSelectedWallet]);

  console.log("📦 WalletProvider: Providing context to children");
  return (
    <WalletContext.Provider value={context}>{children}</WalletContext.Provider>
  );
}
