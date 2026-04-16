"use client";

import { useState, useEffect, useRef } from "react";
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
import { Psbt } from "bitcoinjs-lib";
import {
  BtcStakingResponse,
  BtcStakingSuccessResponse,
} from "@/app/api/btc-staking/types";
import { finalizePsbtSafe } from "@/lib/psbt-finalize";
import {
  BtcWithdrawalResponse,
  BtcWithdrawalSuccessResponse,
} from "@/app/api/btc-withdrawal/types";
import { useWalletBalance } from "@/hooks/dashboard/wallet-balance";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isUsingConnectedWallet, setIsUsingConnectedWallet] = useState(false);
  const [manualPublicKey, setManualPublicKey] = useState("");
  const [psbtBase64, setPsbtBase64] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  const [unsignedTransactionData, setUnsignedTransactionData] = useState<
    BtcStakingSuccessResponse | BtcWithdrawalSuccessResponse | null
  >(null);
  const [isCalculatingPsbt, setIsCalculatingPsbt] = useState(false);
  const [step, setStep] = useState<"form" | "psbt" | "broadcast" | "done">(
    "form",
  );
  const [txHash, setTxHash] = useState("");
  const [savedLocktime, setSavedLocktime] = useState<number | null>(null);
  const [cachedUserPublicKey, setCachedUserPublicKey] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState<
    string | null
  >(null);
  const [psbtCalcFailed, setPsbtCalcFailed] = useState(false);
  const psbtDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const isAmountExceedsBalance =
    availableBalance !== null &&
    Number(amount) > 0 &&
    Number(amount) > availableBalance;

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
  // Debounced to avoid rapid-fire requests; stops retrying after a failure
  // until the user changes an input.
  useEffect(() => {
    const shouldCalculatePsbt = () => {
      if (selectedChain !== "btc" && selectedChain !== "btc_testnet")
        return false;
      if (step !== "form") return false;
      if (isCalculatingPsbt || unsignedTransactionData) return false;
      if (psbtCalcFailed) return false;
      if (!userAddress || !amount) return false;
      if (!isDeposit && !withdrawAddress) return false;
      if (Number(amount) < config.minDeposit) return false;
      if (isAmountExceedsBalance) return false;
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
      // Clear any pending debounce
      if (psbtDebounceRef.current) clearTimeout(psbtDebounceRef.current);
      psbtDebounceRef.current = setTimeout(() => {
        calculateUnsignedPsbt();
      }, 800);
    }

    return () => {
      if (psbtDebounceRef.current) clearTimeout(psbtDebounceRef.current);
    };
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

    const { psbt } = unsignedTransactionData as BtcStakingSuccessResponse;

    setLoading(true);
    setError(null);

    const transactionId = addPendingTransaction(
      selectedChain as SupportedChain,
      Number(amount),
      type,
    );
    setPendingTransactionId(transactionId);

    try {
      // Ask wallet to sign (empty signInputs → wallet auto-finalizes)
      const psbtResponse = await bitcoinConnector?.signPSBT({
        psbt,
        signInputs: [],
      });

      if (!psbtResponse?.psbt) {
        throw new Error("Wallet returned no PSBT data");
      }

      const signedPsbt = Psbt.fromBase64(psbtResponse.psbt);

      // Finalize if the wallet didn't auto-finalize
      const alreadyFinalized = signedPsbt.data.inputs.every(
        (inp) =>
          (inp.finalScriptSig && inp.finalScriptSig.length > 0) ||
          (inp.finalScriptWitness && inp.finalScriptWitness.length > 0),
      );

      if (!alreadyFinalized) {
        const finalized = finalizePsbtSafe(signedPsbt);
        if (!finalized) {
          throw new Error("Could not finalize the signed transaction.");
        }
      }

      // Extract raw transaction and broadcast
      const rawTx = signedPsbt.extractTransaction();
      const txHex = rawTx.toHex();

      setPsbtBase64(signedPsbt.toBase64());

      const broadcastResponse = await fetch("/api/btc-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawTx: txHex,
          network: selectedChain === "btc_testnet" ? "testnet" : "bitcoin",
        }),
      });

      if (!broadcastResponse.ok) {
        const errorData = await broadcastResponse.json();
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to broadcast transaction",
        );
      }

      const broadcastResult = await broadcastResponse.json();
      const txid = broadcastResult.txid;

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
      setTxHash(txid);

      addToast({
        type: "success",
        title: "Transaction Successful",
        message: `${amount} ${config?.symbol} ${type} completed successfully`,
      });
    } catch (err: any) {
      console.error("Sign/broadcast error:", err?.message);
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
            locktime: Math.floor(
              (Date.now() +
                (selectedYieldProvider?.locktime != null
                  ? selectedYieldProvider.locktime * 1000
                  : 1000 * 60 * 5)) /
                1000,
            ),
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

      const data: BtcStakingResponse | BtcWithdrawalResponse =
        await response.json();
      if (!("success" in data) || !data.success) {
        throw new Error(
          "error" in data ? data.error : "Failed to create transaction",
        );
      }
      console.log("Unsigned transaction calculated:", data);
      setUnsignedTransactionData(data);

      // Populate depositAddress from staking response so PsbtSigning can watch it
      if (isDeposit && "timelockScript" in data) {
        setDepositAddress(data.timelockScript.address);
      }
    } catch (err: any) {
      console.error("Error calculating PSBT:", err);
      // Don't show error for auto-calculation, just reset and mark as failed
      // so we don't retry until the user changes an input
      setUnsignedTransactionData(null);
      setPsbtCalcFailed(true);
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
    // Validate the chain is actually a valid config key before setting
    if (!chainConfigs[chain]) {
      console.warn(`handleChainChange called with invalid chain: "${chain}"`);
      return;
    }
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
    setDepositAddress("");
    setIsCalculatingPsbt(false);
    setPsbtCalcFailed(false);
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
    setUnsignedTransactionData(null);
    setPsbtCalcFailed(false);
    onAmountChange?.(value, selectedChain);
  };

  const handleAddressChange = (value: string) => {
    setUserAddress(value);
    setUnsignedTransactionData(null);
    setPsbtCalcFailed(false);
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
    setUnsignedTransactionData(null);
    setPsbtCalcFailed(false);
  };

  const handleManualPublicKeyChange = (value: string) => {
    setManualPublicKey(value);
    // Cache the user's manually entered public key if it's valid
    if (value.trim().length === 66 && /^[0-9a-fA-F]{66}$/.test(value.trim())) {
      setCachedUserPublicKey(value.trim());
    }
    setUnsignedTransactionData(null); // Reset PSBT when public key changes
    setDepositAddress("");
    setPsbtCalcFailed(false);
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
          <div className="flex items-center justify-between">
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

      {/* PSBT Calculation Status (Bitcoin only) */}
      {isBtcChain && isCalculatingPsbt && (
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
                loading || !unsignedTransactionData || isAmountExceedsBalance
              }
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
              disabled={!unsignedTransactionData || isAmountExceedsBalance}
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
      targetAddress={isDeposit ? depositAddress : withdrawAddress}
      expectedAmount={Math.floor(Number(amount) * 1e8)}
      chain={selectedChain as "btc" | "btc_testnet"}
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
  );

  const renderDoneStep = () => (
    <div className="space-y-4">
      <div className="p-4 bg-green-100/20 border border-green-200 rounded-md">
        <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
          <CheckCircle className="w-5 h-5" />
          {getSuccessMessage()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Transaction Hash:</span>
          <a
            href={`${config?.explorerBaseUrl || "#"}${
              config?.explorerTxSlug || ""
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
  );

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
