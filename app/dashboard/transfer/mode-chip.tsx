"use client";

import { FlaskConical, Bitcoin, Radio, Server } from "lucide-react";

import type { TransferServiceMode } from "@/app/api/transfer/types";
import { cn } from "@/lib/utils";

// Which implementation is moving the money.
//
// Sits next to the tab heading so it is answerable while a transfer is being
// composed, not only once one exists. That distinction is the whole point:
// `TRANSFER_MODE=live` touches a real ledger and a real canister, and a user
// who assumes they are in the simulator has no other cue until the signing step
// tells them to bring their own transaction — by which point they have already
// decided to send.
//
// Colour follows consequence rather than severity: live is the one that spends
// real value, so it gets the loudest treatment even though nothing is wrong.

const PRESENTATION: Record<
  TransferServiceMode,
  { label: string; title: string; icon: typeof Radio; className: string }
> = {
  mock: {
    label: "Simulated",
    title:
      "Nothing is built, broadcast or submitted. The transfer runs on a timer.",
    icon: FlaskConical,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  demo: {
    label: "Demo",
    title:
      "Real wallet, real signed broadcast to Bitcoin testnet. Everything after that runs on the same timer as Simulated.",
    icon: Bitcoin,
    className:
      "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  live: {
    label: "Live",
    title:
      "Real Sundial L2 node and real Scrolls canister. Transactions submitted here reach a real ledger.",
    icon: Radio,
    className:
      "border-destructive/40 bg-destructive/10 text-destructive",
  },
  external: {
    label: "Connected service",
    title:
      "Answered by an external transfer service. What it does is that service's business, not this app's.",
    icon: Server,
    className: "border-primary/30 bg-primary/10 text-primary",
  },
};

export default function ModeChip({
  mode,
  className,
}: {
  // Null while unknown — the badge renders nothing rather than guessing, since
  // a wrong claim about whether funds are real is worse than no claim.
  mode: TransferServiceMode | null;
  className?: string;
}) {
  if (!mode) return null;

  const { label, title, icon: Icon, className: tone } = PRESENTATION[mode];

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
