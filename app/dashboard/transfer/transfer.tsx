"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransfer } from "@/hooks/dashboard/transfer";
import { useTransferEndpoints } from "@/hooks/dashboard/transfer-endpoints";
import { useL2Balance } from "@/hooks/dashboard/l2-balance";
import { resolveMechanismProfile } from "@/lib/transfer/mechanisms";
import { resolveTransferRoute } from "@/lib/transfer/routes";
import ModeChip from "./mode-chip";
import RouteSummary from "./route-summary";
import TransferForm from "./transfer-form";
import TransferProgress from "./transfer-progress";
import { useTransferComposer } from "./use-transfer-composer";

// Moving value between the places a user holds it.
//
// One surface for every route: an ordinary on-chain send, a send within the
// Sundial L2, and the cross-layer charms beam specced in
// charms-test/docs/beam-to-l2-frontend-spec.md. Which one a given transfer is
// falls out of the endpoints picked, not out of a mode the user selects.
//
// Laid out as the two-column form-plus-summary the Stake tab uses, so the tab
// reads as part of the dashboard rather than its own thing. The compose state
// lives here for the same reason it lives in deposit.tsx: both columns need it.
//
// The orchestration behind it is currently mocked end to end — see README.md in
// this folder for which real service replaces which piece.

export default function TransferTab() {
  const transfer = useTransfer();
  const endpoints = useTransferEndpoints();
  const composer = useTransferComposer(endpoints);
  const { refresh: refreshL2Balance } = useL2Balance(endpoints.l2Address);

  const step = transfer.status?.step;

  // The balance the user came here to change has just changed. Waiting on the
  // balance hook's own cycle would leave the success message sitting above a
  // stale number.
  useEffect(() => {
    if (step === "settled") refreshL2Balance();
  }, [step, refreshL2Balance]);

  // An in-flight transfer reports the mode that actually served it; before one
  // exists, fall back to what the routes say they will use. The first is the
  // more truthful of the two — a transfer created under one mode keeps its
  // badge even if the deployment is reconfigured underneath it.
  const activeMode = transfer.status?.mode ?? transfer.serviceMode;

  // While a transfer is in flight the summary describes *it*, not whatever is
  // still sitting in the compose form behind it.
  const activeRoute = transfer.status
    ? resolveTransferRoute(transfer.status.fromChain, transfer.status.toChain)
    : composer.route;

  const activeFee = transfer.status
    ? {
        fee: transfer.status.quote.networkFee,
        unit: transfer.status.quote.networkFeeUnit,
      }
    : composer.estimatedFee;

  // Once a transfer exists its route is settled, so the picker goes read-only
  // rather than offering a change that would apply to nothing.
  const activeMechanismId =
    transfer.status?.quote.mechanism ?? composer.mechanismId;

  // Rebuilt from the in-flight transfer's own mechanism rather than the compose
  // form's, so the summary describes what is running.
  const activeProfile =
    transfer.status && activeMechanismId && activeRoute.direction
      ? resolveMechanismProfile(
          activeMechanismId,
          activeRoute.direction,
          transfer.status.fromChain,
        )
      : composer.profile;

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold">Transfer</h2>
          <ModeChip mode={activeMode} />
        </div>
        <p className="text-muted-foreground">
          Move assets between your accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {transfer.isRestoring ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking for an in-flight transfer...
          </div>
        ) : transfer.isUnreadable ? (
          // A stored transfer whose status will not read. Shown rather than
          // silently falling through to the compose form: a fresh form implies
          // nothing is running, while a retry loop is in fact still polling an
          // id the user has no other way to see or clear.
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Transfer unavailable
              </CardTitle>
              <CardDescription>
                A transfer is stored in this browser but its status cannot be
                read
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{transfer.error}</p>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {transfer.transferId}
              </p>
              <Button type="button" variant="outline" onClick={transfer.reset}>
                <RotateCcw className="h-4 w-4" />
                Start over
              </Button>
            </CardContent>
          </Card>
        ) : transfer.status ? (
          <TransferProgress
            status={transfer.status}
            onSubmitSigned={transfer.submitSigned}
            onSubmitBeamReceive={transfer.submitBeamReceive}
            onReset={transfer.reset}
            isSubmitting={transfer.isSubmitting}
            error={transfer.error}
          />
        ) : (
          <TransferForm
            endpoints={endpoints}
            composer={composer}
            onSubmit={transfer.initiate}
            isSubmitting={transfer.isSubmitting}
            error={transfer.error}
          />
        )}

        <div className="grid grid-cols-1 gap-6 content-start">
          <RouteSummary
            route={activeRoute}
            networkFee={activeFee.fee}
            networkFeeUnit={activeFee.unit}
            profile={activeProfile}
            mechanismId={activeMechanismId}
            mechanismOptions={composer.mechanismOptions}
            onMechanismChange={
              transfer.status ? undefined : composer.setMechanismId
            }
          />
        </div>
      </div>
    </div>
  );
}
