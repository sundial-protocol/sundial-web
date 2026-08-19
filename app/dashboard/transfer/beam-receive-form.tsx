"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import type { BeamReceiveInput } from "@/app/api/transfer/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Real inputs for a Charms beam-receive.
//
// Building and proving the receive transaction is now real — see
// lib/transfer/charms-beam-receive.ts and lib/transfer/charms-prover.ts, which
// call the real Prover API (docs.charms.dev/reference/prover-api). What is not
// built is the placeholder UTxO and the source beam-send themselves: those
// still have to already exist, from charms-test's own beam-0{1,2,3} scripts or
// an equivalent. This form is where their outputs go in.
//
// The `mock` toggle verifies the pipeline for free: a mock-proved transaction
// still hits the real prover and the real Scrolls canister, but Scrolls
// re-verifies the actual proof and will refuse a mock one — for real, at the
// signing step, not simulated here.

const UTXO_ID_PATTERN = /^[0-9a-fA-F]{64}:\d+$/;

export default function BeamReceiveForm({
  onSubmit,
  isSubmitting,
  error,
}: {
  onSubmit: (input: BeamReceiveInput) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [placeholderUtxoId, setPlaceholderUtxoId] = useState("");
  const [collateralUtxoId, setCollateralUtxoId] = useState("");
  const [sourceUtxoId, setSourceUtxoId] = useState("");
  const [nonce, setNonce] = useState("");
  const [sourceTxHex, setSourceTxHex] = useState("");
  const [mock, setMock] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const fields: Array<{
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    mono?: boolean;
    rows?: number;
  }> = [
    {
      id: "placeholder-utxo",
      label: "Placeholder UTxO",
      value: placeholderUtxoId,
      onChange: setPlaceholderUtxoId,
      placeholder: "<64-char txid>:<vout>",
      mono: true,
    },
    {
      id: "collateral-utxo",
      label: "Collateral UTxO",
      value: collateralUtxoId,
      onChange: setCollateralUtxoId,
      placeholder: "<64-char txid>:<vout>",
      mono: true,
    },
    {
      id: "source-utxo",
      label: "Source (beam-send) UTxO",
      value: sourceUtxoId,
      onChange: setSourceUtxoId,
      placeholder: "<64-char txid>:<vout>",
      mono: true,
    },
    {
      id: "nonce",
      label: "Nonce",
      value: nonce,
      onChange: setNonce,
      placeholder: "13366537103519653124",
      mono: true,
    },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    for (const utxo of [placeholderUtxoId, collateralUtxoId, sourceUtxoId]) {
      if (!UTXO_ID_PATTERN.test(utxo.trim())) {
        setFormError(
          "Each UTxO must be a 64-character hex txid, a colon, and an index.",
        );
        return;
      }
    }

    // Validated as a digit string, never parsed to a JS number: a real
    // nonce is a u64 and routinely exceeds 2^53, where `Number()` silently
    // rounds it — confirmed against a real captured nonce during testing.
    const trimmedNonce = nonce.trim();
    if (!/^\d+$/.test(trimmedNonce)) {
      setFormError("Nonce must be a whole number (digits only).");
      return;
    }

    const hex = sourceTxHex.trim();
    if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
      setFormError("The source transaction must be raw hex.");
      return;
    }

    await onSubmit({
      placeholderUtxoId: placeholderUtxoId.trim(),
      collateralUtxoId: collateralUtxoId.trim(),
      sourceUtxoId: sourceUtxoId.trim(),
      nonce: trimmedNonce,
      sourceTxHex: hex,
      mock,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-start gap-2 rounded-sm border bg-background p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="text-muted-foreground">
          <p className="font-medium text-foreground">
            Builds and proves the receive for real
          </p>
          <p className="mt-1">
            These inputs come from an existing placeholder and beam-send —
            e.g. charms-test&apos;s{" "}
            <code className="font-mono text-xs">beam-02-split-cardano.sh</code>{" "}
            and{" "}
            <code className="font-mono text-xs">beam-03-send-btc.sh</code>.
            This form does not create them; it takes their outputs and calls
            the real Charms Prover API to build the receive transaction, then
            Scrolls-signs and submits it to the real L2.
          </p>
        </div>
      </div>

      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            autoComplete="off"
            spellCheck={false}
            placeholder={field.placeholder}
            value={field.value}
            onChange={(event) => {
              field.onChange(event.target.value);
              if (formError) setFormError(null);
            }}
            className={field.mono ? "font-mono text-sm" : undefined}
          />
        </div>
      ))}

      <div className="space-y-2">
        <Label htmlFor="source-tx-hex">Source transaction (raw hex)</Label>
        <textarea
          id="source-tx-hex"
          className="w-full resize-none rounded-sm border bg-background p-3 font-mono text-xs"
          rows={3}
          placeholder="020000000001…"
          value={sourceTxHex}
          onChange={(event) => {
            setSourceTxHex(event.target.value);
            if (formError) setFormError(null);
          }}
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground">
          Plain hex, no finality wrapper — the same form charms-test&apos;s own
          one validated demo run used. A real BTC finality proof
          (merkleblock + headers) is not assembled here.
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={mock}
          onChange={(event) => setMock(event.target.checked)}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium">Mock-prove (recommended first)</span>
          <span className="block text-xs text-muted-foreground">
            Real call to the real prover, at no cost — the result cannot be
            threshold-signed by Scrolls, so it will fail cleanly at the next
            step rather than being accepted anywhere. Uncheck only once you
            mean to spend real $PROVE (~$3) on real proving.
          </span>
        </span>
      </label>

      {formError || error ? (
        <Alert variant="destructive" className="border-destructive/30">
          <AlertDescription>{formError ?? error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {mock ? "Proving (mock)..." : "Proving for real..."}
          </>
        ) : mock ? (
          "Build, mock-prove, and continue"
        ) : (
          "Build, prove for real, and submit"
        )}
      </Button>
    </form>
  );
}
