"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { useTransfer } from "@/hooks/dashboard/transfer";
import { useTransferEndpoints } from "@/hooks/dashboard/transfer-endpoints";
import { useL2Balance } from "@/hooks/dashboard/l2-balance";
import { resolveMechanismProfile } from "@/lib/transfer/mechanisms";
import { resolveTransferRoute } from "@/lib/transfer/routes";
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

  // Shown unless a response positively identifies a real service. Erring toward
  // the warning is the right bias: the cost of an unnecessary notice is mild
  // confusion, and the cost of a missing one is somebody believing they moved
  // real funds.
  const isMock = transfer.status ? transfer.status.mock === true : true;

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
        <h2 className="mb-2 text-3xl font-bold">Transfer</h2>
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
        ) : transfer.status ? (
          <TransferProgress
            status={transfer.status}
            onSubmitSigned={transfer.submitSigned}
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
