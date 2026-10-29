"use client";

import { useLocalStorage } from "usehooks-ts";
import { ChevronDown } from "lucide-react";

const STORAGE_KEY = "sundial:how-staking-works-open";

// A short explanation of staking for first-time users, at the top of the Stake
// tab. Testers asked for "more explanatory information around staking" and to
// understand what was happening before they signed.
//
// Open until the user closes it, then remembered closed, so returning users
// aren't made to scroll past it.
export default function HowStakingWorks() {
  const [open, setOpen] = useLocalStorage(STORAGE_KEY, true);

  return (
    <div className="mb-8 rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
      >
        How staking works
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ol className="grid gap-4 px-4 pb-4 text-sm text-muted-foreground md:grid-cols-4">
          <li>
            <div className="mb-1 font-medium text-foreground">
              1. Pick an amount
            </div>
            Choose how much BTC to stake. The strategy on the right sets the
            yield and how long it is locked.
          </li>
          <li>
            <div className="mb-1 font-medium text-foreground">
              2. Review and sign
            </div>
            We prepare the transaction and show you exactly what it does. Your
            wallet asks you to sign it; nothing moves until you do.
          </li>
          <li>
            <div className="mb-1 font-medium text-foreground">
              3. Wait for confirmation
            </div>
            The transaction goes to the Bitcoin network and usually confirms in
            about 10 minutes. Its status shows under Recent Activity.
          </li>
          <li>
            <div className="mb-1 font-medium text-foreground">
              4. Earn, then withdraw
            </div>
            Your BTC stays on Bitcoin in scripts tied to your key. When the lock
            ends, you withdraw it, with the yield, from the Withdraw tab.
          </li>
        </ol>
      )}
    </div>
  );
}
