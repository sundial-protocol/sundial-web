"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Layers,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useGlobalPrice } from "@/lib/contexts/price-context";
import {
  formatBtc,
  satsToBtc,
  useSolsticeInstances,
} from "@/hooks/dashboard/solstice";
import type { SolsticeInstance } from "@/app/api/solstice/types";

const YP_TYPE_LABEL: Record<SolsticeInstance["yp_type"], string> = {
  btc_returning: "BTC-native",
  asset_backed: "Asset-backed",
};

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium truncate">{children}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function VaultRow({ instance }: { instance: SolsticeInstance }) {
  const { btcPrice } = useGlobalPrice();
  const { claim_ratio: cr, reserve_status: rs, redemption } = instance;
  const reserveSats = cr.btc_yp_sats + cr.btc_buffer_sats;
  const reserveUsd = satsToBtc(reserveSats) * btcPrice;
  const satsPerRt = Math.round(Number(cr.btc_per_rt) * 1e8);
  const paused = rs.investment_paused;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold">{instance.name}</span>
          <Badge variant="secondary">{YP_TYPE_LABEL[instance.yp_type]}</Badge>
          <span className="text-xs text-muted-foreground font-mono truncate">
            {instance.receipt_rune.ticker}
          </span>
        </div>
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
          {paused ? "Paused" : "Verified"}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label={`sats / ${instance.receipt_rune.ticker}`}>
          {satsPerRt.toLocaleString()}
        </Stat>
        <Stat label="Redemption">
          <span className="inline-flex items-center gap-1">
            {redemption.instant_available ? (
              <>
                <Zap className="h-3.5 w-3.5 text-yellow-500" /> Instant
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Queued
              </>
            )}
          </span>
        </Stat>
        <Stat label="Reserves (PoR)">
          {formatBtc(reserveSats, 2)} BTC{" "}
          <span className="text-muted-foreground">
            ($
            {reserveUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })})
          </span>
        </Stat>
        <Stat label="Proof of Reserves">
          {rs.layer2.enabled ? "Layer 1 + 2" : "Layer 1"}
        </Stat>
      </div>
    </div>
  );
}

export function SolsticeVaultList({
  title = "Solstice Vaults",
  subtitle = "BTC-native yield — redeem to BTC anytime",
}: {
  title?: string;
  subtitle?: string;
}) {
  const { instances, isLoading, error } = useSolsticeInstances();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-muted-foreground py-2">
            Couldn&apos;t load Solstice vaults: {error}
          </p>
        )}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading vaults…
          </div>
        ) : (
          <div className="divide-y">
            {instances.map((instance) => (
              <VaultRow key={instance.instance_id} instance={instance} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
