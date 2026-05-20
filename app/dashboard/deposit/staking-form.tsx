"use client";

import { useState, useEffect } from "react";
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
  Hash,
  Clock,
  TrendingUp,
  Shield,
} from "lucide-react";
import {
  BTC_CHAIN_ID_MAINNET,
  BTC_CHAIN_ID_TESTNET,
  chainConfigs,
  SupportedChain,
} from "../../../lib/multichain";
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
import { useWalletBalance } from "@/hooks/dashboard/wallet-balance";
import { useDepositFlow } from "@/hooks/dashboard/use-deposit-flow";

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
  defaultChain = "btc_testnet",
}: StakingFormProps) {
  const {
    updateStakedAmount,
    addPendingTransaction,
    updateTransactionStatus,
    transactions,
    activeLocktime,
    selectedYieldProvider,
    setActiveProgram,
    clearActiveProgram,
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

  const {
    selectedWallet: cardanoWallet,
    defaultAddress: cardanoAddress,
    accountBalance: cardanoBalance,
  } = useCardanoWallet();

  const [selectedChain, setSelectedChain] =
    useState<SupportedChain>(defaultChain);
  const [userAddress, setUserAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [isUsingConnectedWallet, setIsUsingConnectedWallet] = useState(false);
  const [manualPublicKey, setManualPublicKey] = useState("");
  const [savedLocktime, setSavedLocktime] = useState<number | null>(null);
  const [cachedUserPublicKey, setCachedUserPublicKey] = useState("");

  // Ensure selectedChain is always valid - recover if somehow set to invalid value
  const validChain = chainConfigs[selectedChain] ? selectedChain : defaultChain;
  if (validChain !== selectedChain) {
    console.warn(
      `Invalid selectedChain "${selectedChain}", recovering to "${validChain}"`,
    );
  }
  const config = chainConfigs[validChain];
  const isDeposit = type === "deposit";

  // Recovery: if selectedChain is somehow invalid, reset to defaultChain
  useEffect(() => {
    if (!chainConfigs[selectedChain]) {
      console.warn(
        `Recovering invalid selectedChain: "${selectedChain}" -> "${defaultChain}"`,
      );
      setSelectedChain(defaultChain);
    }
  }, [selectedChain, defaultChain]);

  // Check if wallet is connected to wrong network
  const isWalletOnWrongNetwork = () => {
    if (!caipNetwork || !bitcoinAddress) return false;

    // The caipNetwork.id is already the chain ID itself (not in CAIP format)
    const chainId = String(caipNetwork.id || "");

    const isMainnet = chainId === BTC_CHAIN_ID_MAINNET;
    const isTestnet = chainId === BTC_CHAIN_ID_TESTNET;

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

  // Auto-switch to correct network if wallet is on wrong network
  useEffect(() => {
    if (bitcoinAddress && caipNetwork && selectedChain) {
      const chainId = String(caipNetwork.id || "");
      const isMainnet = chainId === BTC_CHAIN_ID_MAINNET;
      const isTestnet = chainId === BTC_CHAIN_ID_TESTNET;

      // If wallet is on mainnet but form is set to testnet, switch to mainnet
      if (isMainnet && selectedChain === "btc_testnet") {
        setSelectedChain("btc");
      }
      // If wallet is on testnet but form is set to mainnet, switch to testnet
      else if (isTestnet && selectedChain === "btc") {
        setSelectedChain("btc_testnet");
      }
    }
  }, [bitcoinAddress, caipNetwork]); // Removed selectedChain to prevent state initialization issues

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
  }, [selectedChain, bitcoinAddress, cardanoAddress]);

  // Separate useEffect for Bitcoin public key management to prevent infinite loops
  useEffect(() => {
    // Auto-fill public key for Bitcoin chains when wallet is connected
    if (
      (selectedChain === "btc" || selectedChain === "btc_testnet") &&
      bitcoinAccounts &&
      userAddress &&
      isUsingConnectedWallet
    ) {
      const getBTCPubKey = (address: string, accounts: AccountType[]) => {
        for (const account of accounts) {
          if (account.address === address && account.publicKey) {
            return account.publicKey;
          }
        }
        return null;
      };

      const walletPubKey = getBTCPubKey(userAddress, bitcoinAccounts);
      if (walletPubKey && manualPublicKey !== walletPubKey) {
        setManualPublicKey(walletPubKey);
        setCachedUserPublicKey(walletPubKey);
      }
    }
  }, [userAddress, isUsingConnectedWallet, bitcoinAccounts, selectedChain]);

  // Restore cached public key when switching to manual mode
  useEffect(() => {
    if (
      (selectedChain === "btc" || selectedChain === "btc_testnet") &&
      !isUsingConnectedWallet &&
      cachedUserPublicKey &&
      !manualPublicKey.trim()
    ) {
      setManualPublicKey(cachedUserPublicKey);
    }
  }, [isUsingConnectedWallet, selectedChain, cachedUserPublicKey]);

  // Wallet balance (fetched via dedicated hook, stored in dashboard context)
  const { availableBalance, isFetchingBalance } = useWalletBalance({
    selectedChain,
    btcAddress: userAddress,
    cardanoBalance,
  });

  const depositFlow = useDepositFlow({
    selectedChain,
    userAddress,
    withdrawAddress,
    amount,
    manualPublicKey,
    isUsingConnectedWallet,
    bitcoinAccounts,
    bitcoinConnector,
    isDeposit,
    savedLocktime,
    selectedYieldProvider,
    setDepositAddress,
    setSavedLocktime,
    setActiveProgram,
    clearActiveProgram,
    addPendingTransaction,
    updateTransactionStatus,
    updateStakedAmount,
    onSuccess,
  });

  const {
    step,
    setStep,
    unsignedTransactionData,
    psbtBase64,
    broadcastResult,
    txHash,
    escrowAddress,
    isCalculatingPsbt,
    psbtCalcFailed,
    loading,
    error,
    setError,
    schedulePsbtCalc,
    cancelPsbtCalc,
    handleSignInBrowser,
    handleCopyUnsignedPSBT,
    handleTransactionFound,
    resetFlow,
    resetPsbtCalc,
  } = depositFlow;

  const isAmountExceedsBalance =
    availableBalance !== null &&
    Number(amount) > 0 &&
    Number(amount) > availableBalance;

  // Auto-populate locktime for withdrawals from the server's active deposit data.
  // activeLocktime is derived from the most recent active deposit's lock_ms field.
  useEffect(() => {
    if (!isDeposit && !savedLocktime && activeLocktime) {
      setSavedLocktime(activeLocktime);
    }
  }, [isDeposit, savedLocktime, activeLocktime]);

  // Auto-calculate PSBT when all fields are filled (Bitcoin only).
  // Delegates debouncing and the actual fetch to useDepositFlow.
  useEffect(() => {
    const shouldCalculate = () => {
      // Deposits are prepared on demand when user clicks sign/copy
      if (isDeposit) return false;
      if (selectedChain !== "btc" && selectedChain !== "btc_testnet")
        return false;
      if (step !== "form") return false;
      if (isCalculatingPsbt || unsignedTransactionData) return false;
      if (psbtCalcFailed) return false;
      if (!userAddress || !amount) return false;
      if (!withdrawAddress) return false;
      if (Number(amount) < config.minDeposit) return false;
      if (isAmountExceedsBalance) return false;
      if (!userAddress.startsWith(config.addressPrefix)) return false;
      if (!withdrawAddress.startsWith(config.addressPrefix)) return false;
      // Note: locktime is resolved from the server deposit if savedLocktime is not yet available

      const trimmed = manualPublicKey?.trim() || "";
      const hasManualKey =
        trimmed.length === 66 && /^[0-9a-fA-F]{66}$/.test(trimmed);
      const hasWalletKey =
        isUsingConnectedWallet &&
        (bitcoinAccounts || []).some(
          (a) => a.address === userAddress && a.publicKey,
        );
      if (!hasManualKey && !hasWalletKey) return false;

      return true;
    };

    if (shouldCalculate()) {
      schedulePsbtCalc();
    }

    return cancelPsbtCalc;
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
    psbtCalcFailed,
    selectedYieldProvider,
    isUsingConnectedWallet,
    schedulePsbtCalc,
    cancelPsbtCalc,
  ]);

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

  const wrappedHandleCopyUnsignedPSBT = async () => {
    const psbt = await handleCopyUnsignedPSBT();
    if (psbt) copyToClipboard(psbt, "psbt");
  };

  const resetForm = () => {
    if (!isUsingConnectedWallet) setUserAddress("");
    setWithdrawAddress("");
    setAmount("");
    setManualPublicKey("");
    resetFlow();
  };

  const handleChainChange = (chain: SupportedChain) => {
    // Validate the chain is actually a valid config key before setting
    if (!chainConfigs[chain]) {
      console.warn(`handleChainChange called with invalid chain: "${chain}"`);
      return;
    }
    setSelectedChain(chain);
    setUserAddress("");
    setIsUsingConnectedWallet(false);
    setWithdrawAddress("");
    setAmount("");
    setDepositAddress("");
    setManualPublicKey("");
    resetFlow();

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
    resetPsbtCalc();
    onAmountChange?.(value, selectedChain);
  };

  const handleAddressChange = (value: string) => {
    setUserAddress(value);
    resetPsbtCalc();
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
    resetPsbtCalc();
  };

  const handleManualPublicKeyChange = (value: string) => {
    setManualPublicKey(value);
    if (value.trim().length === 66 && /^[0-9a-fA-F]{66}$/.test(value.trim())) {
      setCachedUserPublicKey(value.trim());
    }
    setDepositAddress("");
    resetPsbtCalc();
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

  // Bitcoin form submission — actual signing is handled by the buttons below
  const handleBtcTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsignedTransactionData) {
      setError(
        "Transaction not ready. Please ensure all fields are filled correctly.",
      );
    }
  };

  // ADA transaction logic
  const handleAdaTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Add pending transaction to dashboard
    const transactionId = addPendingTransaction(
      selectedChain as SupportedChain,
      Number(amount),
      type,
    );

    try {
      // Placeholder for Cardano transaction logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const hash = `cardano_${type}_${Date.now()}`;

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
  };

  const isFormValid = () => {
    const numAmount = Number(amount);
    const baseValid =
      userAddress &&
      numAmount >= (config?.minDeposit || 0) &&
      userAddress.startsWith(config?.addressPrefix || "") &&
      !isAmountExceedsBalance;

    if (isDeposit) {
      return baseValid;
    } else {
      return (
        baseValid &&
        withdrawAddress &&
        withdrawAddress.startsWith(config?.addressPrefix || "")
      );
    }
  };

  const getCurrentTxHash = () => txHash || broadcastResult;

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
    return `${isDeposit ? "Deposit" : "Withdraw"} ${config?.symbol || selectedChain}`;
  };

  const getSuccessMessage = () => {
    return `${config?.name || selectedChain} ${
      isDeposit ? "Deposit" : "Withdrawal"
    } Processed Successfully!`;
  };

  const walletStatus = getWalletConnectionStatus();

  const isBtcChain = selectedChain === "btc" || selectedChain === "btc_testnet";

  const renderWalletStatus = () => {
    if (walletStatus.isConnected) {
      return (
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
      );
    }

    if (walletStatus.wrongNetwork) {
      return (
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
                  , but you've selected {config?.name || selectedChain}. Please
                  switch networks in your wallet.
                </div>
              </div>
              <div>
                <ConnectButton />
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <span>
              Connect your {config?.name || selectedChain} wallet for easier
              transactions
            </span>
            <div>
              {isBtcChain ? (
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
    );
  };

  const renderFormStep = () => (
    <form
      onSubmit={isBtcChain ? handleBtcTransaction : handleAdaTransaction}
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
              .filter((chain) => chain.id === "btc_testnet")
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
      {renderWalletStatus()}

      {/* Chain Information */}
      <div className="p-4 bg-blue-500/20 border border-blue-800/30 rounded-md">
        <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
          {config?.icon}
          {config?.name || selectedChain} {isDeposit ? "Staking" : "Withdrawal"}{" "}
          Information
        </div>
        <ul className="text-sm text-blue-600 space-y-1">
          {(config?.features || []).map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      </div>

      {/* User Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Your {config?.name || selectedChain} Address
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
            placeholder={`${config?.addressPrefix || ""}...`}
            required
            className={
              isUsingConnectedWallet ? "bg-green-500/20 border-green-200" : ""
            }
          />
          {isUsingConnectedWallet && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isDeposit
            ? `Your ${config?.name || selectedChain} wallet address for receiving change or rewards`
            : `Your ${config?.name || selectedChain} wallet address (source of funds)`}
        </p>
      </div>

      {/* Public Key Input (Bitcoin only, shown when needed) */}
      {isBtcChain && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Public Key
            {cachedUserPublicKey && manualPublicKey === cachedUserPublicKey && (
              <span className="ml-2 text-xs text-green-600">(Cached)</span>
            )}
          </label>
          <div className="relative">
            <Input
              type="text"
              value={manualPublicKey}
              onChange={(e) => handleManualPublicKeyChange(e.target.value)}
              placeholder="Enter your 33-byte public key in hexadecimal format (66 characters)"
              className={`font-mono text-xs ${
                cachedUserPublicKey && manualPublicKey === cachedUserPublicKey
                  ? "bg-green-500/20 border-green-200"
                  : ""
              }`}
              maxLength={66}
            />
            {cachedUserPublicKey && manualPublicKey === cachedUserPublicKey && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
            )}
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-xs">
              <strong>Note:</strong> Your wallet couldn't provide the public key
              automatically. Please verify your public key above.
            </p>
          </div>
          {manualPublicKey && !/^[0-9a-fA-F]{66}$/.test(manualPublicKey) && (
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
          <label className="text-sm font-medium">Withdrawal Address</label>
          <Input
            type="text"
            value={withdrawAddress}
            onChange={(e) => handleWithdrawAddressChange(e.target.value)}
            placeholder={`${config?.addressPrefix || ""}...`}
            required
          />
          <p className="text-xs text-muted-foreground">
            The address where you want to receive the withdrawn funds
          </p>
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Amount to {isDeposit ? "Deposit" : "Withdraw"} (
            {config?.symbol || selectedChain})
          </label>
          {availableBalance !== null && (
            <span className="text-xs text-muted-foreground">
              Available:{" "}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                onClick={() => handleAmountChange(String(availableBalance))}
              >
                {availableBalance.toFixed(config?.decimals || 8)}{" "}
                {config?.symbol || selectedChain}
              </button>
            </span>
          )}
          {isFetchingBalance && availableBalance === null && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Fetching balance...
            </span>
          )}
        </div>
        <Input
          type="number"
          step={1 / Math.pow(10, config?.decimals || 8)}
          min={selectedYieldProvider?.minAmount || config?.minDeposit || 0}
          max={availableBalance ?? undefined}
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder={(
            selectedYieldProvider?.minAmount ||
            config?.minDeposit ||
            0
          ).toString()}
          required
          className={isAmountExceedsBalance ? "border-red-400" : ""}
        />
        {isAmountExceedsBalance && (
          <p className="text-red-600 text-xs">
            Amount exceeds your available balance of{" "}
            {availableBalance?.toFixed(config?.decimals || 8)}{" "}
            {config?.symbol || selectedChain}
          </p>
        )}
        {!isAmountExceedsBalance && (
          <p className="text-xs text-muted-foreground">
            Minimum:{" "}
            {selectedYieldProvider?.minAmount || config?.minDeposit || 0}{" "}
            {config?.symbol || selectedChain}
          </p>
        )}
      </div>

      {/* PSBT Calculation Status (Bitcoin withdrawals only) */}
      {isBtcChain && !isDeposit && isCalculatingPsbt && (
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
        {isBtcChain ? (
          <>
            <Button
              type="button"
              onClick={handleSignInBrowser}
              disabled={
                loading ||
                (isDeposit ? !isFormValid() : !unsignedTransactionData) ||
                isAmountExceedsBalance
              }
              className="flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              {loading
                ? isDeposit
                  ? "Preparing..."
                  : "Signing..."
                : `Sign & ${isDeposit ? "Deposit" : "Withdraw"}`}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={wrappedHandleCopyUnsignedPSBT}
              disabled={
                loading ||
                (isDeposit ? !isFormValid() : !unsignedTransactionData) ||
                isAmountExceedsBalance
              }
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy Unsigned PSBT"}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="submit"
              disabled={loading || !isFormValid() || isAmountExceedsBalance}
            >
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
  );

  const renderPsbtStep = () => (
    <PsbtSigning
      psbtBase64={psbtBase64}
      targetAddress={isDeposit ? escrowAddress : withdrawAddress}
      expectedAmount={Math.floor(Number(amount) * 1e8)}
      chain={selectedChain as "btc" | "btc_testnet"}
      onTransactionFound={handleTransactionFound}
      onError={(err) => {
        console.error("Transaction watching error:", err);
        setError(err);
      }}
      title={`Sign ${isDeposit ? "Deposit" : "Withdrawal"} Transaction`}
      description={`Complete your ${amount} ${config.symbol} ${type} by signing the transaction below`}
    />
  );

  const renderDoneStep = () => {
    const completedTxHash = getCurrentTxHash();
    const locktimeDays =
      savedLocktime != null ? Math.round(savedLocktime / 86400) : null;
    const completedAt = new Date().toLocaleString();

    return (
      <div className="space-y-4">
        {/* Success Banner */}
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3 text-green-600 font-semibold text-base mb-1">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {getSuccessMessage()}
          </div>
          <p className="text-xs text-muted-foreground ml-8">{completedAt}</p>
        </div>

        {/* Transaction Details */}
        <div className="border rounded-lg divide-y text-sm">
          {/* Transaction ID */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              Transaction ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">
                {completedTxHash.slice(0, 12)}...{completedTxHash.slice(-8)}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(completedTxHash)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy transaction hash"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a
                href={`${config?.explorerBaseUrl || "#"}${
                  config?.explorerTxSlug || ""
                }${completedTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
                title="View on block explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold">
              {Number(amount).toFixed(config?.decimals || 8)}{" "}
              {config?.symbol || selectedChain}
            </span>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">Network</span>
            <span className="flex items-center gap-1.5 font-medium">
              {config?.icon}
              {config?.name || selectedChain}
            </span>
          </div>

          {/* From address */}
          {userAddress && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                From
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {userAddress.slice(0, 14)}...{userAddress.slice(-6)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(userAddress)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Escrow / destination address */}
          {isDeposit && escrowAddress && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Escrow Address
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {escrowAddress.slice(0, 14)}...{escrowAddress.slice(-6)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(escrowAddress)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy escrow address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          {!isDeposit && withdrawAddress && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                To Address
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {withdrawAddress.slice(0, 14)}...{withdrawAddress.slice(-6)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(withdrawAddress)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Yield Provider */}
          {isDeposit && selectedYieldProvider && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Yield Provider
              </span>
              <div className="text-right">
                <div className="font-medium">{selectedYieldProvider.name}</div>
                <div className="text-xs text-green-600 font-semibold">
                  {selectedYieldProvider.apy}% APY
                </div>
              </div>
            </div>
          )}

          {/* Lock Duration */}
          {isDeposit && locktimeDays !== null && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Lock Duration
              </span>
              <span className="font-medium">{locktimeDays} days</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={resetForm} variant="outline">
            Make Another {isDeposit ? "Deposit" : "Withdrawal"}
          </Button>
          <Button asChild>
            <Link href="/dashboard?tab=portfolio">View Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case "form":
        return renderFormStep();
      case "psbt":
        if (isBtcChain) return renderPsbtStep();
        return null;
      case "done":
        return renderDoneStep();
      default:
        return null;
    }
  };

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
      <CardContent>{renderStepContent()}</CardContent>
    </Card>
  );
}
