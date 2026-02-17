"use client";

import { useState, useEffect } from "react";
import mempoolJS from "@mempool/mempool.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { chainConfigs, SupportedChain } from "../../../lib/multichain";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import Link from "next/link";
import { PsbtSigning } from "@/components/btc/psbt-signing";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import { WalletButton } from "@/lib/wallet/cardano/wallet-button";
import { useToast } from "@/components/ui/toast";

// Import the actual wallet contexts
import {
  AccountType,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import type { BitcoinConnector } from "@reown/appkit-adapter-bitcoin";
import { useCardanoWallet } from "@/lib/wallet/cardano/context";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TransactionType = "deposit" | "withdraw";

interface StakingFormProps {
  type: TransactionType;
  onSuccess?: (txHash: string, chain: SupportedChain, amount: string) => void;
  onAmountChange?: (amount: string, chain: SupportedChain) => void;
  defaultChain?: SupportedChain;
  dashboardData?: ReturnType<typeof useDashboardContext>;
}

export default function StakingForm({
  type,
  onSuccess,
  onAmountChange,
  defaultChain = "btc",
}: StakingFormProps) {
  const {
    updateStakedAmount,
    addPendingTransaction,
    updateTransactionStatus,
    transactions,
    selectedYieldProvider,
  } = useDashboardContext();

  const { addToast } = useToast();
  const { walletProvider: btcWalletProvider } = useAppKitProvider("bip122");
  const bitcoinConnector = btcWalletProvider as BitcoinConnector;

  // Wallet contexts - using the actual implementations
  const { walletInfo } = useWalletInfo();
  const bitcoinWallet = walletInfo?.name ?? "Unknown Wallet";

  const { address: bitcoinAddress, allAccounts: bitcoinAccounts } =
    useAppKitAccount({ namespace: "bip122" });
  const { caipNetwork } = useAppKitNetwork();

  const { selectedWallet: cardanoWallet, defaultAddress: cardanoAddress } =
    useCardanoWallet();

  const [selectedChain, setSelectedChain] =
    useState<SupportedChain>(defaultChain);
  const [userAddress, setUserAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isUsingConnectedWallet, setIsUsingConnectedWallet] = useState(false);
  const [manualPublicKey, setManualPublicKey] = useState("");

  // Bitcoin-specific states
  const [psbtBase64, setPsbtBase64] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  const [unsignedTransactionData, setUnsignedTransactionData] =
    useState<any>(null);
  const [isCalculatingPsbt, setIsCalculatingPsbt] = useState(false);
  const [step, setStep] = useState<"form" | "psbt" | "broadcast" | "done">(
    "form",
  );

  // ADA-specific states
  const [txHash, setTxHash] = useState("");

  // Locktime for withdrawal transactions
  const [savedLocktime, setSavedLocktime] = useState<number | null>(null);

  // Initialize public key from selected yield provider if available
  useEffect(() => {
    if (selectedYieldProvider?.publicKey && !manualPublicKey) {
      setManualPublicKey(selectedYieldProvider.publicKey);
    }
  }, [selectedYieldProvider, manualPublicKey]);

  const config = chainConfigs[selectedChain];
  const isDeposit = type === "deposit";

  // Check if wallet is connected to wrong network
  const isWalletOnWrongNetwork = () => {
    if (!caipNetwork || !bitcoinAddress) return false;

    // The caipNetwork.id is already the chain ID itself (not in CAIP format)
    const chainId = String(caipNetwork.id || "");

    const isMainnet = chainId === "000000000019d6689c085ae165831e93";
    const isTestnet = chainId === "000000000933ea01ad0ee984209779ba";

    const wrongNetwork =
      (selectedChain === "btc" && !isMainnet) ||
      (selectedChain === "btc_testnet" && !isTestnet);

    return wrongNetwork;
  };

  // Get wallet connection status
  const getWalletConnectionStatus = () => {
    switch (selectedChain) {
      case "btc":
      case "btc_testnet":
        const wrongNetwork = isWalletOnWrongNetwork();
        return {
          isConnected: !!bitcoinWallet && !!bitcoinAddress && !wrongNetwork,
          wallet: bitcoinWallet,
          address: wrongNetwork ? null : bitcoinAddress,
          wrongNetwork,
        };
      case "ada":
        return {
          isConnected: !!cardanoWallet && !!cardanoAddress,
          wallet: cardanoWallet,
          address: cardanoAddress,
          wrongNetwork: false,
        };
      default:
        return {
          isConnected: false,
          wallet: null,
          address: null,
          wrongNetwork: false,
        };
    }
  };

  // Get connected wallet address based on selected chain
  const getConnectedWalletAddress = () => {
    const walletStatus = getWalletConnectionStatus();
    return walletStatus.address;
  };

  // Check for connected wallet and auto-fill address and public key
  useEffect(() => {
    const connectedAddress = getConnectedWalletAddress();

    if (connectedAddress && !userAddress) {
      setUserAddress(connectedAddress);
      setIsUsingConnectedWallet(true);
    } else if (!connectedAddress && isUsingConnectedWallet) {
      setUserAddress("");
      setIsUsingConnectedWallet(false);
    }

    // Auto-fill public key for Bitcoin chains when wallet is connected
    if (
      (selectedChain === "btc" || selectedChain === "btc_testnet") &&
      bitcoinAccounts
    ) {
      const getBTCPubKey = (address: string, accounts: AccountType[]) => {
        for (const account of accounts) {
          if (account.address === address && account.publicKey) {
            return account.publicKey;
          }
        }
        return null;
      };

      // Only auto-fill if the current userAddress matches a wallet address with a public key
      if (userAddress && isUsingConnectedWallet) {
        const walletPubKey = getBTCPubKey(userAddress, bitcoinAccounts);
        if (
          walletPubKey &&
          (!manualPublicKey || manualPublicKey !== walletPubKey)
        ) {
          setManualPublicKey(walletPubKey);
        }
      } else if (!isUsingConnectedWallet && manualPublicKey) {
        // Clear the auto-filled public key if user switches to manual address
        const isWalletPubKey = bitcoinAccounts.some(
          (account) => account.publicKey === manualPublicKey,
        );
        if (isWalletPubKey) {
          setManualPublicKey("");
        }
      }
    }
  }, [
    selectedChain,
    bitcoinAddress,
    cardanoAddress,
    userAddress,
    bitcoinAccounts,
    isUsingConnectedWallet,
    manualPublicKey,
  ]);

  // Auto-populate locktime from transaction history for withdrawals
  useEffect(() => {
    if (!isDeposit && !savedLocktime && transactions.length > 0) {
      const depositTransactions = transactions.filter(
        (tx) =>
          tx.status === "completed" &&
          tx.type === "deposit" &&
          tx.asset.toLowerCase() === selectedChain.toLowerCase(),
      );

      const lastDeposit = depositTransactions.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )[0];

      console.log("Most recent deposit:", lastDeposit);

      if (lastDeposit && (lastDeposit as any).locktime) {
        const locktime = (lastDeposit as any).locktime;
        setSavedLocktime(locktime);
      } else {
        console.log("No deposit transaction with locktime found in history");
        if (lastDeposit) {
          console.log("Last deposit found but no locktime:", lastDeposit);
        }
      }
    }
  }, [isDeposit, savedLocktime, transactions, selectedChain]);

  // Auto-calculate PSBT when all fields are filled (Bitcoin only)
  useEffect(() => {
    const shouldCalculatePsbt = () => {
      if (selectedChain !== "btc" && selectedChain !== "btc_testnet")
        return false;
      if (step !== "form") return false;
      if (isCalculatingPsbt || unsignedTransactionData) return false;
      if (!userAddress || !amount) return false;
      if (!isDeposit && !withdrawAddress) return false;
      if (Number(amount) < config.minDeposit) return false;
      if (!userAddress.startsWith(config.addressPrefix)) return false;
      if (!isDeposit && !withdrawAddress.startsWith(config.addressPrefix))
        return false;

      // For withdrawals, we need a saved locktime
      if (!isDeposit && !savedLocktime) {
        console.log(
          "Cannot calculate withdrawal PSBT: No saved locktime available",
        );
        return false;
      }

      // For Bitcoin, we need either a connected wallet with public key or manual public key
      const getBTCPubKey = (address: string, accounts: AccountType[]) => {
        for (const account of accounts) {
          if (account.address === address && account.publicKey) {
            return account.publicKey;
          }
        }
        return null;
      };

      const sourceAddress = userAddress; // Always use userAddress for source
      // Only use wallet public key if it matches the current address
      const userPubKey = isUsingConnectedWallet
        ? getBTCPubKey(sourceAddress, bitcoinAccounts || [])
        : null;

      // Must have either a wallet public key OR a valid manual public key
      const trimmedManualPubKey = manualPublicKey?.trim() || "";
      const hasValidManualPubKey =
        trimmedManualPubKey.length === 66 &&
        /^[0-9a-fA-F]{66}$/.test(trimmedManualPubKey);
      const hasWalletPubKey = !!userPubKey;

      if (!hasWalletPubKey && !hasValidManualPubKey) return false;

      return true;
    };

    if (shouldCalculatePsbt()) {
      calculateUnsignedPsbt();
    }
  }, [
    selectedChain,
    userAddress,
    withdrawAddress,
    amount,
    manualPublicKey,
    bitcoinAccounts,
    isDeposit,
    config,
    step,
    isCalculatingPsbt,
    unsignedTransactionData,
    savedLocktime,
  ]);

  // Initialize mempool.js client based on selected chain
  const getMempoolClient = () => {
    const isTestnet = selectedChain === "btc_testnet";
    return mempoolJS({
      hostname: isTestnet ? "mempool.space" : "mempool.space",
      network: isTestnet ? "testnet" : "main",
    });
  };

  const copyToClipboard = async (
    text: string,
    type: "address" | "psbt" = "address",
  ) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    addToast({
      type: "success",
      title: "Copied to Clipboard",
      message:
        type === "psbt"
          ? "PSBT has been copied to your clipboard"
          : "Address has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignInBrowser = async () => {
    if (!unsignedTransactionData) return;

    setLoading(true);
    setError(null);

    try {
      const signedPsbt = await bitcoinConnector?.signPSBT(
        unsignedTransactionData,
      );
      console.log("PSBT signed successfully:", signedPsbt);

      // Process the signed PSBT or broadcast it
      // For now, we'll set it to the PSBT step for manual broadcast
      setPsbtBase64(signedPsbt?.psbt || "");
      setStep("psbt");
    } catch (err: any) {
      const errorMessage =
        err.message || "Error signing transaction in browser";
      setError(errorMessage);

      // Update transaction as failed
      if (pendingTransactionId) {
        updateTransactionStatus(pendingTransactionId, "failed");
      }
    }
    setLoading(false);
  };

  const handleCopyUnsignedPSBT = () => {
    if (unsignedTransactionData?.psbt) {
      copyToClipboard(unsignedTransactionData.psbt, "psbt");

      // Add pending transaction to dashboard
      const transactionId = addPendingTransaction(
        selectedChain as SupportedChain,
        Number(amount),
        type,
      );
      setPendingTransactionId(transactionId);

      // Set the unsigned PSBT and go to psbt step for manual signing
      setPsbtBase64(unsignedTransactionData.psbt);
      setStep("psbt");
    }
  };

  const calculateUnsignedPsbt = async () => {
    if (isCalculatingPsbt) return;

    setIsCalculatingPsbt(true);
    setError(null);

    try {
      const sourceAddress = userAddress; // Always use userAddress for source

      const getBTCPubKey = (address: string, accounts: AccountType[]) => {
        for (const account of accounts) {
          if (account.address === address && account.publicKey) {
            return account.publicKey;
          }
        }
        return null;
      };

      // Only use wallet public key if using connected wallet and it matches the address
      let userPubKey = isUsingConnectedWallet
        ? getBTCPubKey(sourceAddress, bitcoinAccounts || [])
        : null;

      // If no wallet public key, use manual public key (must be validated)
      if (!userPubKey) {
        const trimmedManualPubKey = manualPublicKey?.trim() || "";
        if (
          trimmedManualPubKey.length !== 66 ||
          !/^[0-9a-fA-F]{66}$/.test(trimmedManualPubKey)
        ) {
          console.log(trimmedManualPubKey);
          setIsCalculatingPsbt(false);
          return;
        }
        userPubKey = trimmedManualPubKey;
      }

      const apiEndpoint = isDeposit
        ? "/api/btc-staking"
        : "/api/btc-withdrawal";
      const requestBody = isDeposit
        ? {
            sourceAddress: sourceAddress,
            amount: amount,
            userPublicKey: userPubKey,
            network: selectedChain === "btc_testnet" ? "testnet" : "bitcoin",
            locktime: selectedYieldProvider?.locktime || 1000 * 60 * 5,
          }
        : {
            withdrawAddress: withdrawAddress,
            amount: amount,
            userPublicKey: userPubKey,
            network: selectedChain === "btc_testnet" ? "testnet" : "bitcoin",
            locktime: savedLocktime,
          };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to create transaction",
        );
      }

      const unsignedTransactionData = await response.json();
      console.log("Unsigned transaction calculated:", unsignedTransactionData);
      setUnsignedTransactionData(unsignedTransactionData);
    } catch (err: any) {
      console.error("Error calculating PSBT:", err);
      // Don't show error for auto-calculation, just reset
      setUnsignedTransactionData(null);
    }

    setIsCalculatingPsbt(false);
  };

  const resetForm = () => {
    // Don't reset userAddress if using connected wallet
    if (!isUsingConnectedWallet) {
      setUserAddress("");
    }
    setWithdrawAddress("");
    setAmount("");
    setError(null);
    setPsbtBase64("");
    setBroadcastResult("");
    setTxHash("");
    setUnsignedTransactionData(null);
    setStep("form");
    setManualPublicKey("");
  };

  const handleChainChange = (chain: SupportedChain) => {
    setSelectedChain(chain);
    setUserAddress(""); // Reset address when changing chains
    setIsUsingConnectedWallet(false);
    setWithdrawAddress("");
    setAmount("");
    setError(null);
    setPsbtBase64("");
    setBroadcastResult("");
    setTxHash("");
    setUnsignedTransactionData(null);
    setIsCalculatingPsbt(false);
    setStep("form");
    setManualPublicKey("");

    // Check for connected wallet on new chain after a brief delay
    setTimeout(() => {
      const connectedAddress = getConnectedWalletAddress();
      if (connectedAddress) {
        setUserAddress(connectedAddress);
        setIsUsingConnectedWallet(true);
      }
    }, 100);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setUnsignedTransactionData(null); // Reset PSBT when amount changes
    onAmountChange?.(value, selectedChain);
  };

  const handleAddressChange = (value: string) => {
    setUserAddress(value);
    setUnsignedTransactionData(null); // Reset PSBT when address changes
    // If user manually changes address, mark as not using connected wallet
    if (isUsingConnectedWallet && value !== getConnectedWalletAddress()) {
      setIsUsingConnectedWallet(false);
      addToast({
        type: "info",
        title: "Using Manual Address",
        message:
          "You're now using a manually entered address instead of your connected wallet",
      });
    }
  };

  const handleWithdrawAddressChange = (value: string) => {
    setWithdrawAddress(value);
    setUnsignedTransactionData(null); // Reset PSBT when withdraw address changes
  };

  const handleManualPublicKeyChange = (value: string) => {
    setManualPublicKey(value);
    setUnsignedTransactionData(null); // Reset PSBT when public key changes
  };

  const handleUseConnectedWallet = () => {
    const connectedAddress = getConnectedWalletAddress();
    if (connectedAddress) {
      setUserAddress(connectedAddress);
      setIsUsingConnectedWallet(true);
      addToast({
        type: "success",
        title: "Connected Wallet Selected",
        message: "Now using your connected wallet address",
      });
    }
  };

  // Track pending transaction
  const [pendingTransactionId, setPendingTransactionId] = useState<
    string | null
  >(null);

  // Bitcoin transaction logic - now just handles the signing choice
  const handleBtcTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unsignedTransactionData) {
      setError(
        "Transaction not ready. Please ensure all fields are filled correctly.",
      );
      return;
    }

    // Add pending transaction to dashboard
    const transactionId = addPendingTransaction(
      selectedChain as SupportedChain,
      Number(amount),
      type,
    );
    setPendingTransactionId(transactionId);
  };

  // ADA transaction logic
  const handleAdaTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Add pending transaction to dashboard
    const transactionId = addPendingTransaction(
      selectedChain as SupportedChain,
      Number(amount),
      type,
    );
    setPendingTransactionId(transactionId);

    try {
      // Placeholder for Cardano transaction logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const hash = `cardano_${type}_${Date.now()}`;
      setTxHash(hash);

      // Update dashboard with successful transaction
      updateStakedAmount(selectedChain as SupportedChain, Number(amount), type);

      // Update transaction status
      updateTransactionStatus(transactionId, "completed", hash);

      setStep("done");
      onSuccess?.(hash, selectedChain, amount);

      addToast({
        type: "success",
        title: "Transaction Successful",
        message: `${amount} ADA ${type} completed successfully`,
      });
    } catch (err: any) {
      const errorMessage = err.message || `Error processing ADA ${type}`;
      setError(errorMessage);

      // Update transaction as failed
      updateTransactionStatus(transactionId, "failed");
    }
    setLoading(false);
  };

  // Broadcast Bitcoin transaction using mempool.js
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const signedHex = (form.signedHex as HTMLInputElement).value.trim();

      // Initialize mempool.js client for broadcasting
      const mempool = getMempoolClient();

      console.log("Broadcasting transaction");

      // Broadcast transaction using mempool.js
      const txid = await mempool.bitcoin.transactions.postTx({
        txhex: signedHex,
      });

      // Ensure txid is a string
      const txidStr = typeof txid === "string" ? txid : String(txid);

      console.log("Transaction broadcast successfully:", txidStr);

      setBroadcastResult(txidStr);

      // Update dashboard with successful transaction
      updateStakedAmount(selectedChain as SupportedChain, Number(amount), type);

      // Update transaction status
      if (pendingTransactionId) {
        updateTransactionStatus(pendingTransactionId, "completed", txidStr);
      }

      setStep("done");
      onSuccess?.(txidStr, selectedChain, amount);
    } catch (err: any) {
      console.error("Broadcast error:", err);
      const errorMessage = err.message || "Broadcast error";
      setError(errorMessage);

      // Update transaction as failed
      if (pendingTransactionId) {
        updateTransactionStatus(pendingTransactionId, "failed");
      }
    }
    setLoading(false);
  };

  const isFormValid = () => {
    const baseValid =
      userAddress &&
      Number(amount) >= config.minDeposit &&
      userAddress.startsWith(config.addressPrefix);

    if (isDeposit) {
      return baseValid;
    } else {
      return (
        baseValid &&
        withdrawAddress &&
        withdrawAddress.startsWith(config.addressPrefix)
      );
    }
  };

  const getCurrentTxHash = () => {
    return selectedChain === "btc" ? broadcastResult : txHash;
  };

  const getFormTitle = () => {
    return isDeposit ? "Deposit to Portfolio" : "Withdraw from Portfolio";
  };

  const getFormDescription = () => {
    return isDeposit
      ? "Select your preferred blockchain and deposit assets"
      : "Select your preferred blockchain and withdraw assets";
  };

  const getButtonText = () => {
    if (loading) return "Processing";
    return `${isDeposit ? "Deposit" : "Withdraw"} ${config.symbol}`;
  };

  const getSuccessMessage = () => {
    return `${config.name} ${
      isDeposit ? "Deposit" : "Withdrawal"
    } Processed Successfully!`;
  };

  const walletStatus = getWalletConnectionStatus();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDeposit ? (
            <ArrowDownLeft className="w-5 h-5" />
          ) : (
            <ArrowUpRight className="w-5 h-5" />
          )}
          {getFormTitle()}
        </CardTitle>
        <CardDescription>{getFormDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === "form" && (
          <form
            onSubmit={
              selectedChain === "btc" || selectedChain === "btc_testnet"
                ? handleBtcTransaction
                : handleAdaTransaction
            }
            className="space-y-6"
          >
            {/* Chain Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Blockchain</label>
              <Select value={selectedChain} onValueChange={handleChainChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(chainConfigs)
                    .filter((chain) => chain.enabled)
                    .map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center gap-2">
                          {chain.icon}
                          <span>
                            {chain.name} ({chain.symbol})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Wallet Connection Status */}
            {walletStatus.isConnected ? (
              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-green-700 font-medium">
                        Wallet Connected
                      </span>
                      <div className="text-sm text-muted-foreground mt-1">
                        {walletStatus.address?.slice(0, 20)}...
                        {walletStatus.address?.slice(-6)}
                      </div>
                    </div>
                    {!isUsingConnectedWallet && walletStatus.address && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseConnectedWallet}
                      >
                        Use Connected Wallet
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ) : walletStatus.wrongNetwork ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-orange-700 font-medium">
                        Wrong Network Connected
                      </span>
                      <div className="text-sm text-muted-foreground mt-1">
                        Your wallet is connected to{" "}
                        {selectedChain === "btc"
                          ? "Bitcoin Testnet"
                          : "Bitcoin Mainnet"}
                        , but you've selected {config.name}. Please switch
                        networks in your wallet.
                      </div>
                    </div>
                    <div>
                      <ConnectButton />
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      Connect your {config.name} wallet for easier transactions
                    </span>
                    <div>
                      {selectedChain === "btc" ||
                      selectedChain === "btc_testnet" ? (
                        <ConnectButton />
                      ) : selectedChain === "ada" ? (
                        <WalletButton />
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Wallet not available
                        </Button>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Chain Information */}
            <div className="p-4 bg-blue-500/20 border border-blue-800/30 rounded-md">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                {config.icon}
                {config.name} {isDeposit ? "Staking" : "Withdrawal"} Information
              </div>
              <ul className="text-sm text-blue-600 space-y-1">
                {config.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>

            {/* User Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Your {config.name} Address
                {isUsingConnectedWallet && (
                  <span className="text-green-600 text-xs ml-2">
                    (Using Connected Wallet)
                  </span>
                )}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={userAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder={`${config.addressPrefix}...`}
                  required
                  className={
                    isUsingConnectedWallet ? "bg-green-50 border-green-200" : ""
                  }
                />
                {isUsingConnectedWallet && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isDeposit
                  ? `Your ${config.name} wallet address for receiving change or rewards`
                  : `Your ${config.name} wallet address (source of funds)`}
              </p>
            </div>

            {/* Public Key Input (Bitcoin only, shown when needed) */}
            {(selectedChain === "btc" || selectedChain === "btc_testnet") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Public Key
                  <span className="text-red-500 ml-1">*</span>
                  {selectedYieldProvider?.publicKey &&
                    manualPublicKey === selectedYieldProvider.publicKey && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (From {selectedYieldProvider.provider})
                      </span>
                    )}
                </label>
                <Input
                  type="text"
                  value={manualPublicKey}
                  onChange={(e) => handleManualPublicKeyChange(e.target.value)}
                  placeholder="Enter your 33-byte public key in hexadecimal format (66 characters)"
                  className="font-mono text-xs"
                  maxLength={66}
                />
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-xs">
                    <strong>Note:</strong> Your wallet couldn't provide the
                    public key automatically. Please enter the public key
                    corresponding to your Bitcoin address. You can usually find
                    this in your wallet's advanced settings or transaction
                    history.
                  </p>
                </div>
                {manualPublicKey &&
                  !/^[0-9a-fA-F]{66}$/.test(manualPublicKey) && (
                    <p className="text-red-600 text-xs">
                      Invalid format. Public key must be exactly 66 hexadecimal
                      characters.
                    </p>
                  )}
              </div>
            )}

            {/* Withdraw Address (only for withdrawals) */}
            {!isDeposit && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Withdrawal Address
                </label>
                <Input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => handleWithdrawAddressChange(e.target.value)}
                  placeholder={`${config.addressPrefix}...`}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The address where you want to receive the withdrawn funds
                </p>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Amount to {isDeposit ? "Deposit" : "Withdraw"} ({config.symbol})
              </label>
              <Input
                type="number"
                step={1 / Math.pow(10, config.decimals)}
                min={config.minDeposit}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={config.minDeposit.toString()}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum amount: {config.minDeposit} {config.symbol}
              </p>
            </div>

            {/* PSBT Calculation Status (Bitcoin only) */}
            {(selectedChain === "btc" || selectedChain === "btc_testnet") &&
              isCalculatingPsbt && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span className="text-sm font-medium">
                      Preparing transaction...
                    </span>
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedChain === "btc" || selectedChain === "btc_testnet" ? (
                <>
                  <Button
                    type="button"
                    onClick={handleSignInBrowser}
                    disabled={loading || !unsignedTransactionData}
                    className="flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    {loading
                      ? "Signing..."
                      : `Sign & ${isDeposit ? "Deposit" : "Withdraw"}`}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyUnsignedPSBT}
                    disabled={!unsignedTransactionData}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy Unsigned PSBT"}
                  </Button>
                </>
              ) : (
                <>
                  <Button type="submit" disabled={loading || !isFormValid()}>
                    {getButtonText()}
                  </Button>
                  {selectedChain === "ada" && isDeposit && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        window.open("https://yoroi-wallet.com", "_blank")
                      }
                    >
                      Get Yoroi Wallet
                    </Button>
                  )}
                </>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </form>
        )}

        {step === "psbt" &&
          (selectedChain === "btc" || selectedChain === "btc_testnet") && (
            <PsbtSigning
              psbtBase64={psbtBase64}
              targetAddress={isDeposit ? depositAddress : withdrawAddress}
              expectedAmount={Math.floor(Number(amount) * 1e8)}
              chain={selectedChain}
              onTransactionFound={(txid) => {
                console.log("Transaction found:", txid);
                setBroadcastResult(txid);

                // Save locktime for future withdrawal transactions (only for deposits)
                if (isDeposit && unsignedTransactionData?.locktime) {
                  setSavedLocktime(unsignedTransactionData.locktime);
                  console.log(
                    "Saved locktime for withdrawal:",
                    unsignedTransactionData.locktime,
                  );
                }

                // Update dashboard with successful transaction
                try {
                  updateStakedAmount(
                    selectedChain as SupportedChain,
                    Number(amount),
                    type,
                  );
                } catch (error) {
                  console.error("Error updating staked amount:", error);
                }

                // Update transaction status
                if (pendingTransactionId) {
                  updateTransactionStatus(
                    pendingTransactionId,
                    "completed",
                    txid,
                    isDeposit && unsignedTransactionData?.locktime
                      ? { locktime: unsignedTransactionData.locktime }
                      : undefined,
                  );
                }

                setStep("done");
                onSuccess?.(txid, selectedChain, amount);
              }}
              onError={(error) => {
                console.error("Transaction watching error:", error);
                setError(error);

                // Update transaction as failed
                if (pendingTransactionId) {
                  updateTransactionStatus(pendingTransactionId, "failed");
                }
              }}
              title={`Sign ${isDeposit ? "Deposit" : "Withdrawal"} Transaction`}
              description={`Complete your ${amount} ${config.symbol} ${type} by signing the transaction below`}
            />
          )}

        {step === "done" && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <CheckCircle className="w-5 h-5" />
                {getSuccessMessage()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Transaction Hash:</span>
                <a
                  href={`${config.explorerBaseUrl}${
                    config.explorerTxSlug
                  }${getCurrentTxHash()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm font-mono flex items-center gap-1"
                >
                  {getCurrentTxHash().slice(0, 20)}...
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={resetForm} variant="outline">
                Make Another {isDeposit ? "Deposit" : "Withdrawal"}
              </Button>
              <Button asChild>
                <Link href="/dashboard?tab=portfolio">View Portfolio</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
