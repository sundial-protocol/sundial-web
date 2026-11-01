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
  const hasStaked = transactions.some(
    (tx) => tx.type === "deposit" && tx.status !== "failed",
  );

  let icon: React.ReactNode;
  let title: string;
  let body: string;
  let action: React.ReactNode;

  if (waiting.length > 0) {
    icon = <Clock className="h-5 w-5 text-yellow-600" />;
    title =
      waiting.length === 1
        ? "Your transaction is waiting for confirmation"
        : `${waiting.length} transactions are waiting for confirmation`;
    body =
      "It has been sent to the Bitcoin network. The first confirmation usually takes about 10 minutes, and you can leave this page in the meantime.";
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
    title = "Step 1: Connect a Bitcoin wallet";
    body =
      "Connect the wallet you want to stake from. Your BTC stays in your wallet until you sign a stake.";
    action = <ConnectButton size="sm" />;
  } else if (!hasStaked) {
    icon = <ArrowRight className="h-5 w-5 text-primary" />;
    title = "Step 2: Stake some BTC";
    body =
      "Your wallet is connected. Choose an amount on the Stake tab, review it, and sign in your wallet.";
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
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
