import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StakingSummaryCard({
  alreadyStaked,
  amount,
  symbol,
  currentYield,
  newYield,
  type,
}: {
  alreadyStaked: number;
  amount: number;
  symbol: string;
  currentYield: number;
  newYield: number;
  type: "deposit" | "withdraw";
}) {
  const newTotal =
    type === "deposit"
      ? alreadyStaked + amount
      : Math.max(alreadyStaked - amount, 0);

  const chartLabels =
    type === "deposit"
      ? ["Already Staked", "Adding"]
      : ["Remaining Staked", "Withdrawing"];
  const chartColors =
    type === "deposit" ? ["#fbbf24", "#34d399"] : ["#fbbf24", "#f87171"];

  const yieldDiff = newYield * newTotal - currentYield * alreadyStaked;
  const diffColor =
    yieldDiff > 0
      ? "text-green-600"
      : yieldDiff < 0
      ? "text-red-600"
      : "text-gray-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staking Summary</CardTitle>
        <CardDescription>
          See how your {type === "deposit" ? "deposit" : "withdrawal"} affects
          your yield
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visualization */}
        <div className="flex flex-col items-center mb-6">
          <div style={{ width: 140, height: 140 }}>
            <Pie
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: [
                      type === "deposit" ? alreadyStaked : newTotal,
                      amount,
                    ],
                    backgroundColor: chartColors,
                    borderWidth: 1,
                    borderColor: chartColors,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: true,
                    position: "bottom" as const,
                    labels: {
                      font: { size: 12 },
                    },
                  },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Portfolio after {type === "deposit" ? "deposit" : "withdrawal"}
          </div>
        </div>
        {/* Numeric summary */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Already Staked
            </span>
            <span className="font-mono">
              {alreadyStaked} {symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {type === "deposit" ? "Adding" : "Withdrawing"}
            </span>
            <span className="font-mono">
              {amount} {symbol}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">New Total</span>
            <span className="font-mono font-semibold">
              {newTotal} {symbol}
            </span>
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-sm text-muted-foreground">Current Yield</span>
            <span className="font-mono">
              {(alreadyStaked * currentYield).toFixed(4)} BTC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Yield</span>
            <span className="font-mono">
              {(newTotal * newYield).toFixed(4)} BTC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Yield Difference
            </span>
            <span className={`font-mono ${diffColor}`}>
              {yieldDiff > 0 ? "+" : ""}
              {yieldDiff.toFixed(4)} BTC
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
