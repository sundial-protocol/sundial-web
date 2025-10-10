"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Loader2, Clock, CheckCircle as CheckCircleIcon } from "lucide-react";
import { SupportedChain } from "../../lib/multichain";

const mockTxHash =
  "202d0ca63ed27362d4e8fe01d1334fa0bd0ccbac639e248d373a74e539c6ad12";

// Add this interface after your existing interfaces
export interface TransactionWatcherProps {
  targetAddress: string;
  expectedAmount: number;
  chain: SupportedChain;
  onTransactionFound: (txid: string) => void;
  onError: (error: string) => void;
}

// Add this component before your component
export function TransactionWatcher({
  targetAddress,
  expectedAmount,
  chain,
  onTransactionFound,
  onError,
}: TransactionWatcherProps) {
  const [watchingStatus, setWatchingStatus] = useState<
    "watching" | "found" | "timeout"
  >("watching");
  const [timeRemaining, setTimeRemaining] = useState(30);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start watching for transaction
    setWatchingStatus("watching");
    setTimeRemaining(30);

    // Mock transaction watching - replace with real implementation
    const watchTransaction = async () => {
      try {
        console.log("Watching for transaction to:", targetAddress);
        console.log("Expected amount:", expectedAmount, "sats");

        // For now, just simulate finding a transaction after 30 seconds
        // In a real implementation, you would:
        // 1. Poll the mempool API for new transactions to the target address
        // 2. Check if any transaction matches the expected amount
        // 3. Verify the transaction is confirmed

        // Mock successful transaction after 30 seconds
        timeoutRef.current = setTimeout(() => {
          console.log("Mock transaction found:", mockTxHash);
          setWatchingStatus("found");
          onTransactionFound(mockTxHash);
        }, 30000);
      } catch (error: any) {
        console.error("Transaction watching error:", error);
        onError(error.message || "Error watching for transaction");
      }
    };

    // Start countdown timer
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setWatchingStatus("timeout");
          onError(
            "Transaction watching timed out. Please try again or broadcast manually."
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    watchTransaction();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetAddress, expectedAmount, chain, onTransactionFound, onError]);

  const getStatusIcon = () => {
    switch (watchingStatus) {
      case "watching":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "found":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "timeout":
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (watchingStatus) {
      case "watching":
        return `Watching for your transaction...`;
      case "found":
        return "Transaction found! Processing...";
      case "timeout":
        return "Transaction watching timed out";
      default:
        return "Preparing to watch for transaction...";
    }
  };

  const getStatusColor = () => {
    switch (watchingStatus) {
      case "watching":
        return "border-blue-200 bg-blue-50";
      case "found":
        return "border-green-200 bg-green-50";
      case "timeout":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className={`p-4 border rounded-md ${getStatusColor()}`}>
      <div className="flex items-center gap-3 mb-3">
        {getStatusIcon()}
        <div>
          <h3 className="font-medium text-sm">Transaction Watcher</h3>
          <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Target Address:</span>
          <span className="font-mono">{targetAddress.slice(0, 20)}...</span>
        </div>
        <div className="flex justify-between">
          <span>Expected Amount:</span>
          <span>{(expectedAmount / 1e8).toFixed(8)} BTC</span>
        </div>
        <div className="flex justify-between">
          <span>Network:</span>
          <span>
            {chain === "btc_testnet" ? "Bitcoin Testnet" : "Bitcoin Mainnet"}
          </span>
        </div>
      </div>

      {watchingStatus === "watching" && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((30 - timeRemaining) / 30) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {watchingStatus === "timeout" && (
        <div className="mt-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
