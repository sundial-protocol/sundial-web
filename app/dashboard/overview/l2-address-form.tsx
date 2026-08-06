"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Controls for the Sundial L2 row: which address to watch, and a manual
// refresh. Presentational — the address and the balance behind it are owned by
// the holdings container, since the balance feeds the unified total.
//
// The address is typed rather than taken from a connected wallet: the Cardano
// wallet button is still disabled on this dashboard, and the testnet faucet
// already asks people to paste an address, so this matches how they get funds
// in the first place.

export default function L2AddressForm({
  address,
  onAddressChange,
  onRefresh,
  isLoading,
  error,
  utxoCount,
}: {
  address: string;
  onAddressChange: (address: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
  utxoCount: number | null;
}) {
  const [draft, setDraft] = useState(address);

  const trimmedDraft = draft.trim();
  const isDirty = trimmedDraft !== address;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onAddressChange(trimmedDraft);
  };

  return (
    <div className="flex flex-col gap-2 pl-1">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Label htmlFor="l2-address" className="text-xs text-muted-foreground">
          L2 address
        </Label>
        <Input
          id="l2-address"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="addr_test1..."
          spellCheck={false}
          autoComplete="off"
          className="text-xs"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!trimmedDraft || (!isDirty && !!address)}
        >
          {address && !isDirty ? "Tracking" : "Track balance"}
        </Button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {address && !error && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {utxoCount === null
              ? ""
              : `${utxoCount} UTxO${utxoCount === 1 ? "" : "s"}`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-2 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
