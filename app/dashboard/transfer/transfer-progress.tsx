"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
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

import type {
  BeamReceiveInput,
  TransferStatusSuccessResponse,
} from "@/app/api/transfer/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConfirmation } from "@/components/ui/confirmation";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import { chainConfigs, isBitcoinChain } from "@/lib/multichain";
import { formatUnits, shortenAddress } from "@/lib/transfer/format";
import {
  resolveMechanismProfile,
  transferMechanism,
} from "@/lib/transfer/mechanisms";
import { resolveTransferRoute } from "@/lib/transfer/routes";
import { transferStepInfo } from "@/lib/transfer/steps";
import { finalizePsbtSafe } from "@/lib/psbt-finalize";
import { cn } from "@/lib/utils";
import BeamReceiveForm from "./beam-receive-form";

// Progress for an in-flight transfer.
//
// The track is built from the chosen *mechanism's* step list, so a direct L2
// send shows three steps and a Charms beam shows seven. A fixed seven-step
// track would show an L2 send sitting at "proving" forever — a step it never
// performs — and keying the track off the route instead would break the moment
// a second mechanism served the same movement with a different protocol.
//
// Everything rendered here comes from the last status read, not from local
// state: the flow can span an hour and has to look the same after a refresh, on
// a second tab, or on another device. The only branch carrying local state is
// the signing action, which is a one-shot user interaction.

export default function TransferProgress({
  status,
  onSubmitSigned,
  onSubmitBeamReceive,
  onReset,
  isSubmitting,
  error,
}: {
  status: TransferStatusSuccessResponse;
  onSubmitSigned: (signedSourceTx: string) => Promise<boolean>;
  onSubmitBeamReceive: (input: BeamReceiveInput) => Promise<boolean>;
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
  // Live mode has no transaction builder, so the user brings one. Held locally
  // because it is a one-shot input, not flow state worth persisting.
  const [pastedTx, setPastedTx] = useState("");

  const route = useMemo(
    () => resolveTransferRoute(status.fromChain, status.toChain),
    [status.fromChain, status.toChain],
  );

  const fromConfig = chainConfigs[status.fromChain];
  const toConfig = chainConfigs[status.toChain];

  // The step sequence belongs to the mechanism, not the movement: a Charms
  // peg-in runs seven steps, a direct send three or four, and a future peg-in
  // mechanism would run its own.
  const mechanism = status.quote.mechanism
    ? transferMechanism(status.quote.mechanism)
    : undefined;
  const profile =
    status.quote.mechanism && route.direction
      ? resolveMechanismProfile(
          status.quote.mechanism,
          route.direction,
          status.fromChain,
        )
      : null;

  // "failed" is in no step list — it can be reached from anywhere, so it has no
  // fixed position to draw. Handled as its own state below.
  const trackedSteps = profile?.steps ?? [];
  const activeIndex = trackedSteps.indexOf(status.step);
  const info = transferStepInfo(status.step);

  const isFailed = status.step === "failed";
  const isSettled = status.step === "settled";
  const isAwaitingSignature = status.step === "awaiting_signature";

  // Each mode needs a different signing affordance: mock simulates, live asks
  // for an externally-produced transaction, and an external service is assumed
  // to drive the wallet. Read off the wire rather than inferred, so adding a
  // mode cannot silently fall through to the wrong branch.
  const isMock = status.mode === "mock";
  const isLive = status.mode === "live";
  const isDemo = status.mode === "demo";
  const isBitcoinSource = isBitcoinChain(status.fromChain);

  const copyUnsignedTx = async () => {
    if (!status.sourceUnsignedTx) return;
    try {
      await navigator.clipboard.writeText(status.sourceUnsignedTx);
      setCopied(true);
      toast.success("Transaction copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy the unsigned transaction:", e);
      toast.error("Could not copy the transaction");
    }
  };

  // Real path: wallet signs, we finalize if it did not, extract raw hex, and
  // hand it to the service.
  //
  // Note what is deliberately absent — /api/btc-broadcast. The escrow staking
  // flow broadcasts from the browser; transfers must not. The service has to
  // see the transaction go out to start watching for it, so broadcasting here
  // would open a window where funds have moved and nothing is tracking them.
  const signWithWallet = async () => {
    if (!status.sourceUnsignedTx) return;

    setIsSigning(true);
    setSignError(null);

    try {
      const response = await bitcoinConnector?.signPSBT({
        psbt: status.sourceUnsignedTx,
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
      console.error("Failed to sign the transfer:", e);
      setSignError(
        e instanceof Error ? e.message : "The transaction could not be signed.",
      );
    } finally {
      setIsSigning(false);
    }
  };

  // Live path: the user supplies a transaction produced outside the app — the
  // `cborHex` from a `charms spell prove` envelope. From here the service does
  // the real work: Scrolls threshold signature where the mechanism needs one,
  // then POST /submit to the L2 node.
  const submitPastedTx = async () => {
    const hex = pastedTx.trim();
    setSignError(null);

    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
      setSignError("Paste the transaction as raw hex (the envelope's cborHex).");
      return;
    }

    setIsSigning(true);
    try {
      await onSubmitSigned(hex);
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
    if (!isSettled && !isFailed) {
      const confirmed = await confirm({
        title: "Abandon this transfer?",
        message:
          "The transfer keeps running on the server. Starting over only clears it from this browser, and you will lose the link to its progress.",
        confirmText: "Abandon",
        variant: "destructive",
      });
      if (!confirmed) return;
    }
    onReset();
  };

  const busy = isSigning || isSubmitting;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          {mechanism?.name ?? route.label}
        </CardTitle>
        <CardDescription>
          {isSettled
            ? "This transfer has settled"
            : isFailed
              ? "This transfer did not complete"
              : `In progress — ${profile?.etaLabel ?? route.label}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
      {/* Route header */}
      <div className="flex flex-wrap items-center gap-3 rounded-sm border bg-background/50 p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            From
          </p>
          <p className="text-sm font-semibold">{fromConfig.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {shortenAddress(status.fromAddress)}
          </p>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            To
          </p>
          <p className="text-sm font-semibold">{toConfig.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {shortenAddress(status.toAddress)}
          </p>
        </div>

        {/* No route badge here: the card title already carries it. */}
        <div className="ml-auto text-right">
          <p className="text-lg font-semibold tabular-nums">
            {formatUnits(status.quote.amount, fromConfig.decimals)}{" "}
            {fromConfig.symbol}
          </p>
          <p className="text-xs text-muted-foreground">Amount</p>
        </div>
      </div>

      {/* Step track */}
      <ol className="space-y-1">
        {trackedSteps.map((stepId, index) => {
          const stepInfo = transferStepInfo(stepId);
          const isDone = !isFailed && index < activeIndex;
          const isActive = !isFailed && index === activeIndex;

          return (
            <li
              key={stepId}
              className={cn(
                "flex items-start gap-3 rounded-sm px-3 py-2 transition-colors",
                isActive && "bg-primary/10",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                  isDone && "border-primary/40 bg-primary/20 text-primary",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground",
                  !isDone && !isActive && "border-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="h-3 w-3" />
                ) : isActive && !isSettled ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isActive && isSettled ? (
                  <Check className="h-3 w-3" />
                ) : (
                  index + 1
                )}
              </span>

              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    !isDone && !isActive && "text-muted-foreground",
                  )}
                >
                  {stepInfo.label}
                  {isActive &&
                  stepId === "confirming" &&
                  status.confirmations !== null
                    ? ` (${status.confirmations}/${status.quote.requiredConfirmations})`
                    : ""}
                </p>
                {isActive ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stepInfo.detail}
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
        <div className="space-y-4 rounded-sm border bg-background/50 p-4">
          {status.sourceUnsignedTx ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Unsigned transaction{isBitcoinSource ? " (PSBT)" : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyUnsignedTx}
                disabled={!status.sourceUnsignedTx}
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
              className="w-full resize-none rounded-sm border bg-background p-3 font-mono text-xs"
              rows={3}
              value={status.sourceUnsignedTx}
              readOnly
            />
          </div>
          ) : null}

          {signError ? (
            <Alert variant="destructive" className="border-destructive/30">
              <AlertDescription>{signError}</AlertDescription>
            </Alert>
          ) : null}

          {isMock ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-sm border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-muted-foreground">
                  This transaction is a stand-in and cannot be signed — nothing
                  exists behind it on any chain. Continue to watch the rest of
                  the flow run.
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
          ) : isLive && mechanism?.id === "charms" ? (
            <BeamReceiveForm
              onSubmit={onSubmitBeamReceive}
              isSubmitting={busy}
              error={signError}
            />
          ) : isLive ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-sm border bg-background p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Bring your own transaction
                  </p>
                  <p className="mt-1">
                    This mechanism has no transaction builder yet. Produce a
                    signed transaction externally and paste its raw hex here —
                    it is submitted to the real L2 node.
                  </p>
                </div>
              </div>

              <textarea
                className="w-full resize-none rounded-sm border bg-background p-3 font-mono text-xs"
                rows={4}
                placeholder="84a400818258200f3a…"
                value={pastedTx}
                onChange={(event) => {
                  setPastedTx(event.target.value);
                  if (signError) setSignError(null);
                }}
                spellCheck={false}
              />

              <Button
                type="button"
                onClick={submitPastedTx}
                disabled={busy || !pastedTx.trim()}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting to the L2...
                  </>
                ) : (
                  "Sign and submit to the L2"
                )}
              </Button>
            </div>
          ) : !isBitcoinSource ? (
            // Only the Bitcoin connector is wired for in-browser signing. Saying
            // so beats a button that throws.
            <Alert className="border-amber-500/30 bg-amber-500/10 text-foreground">
              <AlertDescription>
                Signing from {fromConfig.name} is not wired up in the browser
                yet. Copy the transaction above and sign it in your wallet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {isDemo ? (
                <div className="flex items-start gap-2 rounded-sm border border-sky-500/30 bg-sky-500/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <div className="text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Real broadcast, demo-only lock
                    </p>
                    <p className="mt-1">
                      Signing sends a real transaction on Bitcoin testnet that
                      locks this amount into a timelock script — reclaimable
                      by this same wallet once the lock expires. That timelock
                      is a stand-in chosen to look like something is
                      genuinely happening; it is not how a real beam-send
                      works. The real mechanism sends to a shared
                      always-succeeds script with no timelock at all, so the
                      beam-receive side can consume it without asking you to
                      sign again — see app/dashboard/transfer/README.md.
                    </p>
                  </div>
                </div>
              ) : null}
              {isConnected ? (
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
                  <p className="text-sm text-muted-foreground">
                    Connect a Bitcoin wallet to sign.
                  </p>
                  <ConnectButton />
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Settled */}
      {isSettled ? (
        <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Settled
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatUnits(status.quote.receiveAmount, toConfig.decimals)}{" "}
            {toConfig.symbol} is now spendable on {toConfig.name}.
          </p>
        </div>
      ) : null}

      {/* Identifiers */}
      <dl className="grid gap-3 text-sm">
        <div className="rounded-sm border bg-background/50 p-3">
          <dt className="text-muted-foreground">Transfer</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {status.transferId}
          </dd>
        </div>
        {status.sourceTxid ? (
          <div className="rounded-sm border bg-background/50 p-3">
            <dt className="text-muted-foreground">
              {fromConfig.name} transaction
            </dt>
            <dd className="mt-1 break-all font-mono text-xs">
              {/* No explorer link while mocked: the txid is generated by the
                  mock service and would 404. Nor for the L2, which has no
                  explorer at all — chainConfigs carries an empty base URL to
                  make that checkable rather than guessable. */}
              {isMock || !fromConfig.explorerBaseUrl ? (
                status.sourceTxid
              ) : (
                <a
                  className="inline-flex items-center gap-1 hover:text-primary"
                  href={`${fromConfig.explorerBaseUrl}${fromConfig.explorerTxSlug}${status.sourceTxid}`}
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
        {status.destinationTxId ? (
          <div className="rounded-sm border bg-background/50 p-3">
            <dt className="text-muted-foreground">{toConfig.name} transaction</dt>
            <dd className="mt-1 break-all font-mono text-xs">
              {status.destinationTxId}
            </dd>
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
        {isSettled || isFailed ? "New transfer" : "Start over"}
      </Button>
      </CardContent>
    </Card>
  );
}
