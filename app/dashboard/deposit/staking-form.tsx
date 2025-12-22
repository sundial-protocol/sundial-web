"use client";

import { useState, useEffect } from "react";
import * as bitcoin from "bitcoinjs-lib";
import { BTCLocker, TimeUtils } from "@sundial-protocol/btc-locker";
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
import { depositAddress } from "@/hooks/get-scripts";
import { TransactionWatcher } from "@/components/btc/tx-watcher";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import Link from "next/link";
import { PsbtSigning } from "@/components/btc/psbt-signing";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import { WalletButton } from "@/lib/wallet/cardano/wallet-button";
import { useToast } from "@/components/ui/toast";

// Import the actual wallet contexts
import {
  ConnectedWalletInfo,
  useAppKitAccount,
  useWalletInfo,
} from "@reown/appkit/react";
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
  const { updateStakedAmount, addPendingTransaction, updateTransactionStatus } =
    useDashboardContext();

  const { addToast } = useToast();

  // Wallet contexts - using the actual implementations
  const { walletInfo } = useWalletInfo();
  const bitcoinWallet = walletInfo?.name ?? "Unknown Wallet";

  const { address: bitcoinAddress } = useAppKitAccount();

  const { selectedWallet: cardanoWallet, defaultAddress: cardanoAddress } =
    useCardanoWallet();

  const [selectedChain, setSelectedChain] =
    useState<SupportedChain>(defaultChain);
  const [userAddress, setUserAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isUsingConnectedWallet, setIsUsingConnectedWallet] = useState(false);

  // Bitcoin-specific states
  const [psbtBase64, setPsbtBase64] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  const [step, setStep] = useState<"form" | "psbt" | "broadcast" | "done">(
    "form"
  );

  // ADA-specific states
  const [txHash, setTxHash] = useState("");

  const config = chainConfigs[selectedChain];
  const isDeposit = type === "deposit";

  // Get connected wallet address based on selected chain
  const getConnectedWalletAddress = () => {
    switch (selectedChain) {
      case "btc":
      case "btc_testnet":
        return bitcoinAddress;
      case "ada":
        return cardanoAddress;
      default:
        return null;
    }
  };

  // Get wallet connection status
  const getWalletConnectionStatus = () => {
    switch (selectedChain) {
      case "btc":
      case "btc_testnet":
        return {
          isConnected: !!bitcoinWallet && !!bitcoinAddress,
          wallet: bitcoinWallet,
          address: bitcoinAddress,
        };
      case "ada":
        return {
          isConnected: !!cardanoWallet && !!cardanoAddress,
          wallet: cardanoWallet,
          address: cardanoAddress,
        };
      default:
        return {
          isConnected: false,
          wallet: null,
          address: null,
        };
    }
  };

  // Check for connected wallet and auto-fill address
  useEffect(() => {
    const connectedAddress = getConnectedWalletAddress();
    if (connectedAddress && !userAddress) {
      setUserAddress(connectedAddress);
      setIsUsingConnectedWallet(true);
    } else if (!connectedAddress && isUsingConnectedWallet) {
      setUserAddress("");
      setIsUsingConnectedWallet(false);
    }
  }, [selectedChain, bitcoinAddress, cardanoAddress, userAddress]);

  // Initialize mempool.js client based on selected chain
  const getMempoolClient = () => {
    const isTestnet = selectedChain === "btc_testnet";
    return mempoolJS({
      hostname: isTestnet ? "mempool.space" : "mempool.space",
      network: isTestnet ? "testnet" : "main",
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    addToast({
      type: "success",
      title: "Copied to Clipboard",
      message: "Address has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
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
    setStep("form");
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
    setStep("form");

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
    onAmountChange?.(value, selectedChain);
  };

  const handleAddressChange = (value: string) => {
    setUserAddress(value);
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

  // Bitcoin transaction logic using mempool.js
  const handleBtcTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Add pending transaction to dashboard
    const transactionId = addPendingTransaction(
      selectedChain as SupportedChain,
      Number(amount),
      type
    );
    setPendingTransactionId(transactionId);

    try {
      const sourceAddress = isDeposit
        ? userAddress
        : depositAddress(selectedChain);

      const targetAddress = isDeposit
        ? depositAddress(selectedChain)
        : withdrawAddress;

      const locker = new BTCLocker();

      const userPubKey = walletInfo?.publicKeyHex as string;

      if (isDeposit) {
        const locktime: number = TimeUtils.dateToTimestamp(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ); // 30 days from now

        locker.createTimelockScript(locktime, userPubKey);
      }

      const psbtBase64 =
        "cHNidP8BAHECAAAAAUhv4PrFeYKGlpmhSjVYr/VCIYciTqq9ECWPLLWRuThpAQAAAAD/////AoCWmAAAAAAAFgAUMRVkNIiQ4AWICpvINKqliE8bWTL7XPQAAAAAABYAFBg/3erkUALzSpszKwN4fSgTtJv/AAAAAAABAR9j94wBAAAAABYAFBg/3erkUALzSpszKwN4fSgTtJv/AAAA";

      setPsbtBase64(psbtBase64);
      setStep("psbt");
    } catch (err: any) {
      const errorMessage =
        err.message || `Error creating Bitcoin ${type} transaction`;
      setError(errorMessage);

      // Update transaction as failed
      if (transactionId) {
        updateTransactionStatus(transactionId, "failed");
      }
    }
    setLoading(false);
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
      type
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
    <Card>
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

            {/* Withdraw Address (only for withdrawals) */}
            {!isDeposit && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Withdrawal Address
                </label>
                <Input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
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

            {/* Deposit Address Display (only for deposits) */}
            {isDeposit && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Deposit Address</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={depositAddress(selectedChain)}
                    readOnly
                    className="bg-muted font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(depositAddress(selectedChain))
                    }
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              targetAddress={
                isDeposit ? depositAddress(selectedChain) : withdrawAddress
              }
              expectedAmount={Math.floor(Number(amount) * 1e8)}
              chain={selectedChain}
              onTransactionFound={(txid) => {
                console.log("Transaction found:", txid);
                setBroadcastResult(txid);

                // Update dashboard with successful transaction
                updateStakedAmount(
                  selectedChain as SupportedChain,
                  Number(amount),
                  type
                );

                // Update transaction status
                if (pendingTransactionId) {
                  updateTransactionStatus(
                    pendingTransactionId,
                    "completed",
                    txid
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
