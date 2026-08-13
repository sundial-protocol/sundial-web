"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Psbt } from "bitcoinjs-lib";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import type { BitcoinConnector } from "@reown/appkit-adapter-bitcoin";
import { toast } from "sonner";

import type { BridgeStatusSuccessResponse } from "@/app/api/bridge/types";
import { BtcSourceChip } from "@/components/btc/btc-amount";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useConfirmation } from "@/components/ui/confirmation";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import {
  bridgeStepIndex,
  bridgeStepInfo,
  trackedBridgeSteps,
} from "@/lib/bridge/steps";
import { BTC_UNIT, formatBtc, btcSources } from "@/lib/btc-sources";
import { finalizePsbtSafe } from "@/lib/psbt-finalize";
import { cn } from "@/lib/utils";

// The resumable stepper.
//
// Everything rendered here comes from the last status read, not from local
// state: the flow spans an hour and has to look the same after a refresh, on a
// second tab, or on another device. The only branch that carries local state is
// the signing action, which is a one-shot user interaction.

export default function BridgeProgress({
  status,
  onSubmitSigned,
  onReset,
  isSubmitting,
  error,
}: {
  status: BridgeStatusSuccessResponse;
  onSubmitSigned: (signedSourceTx: string) => Promise<boolean>;
  onReset: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const { confirm } = useConfirmation();
  const { isConnected } = useAppKitAccount({ namespace: "bip122" });
  const { walletProvider } = useAppKitProvider("bip122");
  const bitcoinConnector = walletProvider as BitcoinConnector | undefined;

  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeIndex = bridgeStepIndex(status.step);
  const info = bridgeStepInfo(status.step);
  const isFailed = status.step === "failed";
  const isApplied = status.step === "applied";
  const isAwaitingSignature = status.step === "awaiting_source_lock";

  // The mock orchestrator's PSBT is a stand-in and cannot be signed, so in mock
  // mode the wallet is never asked. The flag comes off the wire rather than
  // being inferred, so pointing BRIDGE_API_URL at a real service switches this
  // to the real signing path with no code change.
  const isMock = status.mock === true;

  const copyPsbt = async () => {
    if (!status.sourceUnsignedPsbt) return;
    try {
      await navigator.clipboard.writeText(status.sourceUnsignedPsbt);
      setCopied(true);
      toast.success("PSBT copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy PSBT:", e);
      toast.error("Could not copy the PSBT");
    }
  };

  // Real path: wallet signs, we finalize if it did not, extract raw hex, and
  // hand it to the service.
  //
  // Note what is deliberately absent — /api/btc-broadcast. The escrow staking
  // flow broadcasts from the browser; this one must not. The service has to see
  // the lock go out to start its finality watch, so broadcasting here would open
  // a window where the BTC is committed and nothing is watching for it.
  const signWithWallet = async () => {
    if (!status.sourceUnsignedPsbt) return;

    setIsSigning(true);
    setSignError(null);

    try {
      const response = await bitcoinConnector?.signPSBT({
        psbt: status.sourceUnsignedPsbt,
        signInputs: [],
      });

      if (!response?.psbt) {
        throw new Error("Your wallet returned no signed transaction.");
      }

      const signed = Psbt.fromBase64(response.psbt);

      const alreadyFinalized = signed.data.inputs.every(
        (input) =>
          (input.finalScriptSig && input.finalScriptSig.length > 0) ||
          (input.finalScriptWitness && input.finalScriptWitness.length > 0),
      );

      if (!alreadyFinalized && !finalizePsbtSafe(signed)) {
        throw new Error("Could not finalize the signed transaction.");
      }

      await onSubmitSigned(signed.extractTransaction().toHex());
    } catch (e) {
      console.error("Failed to sign the beam-send:", e);
      setSignError(
        e instanceof Error ? e.message : "The transaction could not be signed.",
      );
    } finally {
      setIsSigning(false);
    }
  };

  // Mock path: no wallet, no signature. Sends a syntactically valid hex blob so
  // the route's own validation still runs.
  const simulateSignature = async () => {
    setIsSigning(true);
    setSignError(null);
    try {
      await onSubmitSigned("00".repeat(64));
    } finally {
      setIsSigning(false);
    }
  };

  const handleReset = async () => {
    const isInFlight = !isApplied && !isFailed;
    if (isInFlight) {
      const confirmed = await confirm({
        title: "Abandon this bridge request?",
        message:
          "The request keeps running on the server. Starting over only clears it from this browser, and you will lose the link to its progress.",
        confirmText: "Abandon",
        variant: "destructive",
      });
      if (!confirmed) return;
    }
    onReset();
  };

  const busy = isSigning || isSubmitting;

  return (
    <div className="space-y-6">
      {/* Progress track */}
      <ol className="space-y-1">
        {trackedBridgeSteps.map((step, index) => {
          const isDone = !isFailed && index < activeIndex;
          const isActive = !isFailed && index === activeIndex;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-sm px-3 py-2 transition-colors",
                isActive && "bg-primary/10",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                  isDone && "border-primary/40 bg-primary/20 text-primary",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  !isDone &&
                    !isActive &&
                    "border-white/15 text-foreground/40",
                )}
              >
                {isDone ? (
                  <Check className="h-3 w-3" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  index + 1
                )}
              </span>

              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    !isDone && !isActive && "text-foreground/45",
                  )}
                >
                  {step.label}
                  {isActive &&
                  step.id === "confirming" &&
                  status.confirmations !== null
                    ? ` (${status.confirmations}/${status.requiredConfirmations})`
                    : ""}
                </p>
                {isActive ? (
                  <p className="mt-0.5 text-xs text-foreground/60">
                    {step.detail}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {isFailed ? (
        <Alert variant="destructive" className="border-destructive/30">
          <AlertDescription>
            <p className="font-medium">{info.label}</p>
            <p className="mt-1 text-sm">{status.failureReason ?? info.detail}</p>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Signing step */}
      {isAwaitingSignature ? (
        <div className="space-y-4 rounded-sm border border-white/10 bg-white/5 p-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-foreground/60">You lock</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                {formatBtc(status.quote.amount, btcSources["bitcoin-l1"].decimals)}{" "}
                {BTC_UNIT}
                <BtcSourceChip sourceId="bitcoin-l1" />
              </dd>
            </div>
            <div>
              <dt className="text-foreground/60">You receive</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                {formatBtc(
                  status.quote.receiveAmount,
                  btcSources["sundial-l2"].decimals,
                )}{" "}
                {BTC_UNIT}
                <BtcSourceChip sourceId="sundial-l2" />
              </dd>
            </div>
            <div>
              <dt className="text-foreground/60">Bitcoin miner fee</dt>
              <dd className="mt-1 font-semibold">
                {status.quote.minerFeeSats.toLocaleString()} sats
              </dd>
            </div>
            <div>
              <dt className="text-foreground/60">Scrolls signing fee</dt>
              <dd className="mt-1 font-semibold">
                {status.quote.scrollsFixedCost.toLocaleString()} L2 base units
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Beam-send (PSBT)</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyPsbt}
                disabled={!status.sourceUnsignedPsbt}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copy
              </Button>
            </div>
            <textarea
              className="w-full resize-none rounded-sm border border-white/10 bg-background/80 p-3 font-mono text-xs"
              rows={3}
              value={status.sourceUnsignedPsbt ?? ""}
              readOnly
            />
          </div>

          {signError ? (
            <Alert variant="destructive" className="border-destructive/30">
              <AlertDescription>{signError}</AlertDescription>
            </Alert>
          ) : null}

          {isMock ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-sm border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-foreground/80">
                  This PSBT is a stand-in and cannot be signed — no Bitcoin
                  transaction exists behind it. Continue to watch the rest of the
                  flow run.
                </p>
              </div>
              <Button type="button" onClick={simulateSignature} disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Continuing...
                  </>
                ) : (
                  "Simulate signature and continue"
                )}
              </Button>
            </div>
          ) : isConnected ? (
            <Button type="button" onClick={signWithWallet} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Waiting for your wallet...
                </>
              ) : (
                "Sign in wallet"
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-foreground/70">
                Connect a Bitcoin wallet to sign the lock.
              </p>
              <ConnectButton />
            </div>
          )}
        </div>
      ) : null}

      {/* Landed */}
      {isApplied ? (
        <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Bridged
          </p>
          <p className="mt-1 text-sm text-foreground/75">
            {formatBtc(
              status.quote.receiveAmount,
              btcSources["sundial-l2"].decimals,
            )}{" "}
            {BTC_UNIT} is now spendable on the Sundial L2.
          </p>
        </div>
      ) : null}

      {/* Identifiers */}
      <dl className="grid gap-3 text-sm">
        <div className="rounded-sm border border-white/10 bg-background/60 p-3">
          <dt className="text-foreground/60">Bridge request</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {status.bridgeRequestId}
          </dd>
        </div>
        {status.sourceTxid ? (
          <div className="rounded-sm border border-white/10 bg-background/60 p-3">
            <dt className="text-foreground/60">Bitcoin lock transaction</dt>
            <dd className="mt-1 break-all font-mono text-xs">
              {/* No explorer link while mocked: the txid is generated here and
                  would 404 on mempool.space. */}
              {isMock ? (
                status.sourceTxid
              ) : (
                <a
                  className="inline-flex items-center gap-1 hover:text-primary"
                  href={`https://mempool.space/tx/${status.sourceTxid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {status.sourceTxid}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )}
            </dd>
          </div>
        ) : null}
        {status.l2TxId ? (
          <div className="rounded-sm border border-white/10 bg-background/60 p-3">
            <dt className="text-foreground/60">L2 receive transaction</dt>
            <dd className="mt-1 break-all font-mono text-xs">{status.l2TxId}</dd>
          </div>
        ) : null}
      </dl>

      {error ? (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-foreground">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="button" variant="outline" onClick={handleReset}>
        <RotateCcw className="h-4 w-4" />
        {isApplied || isFailed ? "Bridge more BTC" : "Start over"}
      </Button>
    </div>
  );
}
