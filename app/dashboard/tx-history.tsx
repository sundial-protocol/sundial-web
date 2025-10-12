"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "stake":
    case "lend":
    case "deposit":
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    case "unstake":
    case "withdraw":
      return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
    case "reward":
      return <Coins className="h-4 w-4 text-yellow-500" />;
    default:
      return <ArrowUpRight className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getExplorerUrl = (chain: string, txHash: string) => {
  switch (chain) {
    case "btc":
      return `https://mempool.space/tx/${txHash}`;
    case "btc_testnet":
      return `https://mempool.space/testnet/tx/${txHash}`;
    case "ada":
      return `https://cardanoscan.io/transaction/${txHash}`;
    default:
      return `https://mempool.space/tx/${txHash}`;
  }
};

export function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Much simpler - just get transactions from context
  const { transactions } = useDashboardContext();

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredTransactions = sortedTransactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.txHash || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const exportTransactions = () => {
    const csvContent = [
      "ID,Type,Asset,Amount,USD Value,Status,Transaction Hash,Timestamp",
      ...filteredTransactions.map(
        (tx) =>
          `${tx.id},${tx.type},${tx.asset},${tx.amount},${tx.usdValue || 0},${
            tx.status
          },${tx.txHash},${tx.timestamp}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sundial-transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <div className="text-sm text-muted-foreground">
              {sortedTransactions.length} total transactions
            </div>
          </CardTitle>
          <CardDescription>
            View and manage all your blockchain transactions across Bitcoin and
            Cardano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, hash, or asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdraw">Withdraw</SelectItem>
                <SelectItem value="stake">Stake</SelectItem>
                <SelectItem value="unstake">Unstake</SelectItem>
                <SelectItem value="reward">Reward</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={exportTransactions}
              disabled={filteredTransactions.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-600">Completed</div>
              <div className="text-2xl font-bold text-green-800">
                {transactions.filter((tx) => tx.status === "completed").length}
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-800">
                {transactions.filter((tx) => tx.status === "pending").length}
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-600">Failed</div>
              <div className="text-2xl font-bold text-red-800">
                {transactions.filter((tx) => tx.status === "failed").length}
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-600">Total Volume</div>
              <div className="text-lg font-bold text-blue-800">
                $
                {transactions
                  .filter((tx) => tx.status === "completed")
                  .reduce((sum, tx) => sum + (tx.usdValue || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {transaction.type}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.asset.toUpperCase()}
                      </Badge>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">
                        {!transaction.txHash || transaction.status === "pending"
                          ? "Transaction pending..."
                          : `${transaction.txHash.slice(0, 16)}...`}
                      </span>
                      {transaction.txHash &&
                        transaction.status === "completed" && (
                          <a
                            href={getExplorerUrl(
                              transaction.asset,
                              transaction.txHash
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 ml-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {transaction.amount} {transaction.asset.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${transaction?.usdValue?.toLocaleString() ?? "0"}
                  </div>
                  {transaction.status === "pending" && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {sortedTransactions.length === 0
                  ? "No transactions yet"
                  : "No transactions found matching your criteria"}
              </div>
              {sortedTransactions.length === 0 && (
                <Button
                  variant="outline"
                  onClick={() =>
                    (window.location.href = "/dashboard?tab=deposit")
                  }
                >
                  Make your first deposit
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
