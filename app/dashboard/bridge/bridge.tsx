"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import { useBridgeRequest } from "@/hooks/dashboard/bridge";
import { useL2Balance } from "@/hooks/dashboard/l2-balance";
import BridgeForm from "./bridge-form";
import BridgeProgress from "./bridge-progress";

// Peg-in: native BTC on Bitcoin → bridged BTC on the Sundial L2.
//
// Implements the frontend half of charms-test/docs/beam-to-l2-frontend-spec.md.
// The orchestration behind it is currently mocked end to end — see README.md in
// this folder for which real service replaces which piece.

// Same key the staking form and the balance card use.
const L2_ADDRESS_STORAGE_KEY = "sundial:l2-address";

export default function BridgeTab() {
  const bridge = useBridgeRequest();
  const [l2Address] = useLocalStorage(L2_ADDRESS_STORAGE_KEY, "");
  const { refresh: refreshL2Balance } = useL2Balance(l2Address);

  const step = bridge.status?.step;

  // The balance the user came here to change has just changed. Waiting on the
  // balance hook's own cycle would leave the success message sitting above a
  // stale number.
  useEffect(() => {
    if (step === "applied") refreshL2Balance();
  }, [step, refreshL2Balance]);

  // Shown unless a response positively identifies a real service. Erring toward
  // the warning is the right bias: the cost of an unnecessary notice is mild
  // confusion, and the cost of a missing one is somebody believing they moved
  // real BTC.
  const isMock = bridge.status ? bridge.status.mock === true : true;

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold">Bridge BTC</h2>
        <p className="text-muted-foreground">
          Move native BTC onto the Sundial L2 as bridged BTC, redeemable 1:1.
        </p>
      </div>

      {isMock ? (
        <div className="mb-6 flex items-start gap-3 rounded-sm border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="text-sm text-foreground/80">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              Simulated end to end
            </p>
            <p className="mt-1">
              No Bitcoin transaction is built or broadcast, no proof is
              generated, and nothing is submitted to the L2. The step machine
              runs on a timer so the flow can be reviewed before the bridging
              service exists.
            </p>
          </div>
        </div>
      ) : null}

      <div className="max-w-2xl rounded-sm border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {bridge.isRestoring ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking for an in-flight bridge request...
          </div>
        ) : bridge.status ? (
          <BridgeProgress
            status={bridge.status}
            onSubmitSigned={bridge.submitSigned}
            onReset={bridge.reset}
            isSubmitting={bridge.isSubmitting}
            error={bridge.error}
          />
        ) : (
          <BridgeForm
            onInitiate={bridge.initiate}
            isSubmitting={bridge.isSubmitting}
            error={bridge.error}
          />
        )}
      </div>
    </div>
  );
}
