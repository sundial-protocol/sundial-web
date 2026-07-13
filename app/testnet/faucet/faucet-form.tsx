"use client";

import { useState } from "react";
import { Check, Copy, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import type {
  FaucetClaimCode,
  FaucetClaimResponse,
  FaucetClaimSuccessResponse,
} from "@/app/api/testnet/faucet/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const unavailableCodes: FaucetClaimCode[] = [
  "NODE_UNAVAILABLE",
  "NOT_CONFIGURED",
  "DISABLED",
  "INTERNAL",
];

const invalidAddressCodes: FaucetClaimCode[] = [
  "ADDRESS_INVALID",
  "ADDRESS_NETWORK_MISMATCH",
  "ADDRESS_NO_PAYMENT_CREDENTIAL",
  "ADDRESS_SCRIPT",
  "VALIDATION_FAILED",
];

const generateIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `faucet-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const formatTimestamp = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatAmount = (value: string) => {
  const lovelace = Number(value);
  if (!Number.isFinite(lovelace)) {
    return value;
  }

  return `${(lovelace / 1_000_000).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} sBTC`;
};

const getErrorSummary = (code: FaucetClaimCode) => {
  switch (code) {
    case "COOLDOWN":
      return "This address has already claimed recently.";
    case "IP_LIMIT":
      return "This browser has reached the current faucet claim limit.";
    case "DEPLETED":
      return "The faucet is temporarily out of funds.";
    case "ADDRESS_INVALID":
    case "ADDRESS_NETWORK_MISMATCH":
    case "ADDRESS_NO_PAYMENT_CREDENTIAL":
    case "ADDRESS_SCRIPT":
    case "VALIDATION_FAILED":
      return "Enter a valid Sundial testnet payment address.";
    default:
      return "The faucet is currently unavailable.";
  }
};

const getErrorDetail = (code: FaucetClaimCode, error?: string) => {
  if (invalidAddressCodes.includes(code)) {
    return "Paste a valid Sundial testnet payment address that starts with addr_test1.";
  }

  return error || getErrorSummary(code);
};

const isSuccessResult = (
  result: FaucetClaimResponse | null,
): result is FaucetClaimSuccessResponse => {
  return Boolean(result && "success" in result && result.success);
};

export function FaucetForm() {
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<FaucetClaimResponse | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [copiedTxHash, setCopiedTxHash] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey);

  const helperText =
    "Paste a Sundial testnet payment address (addr_test1...).";

  const resetResult = () => {
    setResult(null);
    setAddressError(null);
    setCopiedTxHash(false);
    setIdempotencyKey(generateIdempotencyKey());
  };

  const validateAddress = (value: string) => {
    if (value.length === 0) {
      return "Enter a Sundial testnet payment address.";
    }

    if (!value.startsWith("addr_test1")) {
      return "Address must start with addr_test1.";
    }

    return null;
  };

  const handleCopyTxHash = async (txHash: string) => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopiedTxHash(true);
      toast.success("Transaction hash copied");
      window.setTimeout(() => setCopiedTxHash(false), 2000);
    } catch (error) {
      console.error("Failed to copy tx hash", error);
      toast.error("Could not copy the transaction hash");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAddress = address.trim();
    const validationError = validateAddress(trimmedAddress);
    setAddress(trimmedAddress);
    setAddressError(validationError);

    if (validationError) {
      setResult(null);
      return;
    }

    setIsSubmitting(true);
    setCopiedTxHash(false);

    try {
      const response = await fetch("/api/testnet/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: trimmedAddress,
          idempotencyKey,
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as FaucetClaimResponse | null;

      if (!payload) {
        throw new Error("Faucet proxy returned a non-JSON response.");
      }

      setResult(payload);

      if (!isSuccessResult(payload) && invalidAddressCodes.includes(payload.code)) {
        setAddressError(getErrorSummary(payload.code));
      } else {
        setAddressError(null);
      }
    } catch (error) {
      console.error("Faucet request failed", error);
      setResult({
        error: "The faucet is currently unreachable. Please try again shortly.",
        code: "NODE_UNAVAILABLE",
      });
      setAddressError(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Request testnet sBTC
          </h2>
          <p className="text-sm text-foreground/70">
            Paste a Sundial testnet payment address to request sBTC.
          </p>
        </div>

        <div className="rounded-sm border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/75">
          The faucet grant amount is fixed and confirmed after a successful claim.
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="faucet-address">Sundial testnet address</Label>
          <Input
            id="faucet-address"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            placeholder="addr_test1..."
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              if (addressError) {
                setAddressError(null);
              }
            }}
            className={cn(
              "font-mono text-sm",
              addressError && "border-destructive focus-visible:ring-destructive",
            )}
          />
          <p className="text-xs text-foreground/60">{helperText}</p>
          {addressError ? (
            <p className="text-sm text-destructive">{addressError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isSubmitting} className="sm:min-w-48">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              "Request testnet sBTC"
            )}
          </Button>

          {result ? (
            <Button type="button" variant="outline" onClick={resetResult}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          ) : null}
        </div>
      </form>

      {isSuccessResult(result) ? (
        <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Claim submitted
              </p>
              <p className="text-sm text-foreground/75">
                Your faucet request was accepted by the Sundial faucet.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-emerald-500/30 bg-transparent"
              onClick={() => handleCopyTxHash(result.txHash)}
            >
              {copiedTxHash ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy tx hash
                </>
              )}
            </Button>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-sm border border-white/10 bg-background/80 p-3">
              <dt className="text-foreground/60">Grant amount</dt>
              <dd className="mt-1 font-semibold">{formatAmount(result.amount)}</dd>
            </div>
            <div className="rounded-sm border border-white/10 bg-background/80 p-3">
              <dt className="text-foreground/60">Next eligible at</dt>
              <dd className="mt-1 font-semibold">
                {formatTimestamp(result.nextEligibleAt)}
              </dd>
            </div>
            <div className="rounded-sm border border-white/10 bg-background/80 p-3 sm:col-span-2">
              <dt className="text-foreground/60">Claim ID</dt>
              <dd className="mt-1 break-all font-mono text-xs sm:text-sm">
                {result.claimId}
              </dd>
            </div>
            <div className="rounded-sm border border-white/10 bg-background/80 p-3 sm:col-span-2">
              <dt className="text-foreground/60">Transaction hash</dt>
              <dd className="mt-1 break-all font-mono text-xs sm:text-sm">
                {result.txHash}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {result && !isSuccessResult(result) ? (
        <Alert
          variant={invalidAddressCodes.includes(result.code) ? "destructive" : "default"}
          className={cn(
            "border-white/10 bg-background/80",
            unavailableCodes.includes(result.code) &&
              "border-amber-500/30 bg-amber-500/10 text-foreground",
            result.code === "DEPLETED" &&
              "border-orange-500/30 bg-orange-500/10 text-foreground",
            result.code === "COOLDOWN" &&
              "border-primary/25 bg-primary/10 text-foreground",
          )}
        >
          <AlertDescription className="space-y-3">
            <div>
              <p className="font-medium">{getErrorSummary(result.code)}</p>
              <p className="mt-1 text-sm text-foreground/75">
                {getErrorDetail(result.code, result.error)}
              </p>
            </div>

            {result.code === "COOLDOWN" && result.nextEligibleAt ? (
              <div className="rounded-sm border border-white/10 bg-background/70 px-3 py-2 text-sm">
                Next eligible at: {formatTimestamp(result.nextEligibleAt)}
              </div>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
