"use client";

import { useState } from "react";
import { Loader2, Sun } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import { BtcSourceChip } from "@/components/btc/btc-amount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useL2Balance } from "@/hooks/dashboard/l2-balance";
import { btcSources, formatBtc, BTC_UNIT } from "@/lib/btc-sources";

// Staking onto the Sundial L2.
//
// ⚠ THE SUBMISSION HERE IS A MOCK. It broadcasts nothing and signs nothing: it
// waits, then updates local dashboard state as though a stake had settled. The
// UI does not say so - by decision, since this is testnet-only and the dashboard
// already carries a page-level notice that staking is simulated.
//
// It is mocked because there is nothing to submit to: `midgard-node` has no
// staking contract, and `ada-locker` is a Cardano L1 validator, so no L2 staking
// script exists to lock funds into.
//
// To make it real, `submitStake` becomes: build the lock transaction against the
// L2 staking validator, have the wallet sign it, then POST the CBOR to the
// node's `/submit` endpoint (a proxy route alongside app/api/l2/utxos). Nothing
// else in this file needs to change.
//
// Do not carry this into a mainnet build without replacing `submitStake` - with
// the notice gone there is nothing in the UI to tell a user the stake is fake.

const L2_ADDRESS_STORAGE_KEY = "sundial:l2-address";

// Stand-in latency so the pending state is visible while the mock resolves.
const SUBMIT_DELAY_MS = 1200;

export default function L2StakingForm({
  type,
  onStaked,
}: {
  type: "deposit" | "withdraw";
  onStaked: (amount: number) => void;
}) {
  const source = btcSources["sundial-l2"];
  const isDeposit = type === "deposit";

  // Same key the balance card uses, so an address entered in either place works
  // in the other.
  const [l2Address] = useLocalStorage(L2_ADDRESS_STORAGE_KEY, "");

  // Fetched here rather than read from Dashboard context: the context value is
  // only populated by the Wallets card on the Portfolio tab, so landing straight
  // on Stake would show no available balance. The hook writes into context too,
  // so both places stay consistent.
  const { balance: availableBalance, isLoading: isFetchingBalance } =
    useL2Balance(l2Address);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const parsed = Number(amount);
  const hasAmount = amount !== "" && Number.isFinite(parsed) && parsed > 0;
  const exceedsBalance =
    availableBalance !== null && hasAmount && parsed > availableBalance;
  const canSubmit = hasAmount && !exceedsBalance && !!l2Address && !loading;

  // Mocked - see the note at the top of this file. Replace the body to go live.
  const submitStake = async () => {
    setLoading(true);
    setResult(null);
    await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS));
    onStaked(parsed);
    setResult(
      `${isDeposit ? "Staked" : "Unstaked"} ${formatBtc(parsed, source.decimals)} ${BTC_UNIT} on ${source.venue}.`,
    );
    setAmount("");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-500/10 border border-amber-800/30 rounded-md">
        <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
          <Sun className="w-4 h-4" />
          {source.venue} {isDeposit ? "Staking" : "Unstaking"} Information
        </div>
        <ul className="text-sm text-amber-700/90 space-y-1">
          <li>• Bridged BTC, redeemable 1:1 for native BTC</li>
          <li>• Settles on the L2 ledger - no Bitcoin transaction fee</li>
        </ul>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">L2 address</label>
        <Input
          value={l2Address}
          readOnly
          placeholder="addr_test1..."
          className="text-xs"
        />
        <p className="text-xs text-muted-foreground">
          {l2Address
            ? "Taken from the address tracked on your Wallets card."
            : "Set an L2 address on the Wallets card first."}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-sm font-medium">
            Amount to {isDeposit ? "Stake" : "Unstake"} ({BTC_UNIT})
          </label>
          {availableBalance !== null && (
            <span className="text-xs text-muted-foreground">
              Available:{" "}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                onClick={() => setAmount(String(availableBalance))}
              >
                {formatBtc(availableBalance, source.decimals)} {BTC_UNIT}
              </button>
            </span>
          )}
          {isFetchingBalance && availableBalance === null && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Fetching balance…
            </span>
          )}
        </div>
        <Input
          type="number"
          step={1 / Math.pow(10, source.decimals)}
          min={0}
          max={availableBalance ?? undefined}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.000000"
          className={exceedsBalance ? "border-red-400" : ""}
        />
        {exceedsBalance && (
          <p className="text-red-600 text-xs">
            Amount exceeds your {source.venue} balance of{" "}
            {formatBtc(availableBalance ?? 0, source.decimals)} {BTC_UNIT}
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={submitStake}
        disabled={!canSubmit}
        className="flex items-center gap-2 w-full md:w-auto"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <BtcSourceChip sourceId="sundial-l2" />
        )}
        {loading
          ? "Submitting…"
          : `${isDeposit ? "Stake" : "Unstake"} on ${source.venue}`}
      </Button>

      {result && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">{result}</p>
        </div>
      )}
    </div>
  );
}
