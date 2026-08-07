"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// Base transaction types
export type StakingTxTypes =
  | "deposit"
  | "withdraw"
  | "stake"
  | "unstake"
  | "reward";
export type LendingTxTypes =
  | "loan_created"
  | "loan_payment"
  | "loan_extended"
  | "loan_refinanced"
  | "loan_closed";
export type TxTypes = StakingTxTypes | LendingTxTypes;

export interface BaseTransaction {
  id: string;
  type: TxTypes;
  asset: string;
  amount: number;
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  usdValue?: number;
  txHash?: string;
  details?: string;
}

export interface StakingTransaction extends BaseTransaction {
  type: StakingTxTypes;
  chain?: string;
}

export interface LendingTransaction extends BaseTransaction {
  type: LendingTxTypes;
  loanId?: string;
  collateral?: {
    asset: string;
    amount: number;
  };
  interestRate?: number;
}

export type Transaction = StakingTransaction | LendingTransaction;

// Transaction context type
interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (
    transaction: Omit<Transaction, "id" | "timestamp">
  ) => string;
  updateTransactionStatus: (
    id: string,
    status: Transaction["status"],
    txHash?: string
  ) => void;
  removeTransaction: (id: string) => void;
  getTransactionsByType: (type: TxTypes | TxTypes[]) => Transaction[];
  getTransactionsByLoanId: (loanId: string) => LendingTransaction[];
  getTransactionsByAsset: (asset: string) => Transaction[];
  getTransactionsByStatus: (status: Transaction["status"]) => Transaction[];
  clearTransactions: () => void;
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "deposit",
    asset: "btc",
    amount: 0.5,
    usdValue: 25000,
    status: "completed",
    timestamp: new Date("2025-03-01T10:30:00"),
    txHash: "0x1234...abcd",
    chain: "btc",
  } as StakingTransaction,
  {
    id: "tx-2",
    type: "loan_created",
    asset: "usdc",
    amount: 10000,
    usdValue: 10000,
    status: "completed",
    timestamp: new Date("2025-02-28T14:15:00"),
    loanId: "loan-1",
    collateral: { asset: "btc", amount: 0.25 },
    interestRate: 8.5,
    details: "Collateral loan created",
  } as LendingTransaction,
  {
    id: "tx-3",
    type: "stake",
    asset: "ada",
    amount: 5000,
    usdValue: 1750,
    status: "completed",
    timestamp: new Date("2025-02-27T16:45:00"),
    txHash: "0x5678...efgh",
    chain: "ada",
  } as StakingTransaction,
  {
    id: "tx-4",
    type: "loan_payment",
    asset: "usdc",
    amount: 500,
    usdValue: 500,
    status: "completed",
    timestamp: new Date("2025-02-26T09:15:00"),
    loanId: "loan-1",
    details: "Monthly loan payment",
  } as LendingTransaction,
];

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);

  // Calculate USD value helper
  const calculateUsdValue = (amount: number, asset: string): number => {
    const assetName = asset.toLowerCase();
    // btc_testnet and sundial_l2 are both BTC-denominated.
    if (assetName === "btc" || assetName === "btc_testnet") return amount * 52000;
    if (assetName === "sundial_l2") return amount * 52000;
    if (assetName === "ada" || assetName === "ada_testnet") return amount * 0.35;
    if (assetName === "usdc") return amount;
    return amount;
  };

  const addTransaction = (
    transactionData: Omit<Transaction, "id" | "timestamp">
  ): string => {
    const transactionId = `tx-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newTransaction: Transaction = {
      ...transactionData,
      id: transactionId,
      timestamp: new Date(),
      usdValue:
        transactionData.usdValue ||
        calculateUsdValue(transactionData.amount, transactionData.asset),
    };

    console.log("🚀 Adding transaction:", newTransaction);

    setTransactions((prev) => {
      const updated = [newTransaction, ...prev];
      console.log("📊 Total transactions:", updated.length);
      return updated;
    });

    return transactionId;
  };

  const updateTransactionStatus = (
    id: string,
    status: Transaction["status"],
    txHash?: string
  ) => {
    console.log("Updating transaction status:", id, status);

    setTransactions((prev) => {
      const updated = prev.map((tx) =>
        tx.id === id ? { ...tx, status, ...(txHash && { txHash }) } : tx
      );
      console.log("Transaction status updated");
      return updated;
    });
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    console.log("Removed transaction:", id);
  };

  const getTransactionsByType = (type: TxTypes | TxTypes[]): Transaction[] => {
    const types = Array.isArray(type) ? type : [type];
    return transactions.filter((tx) => types.includes(tx.type));
  };

  const getTransactionsByLoanId = (loanId: string): LendingTransaction[] => {
    return transactions.filter(
      (tx): tx is LendingTransaction => "loanId" in tx && tx.loanId === loanId
    );
  };

  const getTransactionsByAsset = (asset: string): Transaction[] => {
    return transactions.filter(
      (tx) => tx.asset.toLowerCase() === asset.toLowerCase()
    );
  };

  const getTransactionsByStatus = (
    status: Transaction["status"]
  ): Transaction[] => {
    return transactions.filter((tx) => tx.status === status);
  };

  const clearTransactions = () => {
    setTransactions([]);
    console.log("Cleared all transactions");
  };

  // Auto-cleanup failed transactions after 10 minutes
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      setTransactions((prev) => {
        const filtered = prev.filter((tx) => {
          const isOld = now.getTime() - tx.timestamp.getTime() > 10 * 60 * 1000;
          const shouldRemove = isOld && tx.status === "failed";

          if (shouldRemove) {
            console.log("🧹 Cleaning up old failed transaction:", tx.id);
          }

          return !shouldRemove;
        });

        return filtered;
      });
    }, 60000);

    return () => clearInterval(cleanup);
  }, []);

  const value: TransactionContextType = {
    transactions,
    addTransaction,
    updateTransactionStatus,
    removeTransaction,
    getTransactionsByType,
    getTransactionsByLoanId,
    getTransactionsByAsset,
    getTransactionsByStatus,
    clearTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}

// Helper hooks for common transaction queries
export function usePendingTransactions() {
  const { getTransactionsByStatus } = useTransactions();
  return getTransactionsByStatus("pending");
}

export function useCompletedTransactions() {
  const { getTransactionsByStatus } = useTransactions();
  return getTransactionsByStatus("completed");
}

export function useFailedTransactions() {
  const { getTransactionsByStatus } = useTransactions();
  return getTransactionsByStatus("failed");
}

export function useTransactionHistory() {
  const { transactions } = useTransactions();
  return transactions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
