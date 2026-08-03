"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useGlobalPrice } from "@/lib/contexts/price-context";
import {
  formatBtc,
  rtToDisplay,
  satsToBtc,
  SOLSTICE_DEMO_ADDRESS,
  solsticeApi,
  useSolsticeInstances,
} from "@/hooks/dashboard/solstice";
import type {
  PositionResponse,
  Reservation,
  ReserveStatus,
  SolsticeInstance,
} from "@/app/api/solstice/types";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-all">{children}</span>
    </div>
  );
}

function PositionBlock({ instance }: { instance: SolsticeInstance }) {
  const { btcPrice } = useGlobalPrice();
  const [position, setPosition] = useState<PositionResponse | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reserves, setReserves] = useState<ReserveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      solsticeApi.getPositions(instance.slug, SOLSTICE_DEMO_ADDRESS),
      solsticeApi.getReservations(instance.slug, SOLSTICE_DEMO_ADDRESS),
      solsticeApi.getReserves(instance.slug),
    ])
      .then(([pos, resv, res]) => {
        if (!active) return;
        setPosition(pos);
        setReservations(resv);
        setReserves(res);
      })
      .catch((err) => active && setError((err as Error).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [instance.slug]);

  const div = instance.receipt_rune.divisibility;
  const paused = reserves?.investment_paused;

  return (
    <div className="py-4 first:pt-0 last:pb-0 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold">{instance.name}</span>
          <span className="text-xs text-muted-foreground font-mono truncate">
            {instance.receipt_rune.ticker}
          </span>
        </div>
        {reserves && (
          <Badge
            className={
              paused ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }
          >
            {paused ? (
              <ShieldAlert className="h-3 w-3 mr-1" />
            ) : (
              <ShieldCheck className="h-3 w-3 mr-1" />
            )}
            {paused
              ? "Paused"
              : reserves.layer2.enabled
                ? "PoR L1+2"
                : "PoR L1"}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : (
        position && (
          <>
            <div className="grid gap-1.5">
              <Row label="Balance">
                {rtToDisplay(position.rt_balance, div)}{" "}
                {instance.receipt_rune.ticker}
              </Row>
              <Row label="Value">
                {formatBtc(position.value_sats)} BTC{" "}
                <span className="text-muted-foreground">
                  ($
                  {(satsToBtc(position.value_sats) * btcPrice).toLocaleString(
                    undefined,
                    { maximumFractionDigits: 2 },
                  )}
                  )
                </span>
              </Row>
              <Row label="Claim ratio">
                {position.claim_ratio.btc_per_rt} BTC/RT
              </Row>
              {reserves && (
                <Row label="Reserves">
                  {formatBtc(reserves.layer1.btc_yp_sats)} BTC ·{" "}
                  {reserves.layer1.stale ? "stale" : "fresh"}
                </Row>
              )}
            </div>

            {position.pending_redemptions.length > 0 && (
              <div className="rounded-sm border p-3 space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Pending redemptions
                </div>
                {position.pending_redemptions.map((p) => (
                  <div key={p.request_id} className="space-y-1">
                    <Row label="Amount">
                      {rtToDisplay(p.amount_rt, div)}{" "}
                      {instance.receipt_rune.ticker}
                    </Row>
                    <Row label="Locked payout">
                      {formatBtc(p.locked_payout_sats)} BTC
                    </Row>
                    <Row label="Queue / settles">
                      #{p.queue_position} ·{" "}
                      {new Date(p.estimated_settlement_at).toLocaleDateString()}
                    </Row>
                  </div>
                ))}
              </div>
            )}

            {reservations.length > 0 && (
              <div className="rounded-sm border p-3 space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Claim reservations
                </div>
                {reservations.map((r) => (
                  <div
                    key={r.reservation_id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span>{formatBtc(r.payout_sats)} BTC</span>
                    <Badge
                      className={
                        r.status === "claimable"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

export function SolsticePositionsPanel() {
  const { instances, isLoading, error } = useSolsticeInstances();

  if (!isLoading && !error && instances.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" /> Solstice Positions
        </CardTitle>
        <CardDescription>
          Receipt-Rune holdings, redemption queue, and reserve status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-muted-foreground py-2">
            Couldn&apos;t load Solstice positions: {error}
          </p>
        )}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading positions…
          </div>
        ) : (
          <div className="divide-y">
            {instances.map((instance) => (
              <PositionBlock key={instance.instance_id} instance={instance} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
