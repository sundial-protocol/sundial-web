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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bitcoin,
  Coins,
  ExternalLink,
  Copy,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

type Chain = "btc" | "ada";

interface ChainConfig {
  id: Chain;
  name: string;
  symbol: string;
  icon: React.ReactNode;
  addressPrefix: string;
  minDeposit: number;
  decimals: number;
  explorerUrl: string;
  features: string[];
}

const chainConfigs: Record<Chain, ChainConfig> = {
  btc: {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: <Bitcoin className="w-4 h-4" />,
    addressPrefix: "bc1q",
    minDeposit: 0.001,
    decimals: 8,
    explorerUrl: "https://blockstream.info/tx/",
    features: [
      "Native Bitcoin staking",
      "8.5% APY average",
      "Liquid staking available",
      "No lock-up period",
    ],
  },
  ada: {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    icon: <Coins className="w-4 h-4" />,
    addressPrefix: "addr1",
    minDeposit: 10,
    decimals: 6,
    explorerUrl: "https://cardanoscan.io/transaction/",
    features: [
      "Stake pool delegation",
      "4-6% APY rewards",
      "5-day epoch duration",
      "Liquid staking tokens",
    ],
  },
};

export default function DepositTab() {
  const [selectedChain, setSelectedChain] = useState<Chain>("btc");
  const [userAddress, setUserAddress] = useState("");
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

  const config = chainConfigs[selectedChain];
  const depositAddress =
    selectedChain === "btc"
      ? "bc1qyourportfolioaddresshere"
      : "addr1qyourportfolioaddresshere";

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setUserAddress("");
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

  // Bitcoin deposit logic
  const handleBtcDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `https://blockstream.info/api/address/${userAddress}/utxo`
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
        address: depositAddress,
        value: sendAmount,
      });

      const change = totalInput - sendAmount - fee;
      if (change > 0) {
        psbt.addOutput({
          address: userAddress,
          value: change,
        });
      }

      setPsbtBase64(psbt.toBase64());
      setStep("psbt");
    } catch (err: any) {
      setError(err.message || "Error creating Bitcoin transaction");
    }
    setLoading(false);
  };

  // ADA deposit logic
  const handleAdaDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Placeholder for Cardano transaction logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTxHash("sample_cardano_tx_hash_" + Date.now());
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Error processing ADA deposit");
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

      const res = await fetch("https://blockstream.info/api/tx", {
        method: "POST",
        body: signedHex,
        headers: { "Content-Type": "text/plain" },
      });

      if (!res.ok) throw new Error("Broadcast failed");
      const txid = await res.text();
      setBroadcastResult(txid);
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Broadcast error");
    }
    setLoading(false);
  };

  const isFormValid = () => {
    return (
      userAddress &&
      Number(amount) >= config.minDeposit &&
      userAddress.startsWith(config.addressPrefix)
    );
  };

  const getCurrentTxHash = () => {
    return selectedChain === "btc" ? broadcastResult : txHash;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Deposit Assets</h2>
        <p className="text-muted-foreground">
          Choose a blockchain and deposit assets to start earning yield
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit to Portfolio</CardTitle>
          <CardDescription>
            Select your preferred blockchain and deposit assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "form" && (
            <form
              onSubmit={
                selectedChain === "btc" ? handleBtcDeposit : handleAdaDeposit
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
                    {Object.values(chainConfigs).map((chain) => (
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
                  {config.name} Staking Information
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
                  Your {config.name} wallet address for receiving change or
                  rewards
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Amount to Deposit ({config.symbol})
                </label>
                <Input
                  type="number"
                  step={1 / Math.pow(10, config.decimals)}
                  min={config.minDeposit}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={config.minDeposit.toString()}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum deposit: {config.minDeposit} {config.symbol}
                </p>
              </div>

              {/* Deposit Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Deposit Address</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={depositAddress}
                    readOnly
                    className="bg-muted font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(depositAddress)}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button type="submit" disabled={loading || !isFormValid()}>
                  {loading ? "Processing..." : `Deposit ${config.symbol}`}
                </Button>

                {selectedChain === "ada" && (
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

          {step === "psbt" && selectedChain === "btc" && (
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
                  {config.name} Deposit Processed Successfully!
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Transaction Hash:</span>
                  <a
                    href={`${config.explorerUrl}${getCurrentTxHash()}`}
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
                  Make Another Deposit
                </Button>
                <Button asChild>
                  <a href="/dashboard?tab=portfolio">View Portfolio</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
