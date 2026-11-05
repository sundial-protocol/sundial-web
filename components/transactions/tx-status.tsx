"use client";

import { Badge } from "@/components/ui/badge";
import type { LoggedTx } from "@/hooks/dashboard/dashboard";

type TxStatusInfo = {
  label: string;
  className: string;
};

// "pending" covers both unsigned and sent-but-unconfirmed; label them apart.
export function txStatusInfo(
  tx: Pick<LoggedTx, "status" | "txHash" | "blockHeight">,
): TxStatusInfo {
  if (tx.status === "failed") {
    return { label: "Failed", className: "bg-red-800/20 text-red-800" };
  }
  if (tx.status === "pending" && tx.txHash) {
    return {
      label: "Confirming",
      className: "bg-yellow-800/20 text-yellow-800 animate-pulse",
    };
  }
  if (tx.status === "pending") {
    return { label: "Unsigned", className: "bg-yellow-800/20 text-yellow-800" };
  }
  return {
    label: tx.blockHeight ? "Confirmed" : "Completed",
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
    <Badge variant="secondary" className={info.className}>
      {info.label}
    </Badge>
  );
}
