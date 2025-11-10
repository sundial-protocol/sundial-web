import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatAmount } from "@/hooks/dashboard/prices";
import { TrendingUp } from "lucide-react";
import { useGetLoans } from "@/hooks/dashboard/get-loans";

export default function LendingStatsCard() {
  const { lendingHistory } = useGetLoans();

  const totalBorrowed = lendingHistory.reduce(
    (sum, loan) => sum + loan.amount,
    0
  );
  const totalInterestPaid = lendingHistory.reduce(
    (sum, loan) => sum + loan.interestPaid,
    0
  );
  const successfulLoans = lendingHistory.filter(
    (loan) => loan.status === "paid"
  ).length;
  const totalLoans = lendingHistory.length;
  const paymentSuccessRate =
    totalLoans > 0 ? (successfulLoans / totalLoans) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Lending Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold">
              ${formatAmount(totalBorrowed, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Borrowed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold">
              ${formatAmount(totalInterestPaid, 2)}
            </div>
            <div className="text-xs text-muted-foreground">Interest Paid</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Payment Success Rate
            </span>
            <span className="text-sm font-medium text-green-600">
              {paymentSuccessRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={paymentSuccessRate} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{successfulLoans} successful</span>
            <span>{totalLoans} total loans</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
