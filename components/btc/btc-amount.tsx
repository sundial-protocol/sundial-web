import {
  btcSources,
  formatBtc,
  formatBtcExact,
  BTC_UNIT,
  type BtcSourceId,
} from "@/lib/btc-sources";
import { cn } from "@/lib/utils";

// Primitives for rendering BTC figures.
//
// Every source denominates in BTC — bridged BTC is the same asset — so the chip
// is what carries the distinction. It is built into `BtcAmount` rather than
// something callers add, so a per-source figure cannot be rendered without
// saying which source it came from.

export function BtcSourceChip({
  sourceId,
  className,
}: {
  sourceId: BtcSourceId;
  className?: string;
}) {
  const source = btcSources[sourceId];

  return (
    <span
      title={source.description}
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide",
        source.kind === "native"
          ? "border-yellow-500/40 text-yellow-600 dark:text-yellow-500"
          : "border-amber-500/40 text-amber-600 dark:text-amber-500",
        className,
      )}
    >
      {source.badge}
    </span>
  );
}

export default function BtcAmount({
  value,
  sourceId,
  isLoading = false,
  showChip = true,
  className,
  valueClassName,
}: {
  // Whole BTC. Null renders a placeholder rather than a misleading zero.
  value: number | null;
  sourceId: BtcSourceId;
  isLoading?: boolean;
  showChip?: boolean;
  className?: string;
  valueClassName?: string;
}) {
  const source = btcSources[sourceId];

  return (
    <span
      className={cn(
        // Wraps as a whole; the figure itself never breaks mid-digits.
        "inline-flex items-baseline gap-x-2 gap-y-0.5 flex-wrap",
        className,
      )}
    >
      {showChip && <BtcSourceChip sourceId={sourceId} />}
      <span
        // The shown figure is rounded for width; the exact one stays on hover.
        title={
          value === null
            ? undefined
            : `${formatBtcExact(value, source.decimals)} ${BTC_UNIT}`
        }
        className={cn(
          "font-semibold tabular-nums whitespace-nowrap",
          valueClassName,
        )}
      >
        {value === null ? "—" : formatBtc(value, source.decimals)}
      </span>
      <span className="text-sm text-muted-foreground">{BTC_UNIT}</span>
      {isLoading && (
        <span className="text-xs text-muted-foreground">updating…</span>
      )}
    </span>
  );
}
