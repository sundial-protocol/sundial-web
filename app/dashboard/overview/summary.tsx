import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { formatAmount } from "@/hooks/dashboard/prices";

export default function PortfolioSummary({ data }: { data: any }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Portfolio Summary
        </CardTitle>
        <CardDescription>
          Your total portfolio value and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">
            ${formatAmount(data.totalValue, 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Portfolio Value
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-orange-600">
              ${formatAmount(data.btcValue, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Bitcoin Value</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              ${formatAmount(data.adaValue || 0, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Other Holdings</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
