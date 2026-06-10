"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Clock, AlertTriangle } from "lucide-react";
import { TransactionWatcher } from "@/components/btc/tx-watcher";

export interface PsbtSigningProps {
  /** The PSBT in base64 format to be signed */
  psbtBase64: string;
  /** The target address to watch for the transaction */
  targetAddress: string;
  /** Expected amount in satoshis */
  expectedAmount: number;
  /** Bitcoin chain (btc or btc_testnet) */
  chain: "btc" | "btc_testnet";
  /** Called when transaction is successfully found */
  onTransactionFound: (txid: string) => void;
  /** Called when an error occurs during watching */
  onError: (error: string) => void;
  /** Optional title for the card */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Whether to show the card wrapper */
  showCard?: boolean;
  /** Custom instructions text */
  instructions?: string;
  /** Whether to show the transaction watcher */
  enableWatching?: boolean;
}

export function PsbtSigning({
  psbtBase64,
  targetAddress,
  expectedAmount,
  chain,
  onTransactionFound,
  onError,
  title = "Sign Bitcoin Transaction",
  description = "Sign the PSBT in your wallet and broadcast the transaction",
  showCard = true,
  instructions = "Copy the PSBT below and sign it in your Bitcoin wallet (e.g. Sparrow, Electrum), then broadcast the signed transaction.",
  enableWatching = true,
}: PsbtSigningProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard");
    }
  };

  const handleWatcherError = (watcherError: string) => {
    setError(watcherError);
    onError(watcherError);
  };

  const content = (
    <div className="space-y-6">
      {/* PSBT Display Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Bitcoin Transaction (PSBT)
        </label>
        <div className="relative">
          <textarea
            className="w-full p-3 border rounded-md text-xs font-mono bg-muted resize-none"
            rows={4}
            value={psbtBase64}
            readOnly
            placeholder="PSBT will appear here..."
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(psbtBase64)}
            disabled={!psbtBase64}
          >
            {copied ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
        {instructions && (
          <p className="text-sm text-muted-foreground">{instructions}</p>
        )}
      </div>

      {/* Transaction Details */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <div className="text-sm font-medium mb-2">Transaction Details</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Target Address:</span>
            <span className="font-mono text-right break-all">
              {targetAddress.slice(0, 20)}...{targetAddress.slice(-10)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span>{(expectedAmount / 1e8).toFixed(8)} BTC</span>
          </div>
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="capitalize">
              {chain === "btc_testnet" ? "Testnet" : "Mainnet"}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Watcher */}
      {enableWatching && psbtBase64 && (
        <>
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              Watching for transaction confirmation...
            </div>
          </div>

          <TransactionWatcher
            targetAddress={targetAddress}
            expectedAmount={expectedAmount}
            chain={chain}
            onTransactionFound={onTransactionFound}
            onError={handleWatcherError}
          />
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Wallet Instructions */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="text-sm font-medium mb-2">Wallet Instructions</div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>
            <strong>Sparrow Wallet:</strong>
            <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
              <li>Go to File → Open Transaction</li>
              <li>Paste the PSBT and click &quot;Open&quot;</li>
              <li>
                Click &quot;Finalize Transaction&quot; then &quot;Broadcast
                Transaction&quot;
              </li>
            </ol>
          </div>
          <div>
            <strong>Electrum:</strong>
            <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
              <li>Go to Tools → Load transaction → From text</li>
              <li>Paste the PSBT and click &quot;Load transaction&quot;</li>
              <li>Click &quot;Sign&quot; then &quot;Broadcast&quot;</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// Lightweight version without card wrapper
export function PsbtSigningInline(props: Omit<PsbtSigningProps, "showCard">) {
  return <PsbtSigning {...props} showCard={false} />;
}

// Hook for generating PSBTs (can be moved to a separate file)
export function usePsbtGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePsbt = async (_params: {
    sourceAddress: string;
    targetAddress: string;
    amount: number; // in BTC
    chain: "btc" | "btc_testnet";
    feeRate?: number; // sat/vB
  }) => {
    setLoading(true);
    setError(null);

    try {
      // For now, generate a mock PSBT since we don't have the backend API
      // In production, this would call your PSBT generation API
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      // Mock PSBT - in production this would come from your API
      const mockPsbt =
        "cHNidP8BAHECAAAAAZo5xKQ7yw0ZRF1t7A4ZZo5xKQ7yw0ZRF1t7A4ZZo5xKQ7ywAAAAAP////8CQEtAAAAAAAAZdqkUyWd6z7YsP3DdJ0s4lMsKFWGW0cToX8A6AAAAAAAAAP////8AAAAAAQD9UAEBAAAAATGt7rZR4sVgCt9hV/YP9sJYF7YNF2iBwK7DsInA0YF3AAAAAAD/////Avg6AAAAAAAAAP////8CYEtAAAAAAAAZdqkUyWd6z7YsP3DdJ0s4lMsKFWGW0cToX8A6AAAAAAAAAP////8AAAAAAQD9UAEBAAAAATGt7rZR4sVgCt9hV/YP9sJYF7YNF2iBwK7DsInA0YF3AAAAAAD////";

      return mockPsbt;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate PSBT";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { generatePsbt, loading, error };
}
