"use client";

import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TxStatusBadge } from "@/components/transactions/tx-status";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";
import { chainConfigs, type SupportedChain } from "@/lib/multichain";

const SHOWN = 5;

const timeAgo = (date: Date) => {
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(date).toLocaleDateString();
};

// The last few transactions, on the portfolio itself. Testers asked for recent
// activity on the dashboard rather than only behind the History tab.
//
// History is held in the page's memory, so it covers this visit only; the note
// under the title says so rather than implying a full account history.
export default function RecentActivity() {
  const router = useRouter();
  const { transactions } = useDashboardContext();

  const recent = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, SHOWN);

  return (
    <Card className="col-span-5">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest stakes and withdrawals from this visit
          </CardDescription>
        </div>
        {transactions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard?tab=history")}
          >
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing yet. Stakes and withdrawals you make will show up here.
          </p>
        ) : (
          <ul className="divide-y">
            {recent.map((tx) => {
              const config = chainConfigs[tx.asset as SupportedChain];
              const explorer =
                tx.txHash && config?.explorerBaseUrl
                  ? `${config.explorerBaseUrl}${config.explorerTxSlug}${tx.txHash}`
                  : null;
              const outgoing = tx.type === "withdraw" || tx.type === "unstake";
              return (
                <li
                  key={tx.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div className="flex items-center gap-3">
                    {outgoing ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {tx.type}{" "}
                        <span className="font-mono normal-case">
                          {tx.amount} {config?.symbol ?? tx.asset.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {config?.name ?? tx.asset} · {timeAgo(tx.timestamp)}
                        {explorer && (
                          <a
                            href={explorer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                          >
                            View on explorer
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <TxStatusBadge tx={tx} />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
