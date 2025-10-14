import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/hooks/dashboard/dashboard";
import { usePrices, formatAmount } from "@/hooks/dashboard/prices";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

export default function TxAllocation() {
  const { convert } = usePrices();
  const { transactions } = useDashboardContext();

  // Group transactions by asset and calculate totals
  const transactionsByAsset = transactions
    .filter((tx) => tx.status === "completed" && tx.type === "deposit")
    .reduce((acc, tx) => {
      const asset = tx.asset.toUpperCase();
      if (!acc[asset]) {
        acc[asset] = {
          totalAmount: 0,
          transactions: [],
          symbol: asset,
        };
      }
      acc[asset].totalAmount += tx.amount;
      acc[asset].transactions.push(tx);
      return acc;
    }, {} as Record<string, { totalAmount: number; transactions: any[]; symbol: string }>);

  const totalPortfolioValue = Object.values(transactionsByAsset).reduce(
    (sum, asset) =>
      sum + convert(asset.totalAmount, asset.symbol as any, "USD"),
    0
  );

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>
          Your portfolio distributed across different assets based on completed
          deposits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall allocation summary */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {Object.entries(transactionsByAsset).map(([asset, data]) => {
            const usdValue = convert(
              data.totalAmount,
              data.symbol as any,
              "USD"
            );
            const percentage =
              totalPortfolioValue > 0
                ? (usdValue / totalPortfolioValue) * 100
                : 0;

            return (
              <div key={asset} className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    asset === "BTC" ? "text-orange-600" : "text-blue-600"
                  }`}
                >
                  {formatAmount(data.totalAmount, asset === "BTC" ? 4 : 2)}{" "}
                  {asset}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${formatAmount(usdValue, 0)} USD
                </div>
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% of portfolio
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual transactions as "positions" */}
        {transactions
          .filter((tx) => tx.status === "completed" && tx.type === "deposit")
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 10) // Show latest 10 deposits
          .map((transaction, index) => {
            const usdValue = convert(
              transaction.amount,
              transaction.asset.toUpperCase() as any,
              "USD"
            );
            const percentage =
              totalPortfolioValue > 0
                ? (usdValue / totalPortfolioValue) * 100
                : 0;

            return (
              <div key={transaction.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {transaction.asset.toUpperCase()} Deposit #{index + 1}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                      {transaction.status === "completed"
                        ? "Active"
                        : transaction.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatAmount(
                        transaction.amount,
                        transaction.asset === "btc" ? 4 : 2
                      )}{" "}
                      {transaction.asset.toUpperCase()}({percentage.toFixed(1)}
                      %)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(usdValue)}
                    </div>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Deposited:{" "}
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </span>
                  <span>
                    TX:{" "}
                    {transaction.txHash
                      ? `${transaction.txHash.slice(0, 8)}...`
                      : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}

        {/* Show message if no transactions */}
        {transactions.filter(
          (tx) => tx.status === "completed" && tx.type === "deposit"
        ).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No completed deposits yet.</p>
            <p className="text-sm">
              Make your first deposit to see your asset allocation here.
            </p>
          </div>
        )}

        {/* Transaction summary stats */}
        {transactions.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-green-600">
                  {
                    transactions.filter((tx) => tx.status === "completed")
                      .length
                  }
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-600">
                  {transactions.filter((tx) => tx.status === "pending").length}
                </div>
                <div className="text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  ${formatAmount(totalPortfolioValue, 0)}
                </div>
                <div className="text-muted-foreground">Total Value</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
