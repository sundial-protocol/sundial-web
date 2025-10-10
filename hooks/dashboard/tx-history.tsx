import { SupportedChain } from "@/lib/multichain";
import { useState } from "react";

export interface LoggedTx {
  id: string;
  type: "deposit" | "withdraw" | "claim";
  asset: SupportedChain;
  amount: number;
  usdValue?: number;
  status: "completed" | "pending" | "failed";
  timestamp: Date;
  txHash: string;
  strategy?: string;
}

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<LoggedTx[]>(
    mockTransactionHistory
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterTransactions = (
    type?: string,
    asset?: string,
    status?: string
  ) => {
    return transactions.filter((tx) => {
      if (type && tx.type !== type) return false;
      if (asset && tx.asset !== asset) return false;
      if (status && tx.status !== status) return false;
      return true;
    });
  };

  return {
    transactions,
    isLoading,
    error,
    filterTransactions,
  };
}

export const mockTransactionHistory: LoggedTx[] = [
  {
    id: "tx-1",
    type: "deposit",
    asset: "btc",
    amount: 0.5,
    usdValue: 25000,
    status: "completed",
    timestamp: new Date("2025-03-01T10:30:00"),
    txHash: "0x1234...abcd",
    strategy: "Bitcoin Liquid Staking",
  },
  {
    id: "tx-2",
    type: "claim",
    asset: "ada",
    amount: 125.5,
    usdValue: 150,
    status: "completed",
    timestamp: new Date("2025-02-28T14:15:00"),
    txHash: "0x5678...efgh",
    strategy: "Cardano Delegation Pool",
  },
  {
    id: "tx-3",
    type: "deposit",
    asset: "ada",
    amount: 5000,
    usdValue: 6000,
    status: "pending",
    timestamp: new Date("2025-02-27T09:45:00"),
    txHash: "0x9abc...ijkl",
    strategy: "Cardano DEX LP",
  },
  {
    id: "tx-4",
    type: "withdraw",
    asset: "btc",
    amount: 0.1,
    usdValue: 5000,
    status: "completed",
    timestamp: new Date("2025-02-26T16:20:00"),
    txHash: "0xdef0...mnop",
    strategy: "Bitcoin Lending Protocol",
  },
];
