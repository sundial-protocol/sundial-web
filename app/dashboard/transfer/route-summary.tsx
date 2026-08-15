"use client";

import { Ban, Clock, Route as RouteIcon, ShieldAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  MECHANISM_COMING_SOON,
  mechanismStatusFor,
  transferMechanism,
  type MechanismProfile,
  type TransferMechanism,
  type TransferMechanismId,
} from "@/lib/transfer/mechanisms";
import type { TransferRoute } from "@/lib/transfer/routes";

// What will actually happen, stated before the user commits.
//
// The transfer UI accepts any pair of endpoints, so it owes an answer for every
// pair — including "this one is not possible, and here is why". An unroutable
// pair is rendered here as a real answer rather than left to fail at submit,
// because a form that accepts input it will always reject is worse than one
// that says no up front.

export default function RouteSummary({
  route,
  networkFee,
  networkFeeUnit,
  profile,
  mechanismId,
  mechanismOptions,
  onMechanismChange,
}: {
  route: TransferRoute;
  networkFee: number | null;
  networkFeeUnit: string | null;
  // Timing, confirmations, trust model and any mechanism fee. Comes from the
  // chosen mechanism, not the route — two mechanisms serving the same movement
  // do not share them. Null when the selection has no protocol yet.
  profile: MechanismProfile | null;
  mechanismId: TransferMechanismId | null;
  // Filtered to the route's direction by the composer, so a peg-out never
  // offers a peg-in-only mechanism.
  mechanismOptions: TransferMechanism[];
  // Omitted once a transfer is in flight: the route is settled at that point,
  // so the control is shown read-only rather than offering a change that would
  // silently not apply.
  onMechanismChange?: (id: TransferMechanismId) => void;
}) {
  const isUnsupported = route.kind === "unsupported";
  const selected = mechanismId ? transferMechanism(mechanismId) : undefined;
  // Status is per direction: Charms is available for peg-in and pending for
  // peg-out, so the same entry renders differently depending on which way the
  // transfer is going.
  const statusOf = (id: TransferMechanismId) =>
    route.direction ? mechanismStatusFor(id, route.direction) : undefined;
  const selectedStatus = mechanismId ? statusOf(mechanismId) : undefined;
  // A direction nothing implements yet — peg-out today.
  const hasAvailableOption = mechanismOptions.some(
    (m) => statusOf(m.id) === "available",
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUnsupported ? (
            <Ban className="w-5 h-5 text-destructive" />
          ) : (
            <RouteIcon className="w-5 h-5" />
          )}
          Route
        </CardTitle>
        <CardDescription>
          {isUnsupported
            ? "This pair cannot be transferred between"
            : "How this transfer will be carried out"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isUnsupported ? (
          <div className="flex items-start gap-3 rounded-sm border border-destructive/25 bg-destructive/10 p-4 text-sm">
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium">No route available</p>
              <p className="mt-1 text-muted-foreground">
                {route.unavailableReason}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {route.direction ? (
              <div className="space-y-2">
                <Label htmlFor="transfer-mechanism">Select Route</Label>
                <select
                  id="transfer-mechanism"
                  value={mechanismId ?? ""}
                  disabled={!onMechanismChange || mechanismOptions.length === 0}
                  onChange={(event) =>
                    onMechanismChange?.(
                      event.target.value as TransferMechanismId,
                    )
                  }
                  className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mechanismOptions.map((mechanism) => {
                    const isReady = statusOf(mechanism.id) === "available";
                    return (
                      <option
                        key={mechanism.id}
                        value={mechanism.id}
                        disabled={!isReady}
                      >
                        {mechanism.name}
                        {isReady ? "" : ` — ${MECHANISM_COMING_SOON}`}
                      </option>
                    );
                  })}
                </select>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {route.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {profile?.etaLabel ?? "—"}
                  </span>
                </div>
                {selected?.description ? (
                  <p className="text-xs text-muted-foreground pb-4 border-b">
                    {selected.description}
                  </p>
                ) : null}
                {!hasAvailableOption ? (
                  <p className="text-xs text-amber-700 dark:text-amber-500">
                    Nothing carries transfers in this direction yet.{" "}
                    {MECHANISM_COMING_SOON}.
                  </p>
                ) : selected && selectedStatus !== "available" ? (
                  <p className="text-xs text-muted-foreground">
                    {MECHANISM_COMING_SOON}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-mono">1:1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network fee</span>
                <span className="font-mono">
                  {networkFee !== null
                    ? `${networkFee.toLocaleString()} ${networkFeeUnit ?? ""}`.trim()
                    : "None"}
                </span>
              </div>
              {profile && profile.requiredConfirmations > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmations</span>
                  <span className="font-mono">
                    {profile.requiredConfirmations}
                  </span>
                </div>
              ) : null}
              {profile?.fee ? (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">
                    {profile.fee.label}
                  </span>
                  <span className="font-mono">
                    {profile.fee.amount.toLocaleString()}
                  </span>
                </div>
              ) : null}
            </div>

            {profile?.isThresholdAuthorized ? (
              <div className="flex items-start gap-2 rounded-sm border border-amber-500/25 bg-amber-500/10 p-3 text-xs">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-muted-foreground">
                  Authorized by a Scrolls threshold signature, not by the
                  destination ledger verifying the transfer itself. The signers
                  are who you are trusting on this route.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
