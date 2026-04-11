"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Bitcoin,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";
import type { UserDeposit, DepositStatus } from "@/app/api/user-deposits/types";

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_LABELS: Record<DepositStatus, string> = {
  INTENT_CREATED: "Pending",
  DEPOSIT_SEEN: "Broadcasting",
  DEPOSIT_CONFIRMED: "Confirmed",
  PROVIDER_CLAIM_SEEN: "Claiming",
  PROVIDER_CLAIM_CONFIRMED: "Active",
  DISTRIBUTION_SEEN: "Distributing",
  DISTRIBUTION_CONFIRMED: "Ready",
  WITHDRAWAL_SEEN: "Withdrawing",
  WITHDRAWAL_CONFIRMED: "Complete",
};

const STATUS_VARIANTS: Record<
  DepositStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  INTENT_CREATED: "secondary",
  DEPOSIT_SEEN: "secondary",
  DEPOSIT_CONFIRMED: "default",
  PROVIDER_CLAIM_SEEN: "secondary",
  PROVIDER_CLAIM_CONFIRMED: "default",
  DISTRIBUTION_SEEN: "secondary",
  DISTRIBUTION_CONFIRMED: "default",
  WITHDRAWAL_SEEN: "secondary",
  WITHDRAWAL_CONFIRMED: "outline",
};

function StatusIcon({ status }: { status: DepositStatus }) {
  switch (status) {
    case "INTENT_CREATED":
    case "DEPOSIT_SEEN":
    case "PROVIDER_CLAIM_SEEN":
    case "DISTRIBUTION_SEEN":
    case "WITHDRAWAL_SEEN":
      return <Clock className="h-3.5 w-3.5" />;
    case "WITHDRAWAL_CONFIRMED":
      return <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />;
    default:
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
  }
}

/** True when the deposit is still progressing through the active lifecycle. */
function isActive(status: DepositStatus): boolean {
  return !["WITHDRAWAL_SEEN", "WITHDRAWAL_CONFIRMED"].includes(status);
}

/** True when the user can initiate a withdrawal. */
function isWithdrawable(status: DepositStatus): boolean {
  return status === "DISTRIBUTION_CONFIRMED";
}

// ── Formatters ─────────────────────────────────────────────────────────────

function formatSats(sats: number): string {
  if (sats >= 1_000_000) {
    return `${(sats / 1_000_000).toFixed(4)} BTC`;
  }
  return `${sats.toLocaleString()} sats`;
}

function formatDuration(ms: number): string {
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days >= 365) return `${(days / 365).toFixed(1)} yr`;
  if (days >= 30) return `${Math.round(days / 30)} mo`;
  return `${days}d`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DepositProgressBar({ status }: { status: DepositStatus }) {
  const steps: DepositStatus[] = [
    "INTENT_CREATED",
    "DEPOSIT_CONFIRMED",
    "PROVIDER_CLAIM_CONFIRMED",
    "DISTRIBUTION_CONFIRMED",
    "WITHDRAWAL_CONFIRMED",
  ];

  // Map the current status to the nearest milestone step
  const milestoneIndex = (s: DepositStatus): number => {
    if (s === "INTENT_CREATED" || s === "DEPOSIT_SEEN") return 0;
    if (s === "DEPOSIT_CONFIRMED") return 1;
    if (s === "PROVIDER_CLAIM_SEEN" || s === "PROVIDER_CLAIM_CONFIRMED")
      return 2;
    if (s === "DISTRIBUTION_SEEN" || s === "DISTRIBUTION_CONFIRMED") return 3;
    return 4; // WITHDRAWAL_SEEN / WITHDRAWAL_CONFIRMED
  };

  const currentIdx = milestoneIndex(status);

  const labels = [
    "Deposited",
    "Confirmed",
    "Active",
    "Distributing",
    "Complete",
  ];

  return (
    <div className="flex items-center gap-0 w-full mt-3">
      {steps.map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${
              i <= currentIdx ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap hidden sm:block">
              {labels[i]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 transition-colors ${
                i < currentIdx ? "bg-primary" : "bg-muted-foreground/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface DepositCardProps {
  deposit: UserDeposit;
  onDeposit: () => void;
  onWithdraw: () => void;
}

function DepositCard({ deposit, onDeposit, onWithdraw }: DepositCardProps) {
  const yieldPct = ((deposit.alpha_bps / 10_000) * 100).toFixed(2);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Bitcoin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="truncate font-mono text-sm">
                {deposit.deposit_id.slice(0, 8)}…
              </span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Created {formatDate(deposit.created_at)}
              {deposit.due_at && ` · Matures ${formatDate(deposit.due_at)}`}
            </CardDescription>
          </div>

          <Badge
            variant={STATUS_VARIANTS[deposit.status as DepositStatus]}
            className="flex items-center gap-1 shrink-0"
          >
            <StatusIcon status={deposit.status as DepositStatus} />
            {STATUS_LABELS[deposit.status as DepositStatus] ?? deposit.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Amount</p>
            <p className="font-semibold">{formatSats(deposit.amount_sats)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Lock Period</p>
            <p className="font-semibold">{formatDuration(deposit.lock_ms)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Allocation</p>
            <p className="font-semibold">{yieldPct}%</p>
          </div>
        </div>

        {/* Progress */}
        <DepositProgressBar status={deposit.status as DepositStatus} />

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isActive(deposit.status as DepositStatus) && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={onDeposit}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Add Deposit
            </Button>
          )}
          {isWithdrawable(deposit.status as DepositStatus) && (
            <Button size="sm" className="flex-1 gap-1.5" onClick={onWithdraw}>
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Withdraw
            </Button>
          )}
          {!isActive(deposit.status as DepositStatus) &&
            !isWithdrawable(deposit.status as DepositStatus) && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={onWithdraw}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                View Withdrawal
              </Button>
            )}
          <Button size="sm" variant="ghost" asChild>
            <a
              href={`https://mempool.space/tx/${deposit.deposit_id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View on explorer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface DepositsTabProps {
  /** Called when the user clicks "Add Deposit" – navigates to the deposit tab. */
  onNavigateDeposit: () => void;
  /** Called when the user clicks "Withdraw" – navigates to the withdraw tab. */
  onNavigateWithdraw: () => void;
}

export function DepositsTab({
  onNavigateDeposit,
  onNavigateWithdraw,
}: DepositsTabProps) {
  const { address, isConnected } = useAppKitAccount();
  const [deposits, setDeposits] = useState<UserDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async (btcAddress: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/user-deposits?address=${encodeURIComponent(btcAddress)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).error ?? "Failed to load deposits");
      }
      setDeposits(data as UserDeposit[]);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      fetchDeposits(address);
    } else {
      setDeposits([]);
    }
  }, [isConnected, address, fetchDeposits]);

  // ── Render ──

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <Bitcoin className="h-12 w-12 text-yellow-500 opacity-60" />
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-lg">Connect your wallet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Connect your Bitcoin wallet to view and manage your live deposits.
          </p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Programs</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track and manage all deposits for{" "}
            <span className="font-mono text-xs">
              {address.slice(0, 10)}…{address.slice(-6)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fetchDeposits(address)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onNavigateDeposit}>
            <ArrowUpRight className="h-3.5 w-3.5" />
            New Deposit
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {isLoading && deposits.length === 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3 mt-1" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-2.5 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-4/5" />
                    </div>
                  ))}
                </div>
                <div className="h-2 bg-muted rounded w-full" />
                <div className="flex gap-2">
                  <div className="h-8 bg-muted rounded flex-1" />
                  <div className="h-8 bg-muted rounded flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Deposits grid */}
      {!isLoading && deposits.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed rounded-lg">
          <Bitcoin className="h-10 w-10 text-muted-foreground/40" />
          <div className="text-center space-y-1">
            <p className="font-medium">No deposits found</p>
            <p className="text-muted-foreground text-sm">
              Start earning yield by making your first Bitcoin deposit.
            </p>
          </div>
          <Button className="gap-1.5" onClick={onNavigateDeposit}>
            <ArrowUpRight className="h-4 w-4" />
            Make a Deposit
          </Button>
        </div>
      )}

      {deposits.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {deposits.map((deposit) => (
            <DepositCard
              key={deposit.deposit_id}
              deposit={deposit}
              onDeposit={onNavigateDeposit}
              onWithdraw={onNavigateWithdraw}
            />
          ))}
        </div>
      )}
    </div>
  );
}
