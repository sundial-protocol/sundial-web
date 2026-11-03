"use client";

import { useRouter } from "next/navigation";
import { useAppKitAccount } from "@reown/appkit/react";
import { ArrowRight, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import { useDashboardContext } from "@/lib/contexts/dashboard-context";

// One line at the top of the portfolio saying what to do next. Testers said
// that after connecting a wallet they weren't sure what came next, so this
// names the single next action for where the user is:
//   no wallet        -> connect one
//   nothing staked   -> stake
//   a stake in flight -> it's waiting for a block, here's where to watch it
// and disappears once none of those apply.
export default function NextStep() {
  const router = useRouter();
  const { isConnected } = useAppKitAccount({ namespace: "bip122" });
  const { transactions } = useDashboardContext();

  const waiting = transactions.filter(
    (tx) => tx.status === "pending" && tx.txHash,
  );
  // A deposit counts once it has been sent. One that was only prepared (an
  // unsigned PSBT copied out) still leaves the user at the stake step.
  const hasStaked = transactions.some(
    (tx) =>
      tx.type === "deposit" &&
      tx.status !== "failed" &&
      (tx.txHash || tx.status === "completed"),
  );

  let icon: React.ReactNode;
  let title: string;
  let body: string | null;
  let action: React.ReactNode;

  if (waiting.length > 0) {
    icon = <Clock className="h-5 w-5 text-yellow-600" />;
    title =
      waiting.length === 1
        ? "Waiting for confirmation"
        : `${waiting.length} transactions waiting for confirmation`;
    body = "Usually ~10 min.";
    action = (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/dashboard?tab=history")}
      >
        View status
      </Button>
    );
  } else if (!isConnected) {
    icon = <Wallet className="h-5 w-5 text-primary" />;
    title = "Connect a Bitcoin wallet";
    body = null;
    action = <ConnectButton size="sm" />;
  } else if (!hasStaked) {
    icon = <ArrowRight className="h-5 w-5 text-primary" />;
    title = "Stake some BTC";
    body = null;
    action = (
      <Button size="sm" onClick={() => router.push("/dashboard?tab=stake")}>
        Go to Stake
      </Button>
    );
  } else {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div>
          <div className="font-medium">{title}</div>
          {body && <p className="text-sm text-muted-foreground">{body}</p>}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
