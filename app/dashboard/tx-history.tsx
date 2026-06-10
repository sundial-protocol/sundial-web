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
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  DollarSign,
  ExternalLink,
  CreditCard,
  Calendar,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
// Updated import to use the new dashboard hook
import { TransactionType } from "@/hooks/dashboard/dashboard";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

// Enhanced transaction icon function to support lending transactions
const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case "stake":
    case "deposit":
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    case "unstake":
    case "withdraw":
      return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
    case "reward":
      return <Coins className="h-4 w-4 text-yellow-500" />;
    //  Lending transaction icons
    case "loan_created":
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case "loan_payment":
      return <DollarSign className="h-4 w-4 text-green-600" />;
    case "loan_extended":
      return <Calendar className="h-4 w-4 text-orange-500" />;
    case "loan_refinanced":
      return <RefreshCw className="h-4 w-4 text-purple-500" />;
    case "loan_closed":
      return <XCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <ArrowUpRight className="h-4 w-4" />;
  }
};

// Enhanced transaction type display names
const getTransactionTypeDisplay = (type: TransactionType) => {
  switch (type) {
    case "loan_created":
      return "Loan Created";
    case "loan_payment":
      return "Loan Payment";
    case "loan_extended":
      return "Loan Extended";
    case "loan_refinanced":
      return "Loan Refinanced";
    case "loan_closed":
      return "Loan Closed";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

// Enhanced transaction category for grouping
const getTransactionCategory = (type: TransactionType) => {
  if (type.startsWith("loan_")) return "lending";
  if (["stake", "unstake"].includes(type)) return "staking";
  if (["deposit", "withdraw"].includes(type)) return "portfolio";
  if (type === "reward") return "earnings";
  return "other";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-800/20 text-green-800">
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-800/20 text-yellow-800">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="secondary" className="bg-red-800/20 text-red-800">
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getExplorerUrl = (chain: string, txHash: string) => {
  switch (chain.toLowerCase()) {
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
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Updated to use the new dashboard hook
  const { transactions } = useDashboardContext();

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const filteredTransactions = sortedTransactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.txHash || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //  Search by loan ID for lending transactions
      ("loanId" in tx &&
        tx.loanId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      //  Search by transaction details
      (tx.details &&
        tx.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesCategory =
      filterCategory === "all" ||
      getTransactionCategory(tx.type) === filterCategory;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const exportTransactions = () => {
    const csvHeaders = [
      "ID",
      "Type",
      "Category",
      "Asset",
      "Amount",
      "USD Value",
      "Status",
      "Transaction Hash",
      "Timestamp",
      "Loan ID", //  Include loan ID
      "Interest Rate", //  Include interest rate
      "Details", //  Include transaction details
    ];

    const csvContent = [
      csvHeaders.join(","),
      ...filteredTransactions.map((tx) => {
        const loanId = "loanId" in tx ? tx.loanId || "" : "";
        const interestRate = "interestRate" in tx ? tx.interestRate || "" : "";
        const details = tx.details ? `"${tx.details.replace(/"/g, '""')}"` : "";

        return [
          tx.id,
          tx.type,
          getTransactionCategory(tx.type),
          tx.asset,
          tx.amount,
          tx.usdValue || 0,
          tx.status,
          tx.txHash || "",
          tx.timestamp,
          loanId,
          interestRate,
          details,
        ].join(",");
      }),
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

  //  Calculate category statistics
  const categoryStats = {
    staking: transactions.filter(
      (tx) =>
        getTransactionCategory(tx.type) === "staking" &&
        tx.status === "completed",
    ).length,
    lending: transactions.filter(
      (tx) =>
        getTransactionCategory(tx.type) === "lending" &&
        tx.status === "completed",
    ).length,
    portfolio: transactions.filter(
      (tx) =>
        getTransactionCategory(tx.type) === "portfolio" &&
        tx.status === "completed",
    ).length,
    earnings: transactions.filter(
      (tx) =>
        getTransactionCategory(tx.type) === "earnings" &&
        tx.status === "completed",
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <div className="text-sm text-muted-foreground">
              {sortedTransactions.length} total transactions
            </div>
          </CardTitle>
          <CardDescription>
            View and manage all your blockchain transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, hash, loan ID, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/*  Category filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="staking">Staking</SelectItem>
                <SelectItem value="lending">Lending</SelectItem>
                <SelectItem value="earnings">Earnings</SelectItem>
              </SelectContent>
            </Select>

            {/* Enhanced type filter with lending types */}
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
                <SelectItem value="loan_created">Loan Created</SelectItem>
                <SelectItem value="loan_payment">Loan Payment</SelectItem>
                <SelectItem value="loan_extended">Loan Extended</SelectItem>
                <SelectItem value="loan_refinanced">Loan Refinanced</SelectItem>
                <SelectItem value="loan_closed">Loan Closed</SelectItem>
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

          {/* Enhanced Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {/* Status Stats */}
            <div className="p-4 bg-green-800/20 border border-green-200/90 rounded-lg">
              <div className="text-sm text-green-600">Completed</div>
              <div className="text-2xl font-bold text-green-800">
                {transactions.filter((tx) => tx.status === "completed").length}
              </div>
            </div>
            <div className="p-4 bg-yellow-800/20 border border-yellow-200/90 rounded-lg">
              <div className="text-sm text-yellow-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-800">
                {transactions.filter((tx) => tx.status === "pending").length}
              </div>
            </div>

            {/*  Category Stats */}
            <div className="p-4 bg-blue-800/20 border border-blue-200/90 rounded-lg">
              <div className="text-sm text-blue-600">Staking</div>
              <div className="text-lg font-bold text-blue-800">
                {categoryStats.staking}
              </div>
            </div>
            <div className="p-4 bg-purple-800/20 border border-purple-200/90 rounded-lg">
              <div className="text-sm text-purple-600">Lending</div>
              <div className="text-lg font-bold text-purple-800">
                {categoryStats.lending}
              </div>
            </div>
            <div className="p-4 bg-orange-800/20 border border-orange-200/90 rounded-lg">
              <div className="text-sm text-orange-600">Portfolio</div>
              <div className="text-lg font-bold text-orange-800">
                {categoryStats.portfolio}
              </div>
            </div>
            <div className="p-4 bg-emerald-800/20 border border-emerald-200/90 rounded-lg">
              <div className="text-sm text-emerald-600">Total Volume</div>
              <div className="text-lg font-bold text-emerald-800">
                $
                {transactions
                  .filter((tx) => tx.status === "completed")
                  .reduce((sum, tx) => sum + (tx.usdValue || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>

          {/* Enhanced Transaction List */}
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {getTransactionTypeDisplay(transaction.type)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.asset.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          getTransactionCategory(transaction.type) === "lending"
                            ? "bg-purple-50 text-purple-700"
                            : getTransactionCategory(transaction.type) ===
                                "staking"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {getTransactionCategory(transaction.type)}
                      </Badge>
                      {getStatusBadge(transaction.status)}
                    </div>

                    {/*  Enhanced transaction details */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        {new Date(transaction.timestamp).toLocaleString()}
                      </div>

                      {/*  Show loan ID for lending transactions */}
                      {"loanId" in transaction && transaction.loanId && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3" />
                          <span className="font-mono text-xs">
                            Loan: {transaction.loanId}
                          </span>
                        </div>
                      )}

                      {/*  Show interest rate for loan creation */}
                      {"interestRate" in transaction &&
                        transaction.interestRate && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-xs">
                              {transaction.interestRate}% APR
                            </span>
                          </div>
                        )}

                      {/*  Show collateral for collateral loans */}
                      {"collateral" in transaction &&
                        transaction.collateral && (
                          <div className="flex items-center gap-2">
                            <Coins className="h-3 w-3" />
                            <span className="text-xs">
                              Collateral: {transaction.collateral.amount}{" "}
                              {transaction.collateral.asset}
                            </span>
                          </div>
                        )}

                      {/*  Show transaction details */}
                      {transaction.details && (
                        <div className="text-xs text-muted-foreground max-w-md truncate">
                          {transaction.details}
                        </div>
                      )}

                      {/* Transaction hash */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {!transaction.txHash
                            ? "Transaction pending..."
                            : `${transaction.txHash.slice(0, 16)}...`}
                        </span>
                        {transaction.txHash &&
                          transaction.status === "completed" && (
                            <a
                              href={getExplorerUrl(
                                transaction.asset,
                                transaction.txHash,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced transaction amount display */}
                <div className="text-right">
                  <div className="font-medium">
                    {transaction.type === "loan_extended" &&
                    transaction.amount === 0 ? (
                      <span className="text-muted-foreground">Extension</span>
                    ) : (
                      <>
                        {transaction.amount} {transaction.asset.toUpperCase()}
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${transaction?.usdValue?.toLocaleString() ?? "0"}
                  </div>
                  {transaction.status === "pending" && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Processing...
                    </div>
                  )}
                  {transaction.status === "failed" && (
                    <div className="text-xs text-red-600 mt-1">Failed</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced empty state */}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {sortedTransactions.length === 0
                  ? "No transactions yet"
                  : "No transactions found matching your criteria"}
              </div>
              {sortedTransactions.length === 0 && (
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = "/dashboard?tab=stake")
                    }
                  >
                    Make your first deposit
                  </Button>
                  {/*<Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = "/dashboard?tab=lending")
                    }
                  >
                    Create a loan
                  </Button>*/}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
