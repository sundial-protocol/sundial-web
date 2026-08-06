"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import BtcAmount, { BtcSourceChip } from "./btc-amount";
import { Button } from "@/components/ui/button";
import {
  btcSources,
  formatBtc,
  formatBtcExact,
  listBtcSources,
  sumBtcHoldings,
  totalDecimals,
  BTC_UNIT,
  type BtcHolding,
  type BtcSourceId,
} from "@/lib/btc-sources";
import { cn } from "@/lib/utils";

// Unified BTC holdings, with the per-source split available on demand.
//
// The headline is one BTC number across every source, because that is what a
// user holds. The breakdown is a disclosure rather than the default layout:
// the layers matter when moving funds, not when reading a balance.
//
// Rendering is driven off the source registry, so a new bridged source appears
// here as soon as its holding is passed in — see lib/btc-sources.ts.

export default function BtcHoldings({
  holdings,
  // Per-source controls (connect button, address form, refresh), rendered
  // inside that source's breakdown row. Optional for any source.
  controls,
  defaultExpanded = false,
  className,
}: {
  holdings: readonly BtcHolding[];
  controls?: Partial<Record<BtcSourceId, ReactNode>>;
  defaultExpanded?: boolean;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const total = sumBtcHoldings(holdings);

  const bySource = new Map(holdings.map((h) => [h.sourceId, h]));
  // Registry order, not the order holdings happened to be passed in.
  const rows = listBtcSources().filter((s) => bySource.has(s.id));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        {/* Wraps rather than pushing the badge out: this card sits in a narrow
            sidebar column, so anything relying on horizontal room overflows. */}
        <div className="flex items-baseline gap-x-2 gap-y-1 flex-wrap">
          <span
            // Rounded for width; hover gives the sum at full precision.
            title={`${formatBtcExact(total.amount, totalDecimals())} ${BTC_UNIT}`}
            className="text-2xl font-semibold tabular-nums"
          >
            {formatBtc(total.amount, totalDecimals())}
          </span>
          <span className="text-sm text-muted-foreground">{BTC_UNIT}</span>
          {total.isLoading && (
            <span className="text-xs text-muted-foreground">updating…</span>
          )}
        </div>

        {/* An incomplete total understates the real holding, so say so rather
            than letting the number stand on its own. */}
        {!total.isComplete && (
          <span className="text-xs text-muted-foreground">
            Excludes {total.unknown.map((s) => s.venue).join(" and ")} —{" "}
            {total.unknown.length === 1 ? "balance" : "balances"} not available
            yet.
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="self-start px-2 text-xs"
      >
        <ChevronDown
          className={cn(
            "w-3 h-3 mr-1 transition-transform",
            expanded && "rotate-180",
          )}
        />
        {expanded ? "Hide breakdown" : "Show breakdown"}
      </Button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t pt-3">
          {rows.map((source) => {
            const holding = bySource.get(source.id)!;
            const control = controls?.[source.id];

            return (
              <div key={source.id} className="flex flex-col gap-2">
                {/* Venue above amount rather than beside it. Side-by-side
                    needs horizontal room this column does not have — it wraps
                    the venue name and shoves the figure off the card edge. */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                    <BtcSourceChip sourceId={source.id} />
                    <span className="truncate">{source.venue}</span>
                  </span>
                  <BtcAmount
                    value={holding.amount}
                    sourceId={source.id}
                    isLoading={holding.isLoading}
                    showChip={false}
                    valueClassName="text-sm"
                  />
                </div>
                {control}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Re-exported so callers building a holdings list have the registry to hand.
export { btcSources };
