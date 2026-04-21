import {
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from "chart.js";
import { formatAmount, PricesMap } from "@/hooks/dashboard/prices";
import { useState } from "react";
import {
  EarningsData,
  generateEarningsData,
} from "@/hooks/dashboard/dashboard";
import {
  YieldOpportunity,
  yieldFromProvider,
} from "@/hooks/dashboard/yield-opportunities";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler,
);

// Custom tooltip for the chart with proper USD conversion
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const btcValue = data.btcEarnings || data.btcProjected;
    const adaValue = data.adaEarnings || data.adaProjected;
    const totalValue = data.total || data.totalProjected;
    const isProjected = data.btcProjected !== null && data.btcEarnings === null;

    return (
      <div className="bg-background p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-orange-400 rounded mr-2"></span>
            Bitcoin: ${formatAmount(btcValue, 2)}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-blue-400 rounded mr-2"></span>
            Other: ${formatAmount(adaValue, 2)}
          </p>
          <p className="text-sm font-semibold">
            Total: ${formatAmount(totalValue, 2)}
          </p>
          {isProjected && (
            <p className="text-xs text-gray-500 italic">Projected</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function EarningsGraph(props: {
  adaValue: number;
  btcValue: number;
  provider: YieldOpportunity | null;
}) {
  const earningsData: EarningsData[] = generateEarningsData(
    props.adaValue,
    props.btcValue,
    props.provider,
  );

  const [timeRange, setTimeRange] = useState("12m");

  const monthCount = timeRange === "6m" ? 6 : timeRange === "24m" ? 24 : 12;
  // generateEarningsData always produces 13 points centred on today.
  // For shorter ranges keep only the last N points; for longer ones pad with
  // extra projected months beyond what the generator produces.
  const visibleData = (() => {
    if (monthCount <= earningsData.length) {
      return earningsData.slice(-monthCount);
    }
    // Build extra projected months beyond the existing data
    const extra: EarningsData[] = [];
    const last = earningsData[earningsData.length - 1];
    let btc = last?.btcProjected ?? 0;
    for (let i = 1; i <= monthCount - earningsData.length; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + 7 + i);
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      btc = btc + yieldFromProvider(btc, props.provider);
      extra.push({
        month: monthName,
        btcEarnings: null,
        adaEarnings: null,
        total: null,
        btcProjected: btc,
        adaProjected: props.adaValue,
        totalProjected: btc + props.adaValue,
        type: "projected",
      });
    }
    return [...earningsData, ...extra];
  })();

  return (
    <div className="col-span-5 xs:col-span-3 md:col-span-4">
      {/* Graph of past and future earnings */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Historical performance and projected earnings across Bitcoin and
                other assets (USD values)
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">6M</SelectItem>
                <SelectItem value="12m">12M</SelectItem>
                <SelectItem value="24m">24M</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={visibleData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} tick={{ fontSize: 10 }} />
                <YAxis
                  fontSize={12}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${formatAmount(value, 0)}`}
                  label={{
                    value: "USD ($)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Historical stacked areas (solid) */}
                <Area
                  type="monotone"
                  dataKey="btcEarnings"
                  stackId="1"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.6}
                  name="Bitcoin Earnings"
                  strokeWidth={2}
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="adaEarnings"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Cardano Earnings"
                  strokeWidth={2}
                  connectNulls={false}
                />

                {/* Projected stacked areas */}
                <Area
                  type="monotone"
                  dataKey="btcProjected"
                  stackId="2"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.4}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Bitcoin Projected"
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="otherProjected"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Projected Other Assets"
                  connectNulls={false}
                />

                {/* Historical total line (solid) */}
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1f2937"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Total Earnings"
                  connectNulls={false}
                />

                {/* Projected total line (dashed) */}
                <Line
                  type="monotone"
                  dataKey="totalProjected"
                  stroke="#1f2937"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ r: 4, strokeDasharray: "0" }}
                  name="Total Projected"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend indicators */}
          <div className="flex justify-center mt-4 gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-gray-800"></div>
              <span>Historical Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 border-2 border-gray-800 border-dashed"></div>
              <span>Projected Earnings</span>
            </div>
          </div>

          {/* Summary stats with USD values */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                $
                {formatAmount(
                  visibleData.find((d) => d.type === "projected")
                    ?.btcProjected || 0,
                  0,
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                BTC (Projected - This Month)
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                $
                {formatAmount(
                  visibleData.find((d) => d.type === "projected")
                    ?.adaProjected || 0,
                  0,
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Other Assets (Projected - This Month)
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                $
                {formatAmount(
                  visibleData.find((d) => d.type === "projected")
                    ?.totalProjected || 0,
                  0,
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Total USD (Projected - This Month)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
