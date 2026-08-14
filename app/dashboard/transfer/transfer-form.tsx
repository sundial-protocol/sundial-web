"use client";

import { useState } from "react";
import {
  ArrowDownUp,
  ArrowLeftRight,
  ChevronDown,
  Loader2,
} from "lucide-react";

import type { TransferInitiateRequest } from "@/app/api/transfer/types";
import type { TransferEndpointsResult } from "@/hooks/dashboard/transfer-endpoints";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import { chainConfigs, type SupportedChain } from "@/lib/multichain";
import { formatUnits, shortenAddress } from "@/lib/transfer/format";
import { cn } from "@/lib/utils";
import EndpointCard from "./endpoint-card";
import type { TransferComposer } from "./use-transfer-composer";

// Composing a transfer: pick where from, where to, how much.
//
// The route the pair resolves to is described by the sibling RouteSummary card,
// not here — both read the same composer, so they cannot disagree about what is
// being described.

export default function TransferForm({
  endpoints: registry,
  composer,
  onSubmit,
  isSubmitting,
  error,
}: {
  endpoints: TransferEndpointsResult;
  composer: TransferComposer;
  onSubmit: (input: TransferInitiateRequest) => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const { l2Address, setL2Address } = registry;
  const {
    fromId,
    toId,
    setFromId,
    setToId,
    amount,
    setAmount,
    customChain,
    setCustomChain,
    customAddress,
    setCustomAddress,
    from,
    sourceEndpoints,
    destinationEndpoints,
    exceedsBalance,
    canSwap,
    isReady,
    swap,
    formError,
    setFormError,
    build,
  } = composer;

  // Collapsed by default once an address exists — it is set-once configuration,
  // not part of composing each transfer. Forced open while empty, because the
  // input is the only way to fill it and a collapsed empty section is the same
  // dead end as an unselectable picker.
  const [showL2Address, setShowL2Address] = useState(false);
  const isL2AddressOpen = showL2Address || !l2Address.trim();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const request = build();
    if (request) onSubmit(request);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          Send
        </CardTitle>
        <CardDescription>
          Move value between your wallets, the Sundial L2, or any address.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* From / To */}
          <div className="space-y-2">
            <EndpointCard
              role="from"
              endpoints={sourceEndpoints}
              selectedId={fromId}
              onSelect={setFromId}
              disabledIds={[toId]}
            />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={swap}
                disabled={!canSwap}
                title={
                  canSwap
                    ? "Swap source and destination"
                    : "The destination has no address to send from yet"
                }
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border bg-background transition-colors",
                  canSwap
                    ? "hover:border-primary hover:text-primary"
                    : "cursor-not-allowed opacity-40",
                )}
              >
                <ArrowDownUp className="h-4 w-4" />
                <span className="sr-only">Swap source and destination</span>
              </button>
            </div>

            <EndpointCard
              role="to"
              endpoints={destinationEndpoints}
              selectedId={toId}
              onSelect={setToId}
              disabledIds={[fromId]}
            />
          </div>

          {toId === "custom" ? (
            <div className="space-y-3 rounded-sm border bg-background/50 p-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-custom-network">
                  Destination network
                </Label>
                <select
                  id="transfer-custom-network"
                  value={customChain}
                  onChange={(event) =>
                    setCustomChain(event.target.value as SupportedChain)
                  }
                  className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm"
                >
                  {Object.values(chainConfigs)
                    .filter((config) => config.enabled)
                    .map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-custom-address">
                  Destination address
                </Label>
                <Input
                  id="transfer-custom-address"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={`${chainConfigs[customChain].addressPrefix}...`}
                  value={customAddress}
                  onChange={(event) => {
                    setCustomAddress(event.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Checked against the selected network before anything is built.
                  Nothing here verifies the recipient controls it.
                </p>
              </div>
            </div>
          ) : null}

          {/* The L2 has no wallet integration, so it is addressed by hand.
              Shown only when it is actually one of the two sides. */}
          {fromId === "l2" || toId === "l2" ? (
            <div className="space-y-2 rounded-sm border bg-background/50 p-4">
              <button
                type="button"
                onClick={() => setShowL2Address((open) => !open)}
                aria-expanded={isL2AddressOpen}
                aria-controls="transfer-l2-address-panel"
                className="flex w-full items-center gap-2 text-left"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isL2AddressOpen && "rotate-180",
                  )}
                />
                <span className="flex-1 text-sm font-medium">
                  Sundial L2 account
                </span>
                {/* Collapsed, the address is the only thing worth seeing — it is
                    what the user would open the section to check. */}
                {!isL2AddressOpen ? (
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {l2Address.trim()
                      ? shortenAddress(l2Address.trim())
                      : "Not set"}
                  </span>
                ) : null}
              </button>

              {isL2AddressOpen ? (
                <div id="transfer-l2-address-panel" className="space-y-2 pt-1">
                  <Label htmlFor="transfer-l2-address" className="sr-only">
                    Sundial L2 account
                  </Label>
                  <Input
                    id="transfer-l2-address"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="addr_test1..."
                    value={l2Address}
                    onChange={(event) => setL2Address(event.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    No wallet connects to the Sundial L2 yet, so its account is
                    entered by hand. Shared with the rest of the dashboard.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Amount */}
          <div className="space-y-2 rounded-sm border bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="transfer-amount">Amount</Label>
              {from?.balance ? (
                <button
                  type="button"
                  onClick={() => setAmount(String(from.balance))}
                  className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                >
                  Max
                </button>
              ) : null}
            </div>

            <div className="relative">
              <Input
                id="transfer-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  if (formError) setFormError(null);
                }}
                className={cn(
                  "h-14 pr-20 font-mono text-2xl",
                  exceedsBalance &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                {from?.symbol}
              </span>
            </div>

            <p
              className={cn(
                "text-xs",
                exceedsBalance ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {from?.balance !== null && from?.balance !== undefined
                ? `Available ${formatUnits(from.balance, from.decimals)} ${from.symbol}`
                : (from?.blockedReason ?? "Balance unavailable")}
            </p>
          </div>

          {formError || error ? (
            <Alert variant="destructive" className="border-destructive/30">
              <AlertDescription>{formError ?? error}</AlertDescription>
            </Alert>
          ) : null}

          {from && !from.isConnected && from.id === "btc" ? (
            <div className="space-y-2 rounded-sm border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">
                Connect a Bitcoin wallet to transfer from {from.label}.
              </p>
              <ConnectButton />
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={!isReady || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening transfer...
              </>
            ) : (
              "Review and sign"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
