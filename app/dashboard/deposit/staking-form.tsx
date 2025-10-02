"use client";

import { useState } from "react";
import * as bitcoin from "bitcoinjs-lib";
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
} from "lucide-react";
import { chainConfigs, Chain } from "./types";
import { depositAddress } from "@/hooks/get-scripts";
import { useWallet } from "@/lib/wallet/context";
import { depositFundTx } from "@sundial-protocol/ada-locker";
import { lovelaceToAssets } from "@/lib/cardano";

type TransactionType = "deposit" | "withdraw";
const LockDurationSeconds = 30 * 24 * 60 * 60; // 30 days

interface StakingFormProps {
  type: TransactionType;
  onSuccess?: (txHash: string, chain: Chain, amount: string) => void;
  onAmountChange?: (amount: string, chain: Chain) => void;
  defaultChain?: Chain;
}

export default function StakingForm({
  type,
  onSuccess,
  onAmountChange,
  defaultChain = "btc",
}: StakingFormProps) {
  const [selectedChain, setSelectedChain] = useState<Chain>(defaultChain);
  const [userAddress, setUserAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Bitcoin-specific states
  const [psbtBase64, setPsbtBase64] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  const [step, setStep] = useState<"form" | "psbt" | "broadcast" | "done">(
    "form"
  );

  // ADA-specific states
  const [txHash, setTxHash] = useState("");

  // Cardano wallet context
  const { isConnected, lucid, api, changeAddress, stakeAddress } = useWallet();

  const config = chainConfigs[selectedChain];
  const isDeposit = type === "deposit";

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setUserAddress("");
    setWithdrawAddress("");
    setAmount("");
    setError(null);
    setPsbtBase64("");
    setBroadcastResult("");
    setTxHash("");
    setStep("form");
  };

  const handleChainChange = (chain: Chain) => {
    setSelectedChain(chain);
    resetForm();
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    onAmountChange?.(value, selectedChain);
  };

  // Bitcoin transaction logic
  const handleBtcTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const sourceAddress = isDeposit
        ? userAddress
        : depositAddress(selectedChain);
      const targetAddress = isDeposit
        ? depositAddress(selectedChain)
        : withdrawAddress;

      const res = await fetch(
        `${config.explorerBaseUrl}address/${sourceAddress}/utxo`
      );
      if (!res.ok) throw new Error("Failed to fetch UTXOs");
      const utxos = await res.json();

      const network = bitcoin.networks.bitcoin;
      const psbt = new bitcoin.Psbt({ network });

      let totalInput = 0;
      const sendAmount = Math.floor(Number(amount) * 1e8);
      const fee = 500;

      for (const utxo of utxos) {
        if (totalInput >= sendAmount + fee) break;
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: Buffer.from(utxo.scriptpubkey, "hex"),
            value: utxo.value,
          },
        });
        totalInput += utxo.value;
      }

      if (totalInput < sendAmount + fee) {
        throw new Error("Insufficient balance");
      }

      psbt.addOutput({
        address: targetAddress,
        value: sendAmount,
      });

      const change = totalInput - sendAmount - fee;
      if (change > 0) {
        psbt.addOutput({
          address: sourceAddress,
          value: change,
        });
      }

      setPsbtBase64(psbt.toBase64());
      setStep("psbt");
    } catch (err: any) {
      setError(err.message || `Error creating Bitcoin ${type} transaction`);
    }
    setLoading(false);
  };

  // ADA transaction logic
  const handleAdaTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if wallet is connected
      if (!isConnected || !lucid || !api) {
        throw new Error("Please connect your Cardano wallet first");
      }

      // Validate amount
      const amountInLovelace = Math.floor(Number(amount) * 1_000_000); // Convert ADA to Lovelace
      if (amountInLovelace < 1_000_000) {
        throw new Error("Minimum deposit is 1 ADA");
      }

      if (isDeposit) {
        // Call depositFundTx from ada-locker package
        console.log("Calling depositFundTx with:", {
          amount: amountInLovelace,
          userAddress: changeAddress,
          stakeAddress,
        });

        const result = await depositFundTx(
          lovelaceToAssets(amountInLovelace),
          Date.now() + LockDurationSeconds,
          lucid,
          selectedChain === "ada_testnet" ? "Preprod" : "Mainnet"
        );

        const signedTx = await result.sign.withWallet().complete();
        const txHash = await signedTx.submit();

        if (txHash) {
          setTxHash(txHash);
          setStep("done");
          onSuccess?.(txHash, selectedChain, amount);
        } else {
          throw new Error("Transaction was submitted but no hash was returned");
        }
      } else {
        // For withdrawals, you might need a different function from ada-locker
        // This is a placeholder - replace with actual withdrawal function
        throw new Error("Withdrawal functionality not yet implemented");
      }
    } catch (err: any) {
      console.error("ADA transaction error:", err);
      setError(err.message || `Error processing ADA ${type}`);
    }
    setLoading(false);
  };

  // Broadcast Bitcoin transaction
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const signedHex = (form.signedHex as HTMLInputElement).value.trim();

      const res = await fetch(
        `${config.explorerBaseUrl}${config.explorerTxSlug}`,
        {
          method: "POST",
          body: signedHex,
          headers: { "Content-Type": "text/plain" },
        }
      );

      if (!res.ok) throw new Error("Broadcast failed");
      const txid = await res.text();
      setBroadcastResult(txid);
      setStep("done");
      onSuccess?.(txid, selectedChain, amount);
    } catch (err: any) {
      setError(err.message || "Broadcast error");
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
    if (loading) return "Processing...";
    return `${isDeposit ? "Deposit" : "Withdraw"} ${config.symbol}`;
  };

  const getSuccessMessage = () => {
    return `${config.name} ${
      isDeposit ? "Deposit" : "Withdrawal"
    } Processed Successfully!`;
  };

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
              selectedChain === "btc"
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

            {/* Chain Information */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
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
              </label>
              <Input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder={`${config.addressPrefix}...`}
                required
              />
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
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Step 1: Sign the PSBT
                </label>
                <div className="relative">
                  <textarea
                    className="w-full p-3 border rounded-md text-xs font-mono bg-muted"
                    rows={4}
                    value={psbtBase64}
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(psbtBase64)}
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Copy the above PSBT and sign it in your Bitcoin wallet (e.g.
                  Sparrow, Electrum).
                </p>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Step 2: Paste Signed Transaction Hex
                  </label>
                  <textarea
                    name="signedHex"
                    className="w-full p-3 border rounded-md text-xs font-mono"
                    rows={3}
                    placeholder="Paste your signed transaction hex here..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Broadcasting..." : "Broadcast Transaction"}
                </Button>
              </form>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
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
                <a href="/dashboard?tab=portfolio">View Portfolio</a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
