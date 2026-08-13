"use client";

import { useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import {
  REQUIRED_CONFIRMATIONS,
  SCROLLS_FIXED_COST,
} from "@/app/api/bridge/types";
import { BtcSourceChip } from "@/components/btc/btc-amount";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BTC_UNIT } from "@/lib/btc-sources";
import { cn } from "@/lib/utils";

// Opening a peg-in: how much BTC, and which L2 address receives it.
//
// The address is read from and written back to the same localStorage key the
// staking form and the balance card use, so an address entered anywhere in the
// dashboard works everywhere.

// Shared with app/dashboard/deposit/l2-staking-form.tsx.
const L2_ADDRESS_STORAGE_KEY = "sundial:l2-address";

// Mirrors the route's own floor. Duplicated deliberately: the server is the
// authority, this is only so the user finds out before a round trip.
const MIN_AMOUNT_BTC = 0.0001;

export default function BridgeForm({
  onInitiate,
  isSubmitting,
  error,
}: {
  onInitiate: (input: { amount: number; l2DestAddr: string }) => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [l2Address, setL2Address] = useLocalStorage(
    L2_ADDRESS_STORAGE_KEY,
    "",
  );
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  const parsed = Number(amount);

  const validateAmount = (): string | null => {
    if (amount.trim() === "") return "Enter an amount of BTC to bridge.";
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return "Enter a positive amount.";
    }
    if (parsed < MIN_AMOUNT_BTC) {
      return `The minimum bridge amount is ${MIN_AMOUNT_BTC} ${BTC_UNIT}.`;
    }
    return null;
  };

  const validateAddress = (value: string): string | null => {
    if (value.length === 0) return "Enter a Sundial L2 payment address.";
    if (!value.startsWith("addr")) {
      return "Address must be a bech32 payment address starting with addr.";
    }
    return null;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAddress = l2Address.trim();
    const nextAmountError = validateAmount();
    const nextAddressError = validateAddress(trimmedAddress);

    setL2Address(trimmedAddress);
    setAmountError(nextAmountError);
    setAddressError(nextAddressError);

    if (nextAmountError || nextAddressError) return;

    onInitiate({ amount: parsed, l2DestAddr: trimmedAddress });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="bridge-amount">Amount to bridge</Label>
        <div className="relative">
          <Input
            id="bridge-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.001"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              if (amountError) setAmountError(null);
            }}
            className={cn(
              "pr-24 font-mono text-sm",
              amountError && "border-destructive focus-visible:ring-destructive",
            )}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5 text-sm text-foreground/60">
            {BTC_UNIT}
            <BtcSourceChip sourceId="bitcoin-l1" />
          </div>
        </div>
        {amountError ? (
          <p className="text-sm text-destructive">{amountError}</p>
        ) : (
          <p className="text-xs text-foreground/60">
            Native BTC on the Bitcoin network. You will sign the lock in your
            wallet.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <div className="rounded-full border border-white/10 bg-white/5 p-2">
          <ArrowDown className="h-4 w-4 text-foreground/60" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bridge-l2-address">Destination address</Label>
        <div className="relative">
          <Input
            id="bridge-l2-address"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="addr_test1..."
            value={l2Address}
            onChange={(event) => {
              setL2Address(event.target.value);
              if (addressError) setAddressError(null);
            }}
            className={cn(
              "pr-12 font-mono text-sm",
              addressError &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <BtcSourceChip sourceId="sundial-l2" />
          </div>
        </div>
        {addressError ? (
          <p className="text-sm text-destructive">{addressError}</p>
        ) : (
          <p className="text-xs text-foreground/60">
            The Sundial L2 address that will hold your bridged {BTC_UNIT}.
          </p>
        )}
      </div>

      <dl className="grid gap-3 rounded-sm border border-white/10 bg-white/5 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-foreground/60">Rate</dt>
          <dd className="mt-1 font-semibold">
            1:1 — bridged {BTC_UNIT} is redeemable for native {BTC_UNIT}
          </dd>
        </div>
        <div>
          <dt className="text-foreground/60">Confirmations required</dt>
          <dd className="mt-1 font-semibold">
            {REQUIRED_CONFIRMATIONS} Bitcoin blocks
          </dd>
        </div>
        <div>
          <dt className="text-foreground/60">Bitcoin miner fee</dt>
          <dd className="mt-1 font-semibold">Quoted once the lock is built</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Scrolls signing fee</dt>
          <dd className="mt-1 font-semibold">
            {SCROLLS_FIXED_COST.toLocaleString()} L2 base units
          </dd>
        </div>
      </dl>

      {error ? (
        <Alert variant="destructive" className="border-destructive/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:min-w-56">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening bridge request...
          </>
        ) : (
          "Start bridge"
        )}
      </Button>

      <p className="text-xs text-foreground/55">
        The full transfer takes roughly an hour — most of it waiting for Bitcoin
        confirmations. You can close this tab; the progress is keyed to a request
        id stored in this browser.
      </p>
    </form>
  );
}
