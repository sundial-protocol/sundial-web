"use client";

import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";
import type { LoggedTx } from "@/hooks/dashboard/dashboard";

type TxStatusInfo = {
  label: string;
  explanation: string;
  className: string;
};

// The status a user should see for a transaction. "pending" covers two
// different situations that testers couldn't tell apart: not yet signed, and
// signed and sent but not yet in a block. They get different labels here.
export function txStatusInfo(
  tx: Pick<LoggedTx, "status" | "txHash" | "blockHeight">,
): TxStatusInfo {
  if (tx.status === "failed") {
    return {
      label: "Failed",
      explanation:
        "This transaction did not go through from here. If you broadcast a signed PSBT yourself, check your wallet before trying again.",
      className: "bg-red-800/20 text-red-800",
    };
  }
  if (tx.status === "pending" && tx.txHash) {
    return {
      label: "Confirming",
      explanation:
        "Sent to the Bitcoin network and waiting to be included in a block. The first confirmation usually takes about 10 minutes. This updates on its own.",
      className: "bg-yellow-800/20 text-yellow-800 animate-pulse",
    };
  }
  if (tx.status === "pending") {
    return {
      label: "Awaiting signature",
      explanation:
        "Not sent yet. It is sent once you sign it in your wallet, or broadcast the signed PSBT yourself.",
      className: "bg-yellow-800/20 text-yellow-800",
    };
  }
  if (tx.blockHeight) {
    return {
      label: "Confirmed",
      explanation: `Included in Bitcoin block ${tx.blockHeight}.`,
      className: "bg-green-800/20 text-green-800",
    };
  }
  return {
    label: "Completed",
    explanation: tx.txHash
      ? "Sent and recorded."
      : "Recorded on the Sundial L2, which has no block explorer yet.",
    className: "bg-green-800/20 text-green-800",
  };
}

export function TxStatusBadge({
  tx,
}: {
  tx: Pick<LoggedTx, "status" | "txHash" | "blockHeight">;
}) {
  const info = txStatusInfo(tx);
  return (
    <span className="inline-flex items-center gap-1">
      <Badge variant="secondary" className={info.className}>
        {info.label}
      </Badge>
      <InfoTip label={`What "${info.label}" means`}>{info.explanation}</InfoTip>
    </span>
  );
}
