import { Activity, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { LoanHistory } from "../lending";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmount } from "@/hooks/dashboard/prices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RecentActivityCard() {
  const lendingHistory: LoanHistory[] = [
    {
      id: "loan-001",
      type: "collateral",
      amount: 5000,
      asset: "USDC",
      collateral: { amount: 0.15, asset: "BTC" },
      interestRate: 8.5,
      startDate: new Date("2024-01-15"),
      dueDate: new Date("2024-02-14"),
      status: "paid",
      totalPaid: 5035.42,
      interestPaid: 35.42,
    },
    {
      id: "loan-002",
      type: "credit",
      amount: 2500,
      asset: "USDC",
      interestRate: 12.5,
      startDate: new Date("2024-02-20"),
      dueDate: new Date("2024-03-21"),
      status: "active",
      totalPaid: 0,
      interestPaid: 0,
    },
    {
      id: "loan-003",
      type: "collateral",
      amount: 3000,
      asset: "DAI",
      collateral: { amount: 2500, asset: "ADA" },
      interestRate: 9.2,
      startDate: new Date("2023-12-01"),
      dueDate: new Date("2024-01-01"),
      status: "paid",
      totalPaid: 3023.5,
      interestPaid: 23.5,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "liquidated":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3" />;
      case "paid":
        return <CheckCircle className="h-3 w-3" />;
      case "overdue":
        return <XCircle className="h-3 w-3" />;
      case "liquidated":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lendingHistory.slice(0, 3).map((loan) => (
          <div
            key={loan.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(loan.status)}
              <div>
                <div className="text-sm font-medium">
                  ${formatAmount(loan.amount, 0)} {loan.asset}
                </div>
                <div className="text-xs text-muted-foreground">
                  {loan.startDate.toLocaleDateString()}
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(loan.status)} text-xs`}>
              {loan.status}
            </Badge>
          </div>
        ))}

        {lendingHistory.length > 3 && (
          <Button variant="outline" size="sm" className="w-full">
            View All History
          </Button>
        )}

        {lendingHistory.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No lending history yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
