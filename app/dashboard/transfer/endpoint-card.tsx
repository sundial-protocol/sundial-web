"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, Wallet } from "lucide-react";

import type {
  TransferEndpoint,
  TransferEndpointId,
} from "@/hooks/dashboard/transfer-endpoints";
import { chainConfigs } from "@/lib/multichain";
import { formatUnits, shortenAddress } from "@/lib/transfer/format";
import { cn } from "@/lib/utils";

// One side of a transfer: which of the user's places value moves from, or to.
//
// The card is the control — clicking it opens the list inline rather than in a
// dialog. That keeps both sides and the amount on screen at once, which is what
// people check before committing: a modal that covers the destination while you
// pick the source is how you send to the wrong place.
//
// Endpoints that cannot currently be used stay listed and say why, rather than
// disappearing — a Cardano row that vanishes while disconnected makes the app
// look like it does not support Cardano at all.

export default function EndpointCard({
  role,
  endpoints,
  selectedId,
  onSelect,
  disabledIds = [],
}: {
  role: "from" | "to";
  endpoints: TransferEndpoint[];
  selectedId: TransferEndpointId;
  onSelect: (id: TransferEndpointId) => void;
  // Ids that cannot be picked here, with the other side's selection excluded so
  // a transfer cannot be composed from a place to itself.
  disabledIds?: TransferEndpointId[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = endpoints.find((e) => e.id === selectedId);

  // Why an option cannot be picked, or null when it can. Returned as a message
  // rather than a boolean because a greyed-out row with no explanation is the
  // most common way a picker becomes a dead end: the Sundial L2 row shows a
  // valid address and would otherwise look available while being unclickable.
  const unavailableReason = (endpoint: TransferEndpoint): string | null => {
    if (disabledIds.includes(endpoint.id)) {
      return `Already the ${role === "from" ? "destination" : "source"}.`;
    }
    // A wallet-backed endpoint with no address cannot be used and cannot be
    // fixed from here — it needs connecting first, so block it and say so.
    //
    // Manually-addressed endpoints are the opposite case: their address input
    // only renders once they are selected, so blocking them for having no
    // address yet would lock the user out of ever entering one. They stay
    // selectable and submit-time validation catches an empty address.
    if (!endpoint.address && !endpoint.isManuallyAddressed) {
      return endpoint.blockedReason ?? "Not connected.";
    }
    return null;
  };

  return (
    <div className="rounded-sm border bg-background/50">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background text-foreground">
          {selected ? chainConfigs[selected.chain].icon : <Wallet className="h-4 w-4" />}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {role === "from" ? "From" : "To"}
          </span>
          <span className="block truncate text-sm font-semibold">
            {selected?.label ?? "Select"}
          </span>
          <span className="block truncate font-mono text-xs text-muted-foreground">
            {selected?.address
              ? shortenAddress(selected.address)
              : (selected?.blockedReason ?? "—")}
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold tabular-nums">
            {selected?.isLoadingBalance ? (
              <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : selected?.balance !== null && selected?.balance !== undefined ? (
              formatUnits(selected.balance, selected.decimals)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </span>
          <span className="block text-xs text-muted-foreground">
            {selected?.symbol}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <ul className="border-t p-1.5">
          {endpoints.map((endpoint) => {
            const blocked = unavailableReason(endpoint);
            const selectable = blocked === null;
            const isActive = endpoint.id === selectedId;

            return (
              <li key={endpoint.id}>
                <button
                  type="button"
                  disabled={!selectable}
                  onClick={() => {
                    onSelect(endpoint.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors",
                    selectable
                      ? "hover:bg-muted"
                      : "cursor-not-allowed opacity-45",
                    isActive && "bg-primary/10",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-muted-foreground">
                    {chainConfigs[endpoint.chain].icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {endpoint.label}
                      {endpoint.walletName ? (
                        <span className="rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {endpoint.walletName}
                        </span>
                      ) : null}
                    </span>
                    {blocked ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {blocked}
                      </span>
                    ) : (
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {endpoint.address
                          ? shortenAddress(endpoint.address, 10)
                          : (endpoint.blockedReason ?? "Enter an address")}
                      </span>
                    )}
                  </span>

                  {endpoint.balance !== null ? (
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatUnits(endpoint.balance, endpoint.decimals)}{" "}
                      {endpoint.symbol}
                    </span>
                  ) : null}

                  {isActive ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
