"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import BtcAmount from "./btc-amount";
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
  // The disclosure stays owned here — callers get told when it opens so the
  // surrounding layout can respond, without having to drive it.
  onExpandedChange,
  className,
}: {
  holdings: readonly BtcHolding[];
  controls?: Partial<Record<BtcSourceId, ReactNode>>;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    onExpandedChange?.(next);
  };
  const total = sumBtcHoldings(holdings);

  const bySource = new Map(holdings.map((h) => [h.sourceId, h]));
  // Registry order, not the order holdings happened to be passed in.
  const rows = listBtcSources().filter((s) => bySource.has(s.id));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-0.5">
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
            than letting the number stand on its own. Kept to one clause: the
            venues it names are the ones with an empty figure just below. */}
        {!total.isComplete && (
          <span className="text-xs text-muted-foreground">
            Excludes {total.unknown.map((s) => s.venue).join(", ")}
          </span>
        )}
      </div>

      {/* A text-weight toggle, not a button-weight one. It is a disclosure on a
          figure that is already complete without it, so it should not compete
          with the controls inside the breakdown it opens. */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggle}
        aria-expanded={expanded}
        className="self-start h-auto px-1 py-0.5 -ml-1 text-xs font-normal text-muted-foreground hover:text-foreground [&_svg]:size-3"
      >
        <ChevronDown
          className={cn(
            "mr-0.5 transition-transform",
            expanded && "rotate-180",
          )}
        />
        Breakdown
      </Button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t pt-2">
          {rows.map((source) => {
            const holding = bySource.get(source.id)!;
            const control = controls?.[source.id];

            return (
              <div key={source.id} className="flex flex-col gap-1.5">
                {/* The chip names the layer, not a spelled-out venue line: it
                    fits beside the figure where "Bitcoin network" needs a row
                    of its own, and the full name stays in its tooltip. */}
                <BtcAmount
                  value={holding.amount}
                  sourceId={source.id}
                  isLoading={holding.isLoading}
                  valueClassName="text-sm"
                />
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
