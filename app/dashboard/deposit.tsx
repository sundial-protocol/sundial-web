"use client";

import { useState } from "react";
import * as bitcoin from "bitcoinjs-lib";

export default function DepositBtcTab() {
  const [depositAddress, setDepositAddress] = useState(
    "bc1qyourportfolioaddresshere"
  ); // Replace with your portfolio's BTC address
  const [userAddress, setUserAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [psbtBase64, setPsbtBase64] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  const [utxos, setUtxos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "psbt" | "broadcast" | "done">(
    "form"
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch UTXOs for the user's address
  async function fetchUtxos(address: string) {
    // Using Blockstream API (mainnet)
    const res = await fetch(
      `https://blockstream.info/api/address/${address}/utxo`
    );
    if (!res.ok) throw new Error("Failed to fetch UTXOs");
    return await res.json();
  }

  // Build a PSBT for the deposit
  async function handleCreatePsbt(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setPsbtBase64("");
    setBroadcastResult("");
    setStep("form");

    try {
      const utxos = await fetchUtxos(userAddress);
      setUtxos(utxos);

      const network = bitcoin.networks.testnet;
      const psbt = new bitcoin.Psbt({ network });

      let totalInput = 0;
      let inputCount = 0;
      const sendAmount = Math.floor(Number(amount) * 1e8); // BTC to sats
      const fee = 500; // sats, static for demo

      // Add enough UTXOs to cover the amount + fee
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
        inputCount++;
      }

      if (totalInput < sendAmount + fee) {
        setError("Not enough balance.");
        setLoading(false);
        return;
      }

      // Output to portfolio/deposit address
      psbt.addOutput({
        address: depositAddress,
        value: sendAmount,
      });

      // Change back to user
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
      setError(err.message || "Error creating PSBT");
    }
    setLoading(false);
  }

  // Broadcast signed transaction
  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setBroadcastResult("");

    try {
      // User pastes signed tx hex
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
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Deposit Bitcoin</h2>
      {step === "form" && (
        <form onSubmit={handleCreatePsbt} className="space-y-4">
          <div>
            <label className="block font-medium">Your Bitcoin Address</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="bc1q..."
              required
            />
          </div>
          <div>
            <label className="block font-medium">Amount to Deposit (BTC)</label>
            <input
              type="number"
              step="0.00000001"
              min="0"
              className="w-full border rounded px-2 py-1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Deposit Address</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 bg-gray-100"
              value={depositAddress}
              readOnly
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? "Creating PSBT..." : "Create Deposit Transaction"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}

      {step === "psbt" && (
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Step 1: Sign the PSBT</label>
            <textarea
              className="w-full border rounded px-2 py-1 text-xs"
              rows={4}
              value={psbtBase64}
              readOnly
            />
            <p className="text-sm mt-2">
              Copy the above PSBT and sign it in your Bitcoin wallet (e.g.
              Sparrow, Electrum, or hardware wallet). Then paste the signed
              transaction hex below.
            </p>
          </div>
          <form onSubmit={handleBroadcast} className="space-y-2">
            <label className="block font-medium">
              Step 2: Paste Signed Transaction Hex
            </label>
            <textarea
              name="signedHex"
              className="w-full border rounded px-2 py-1 text-xs"
              rows={3}
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Broadcasting..." : "Broadcast Transaction"}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="text-green-700 font-semibold">
            Transaction broadcast! TXID:
            <a
              href={`https://blockstream.info/tx/${broadcastResult}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline"
            >
              {broadcastResult}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
