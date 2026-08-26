"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Coins } from "lucide-react";
import { BitcoinSymbol } from "@/components/ui/bitcoin-logo";
//import { WalletButton } from "@/lib/wallet/cardano/wallet-button";
import { Button } from "@/components/ui/button";
import DashboardBtcHoldings from "./btc-holdings";

export default function WalletsCard() {
  // Other chains yields the card to the breakdown while it is open: it is a
  // "coming soon" note, and the breakdown is the only thing here anyone acts on.
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);

  return (
    <Card className="col-span-5 sm:col-span-1">
      <CardHeader>
        <CardTitle>Wallets</CardTitle>
        <CardDescription>
          View and connect wallets from different ecosystems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:gap-8">
          {/* Bitcoin - one balance across every layer it sits on, with the
              per-layer split available behind a disclosure. */}
          <div className="flex-1 border rounded p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <BitcoinSymbol className="w-5 h-5 text-[#F7931A]" />
              <div className="flex flex-col">
                <span className="font-semibold">Bitcoin</span>
              </div>
            </div>
            <DashboardBtcHoldings onExpandedChange={setBreakdownExpanded} />
          </div>

          {/* Other */}
          <div className="flex-1 border rounded p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-500" />
              <div className="flex flex-col">
                <span className="font-semibold">Other Chains</span>
                <span className="text-xs italic text-muted-foreground">
                  Coming soon
                </span>
              </div>
            </div>

            {/* Collapses to its heading while the breakdown is open. Nothing
                here is connectable yet, so the disabled rows are what gives
                way when the card needs the room. */}
            {!breakdownExpanded && (
              <>
                {/*<WalletButton />*/}
                <Button variant="outline" disabled>
                  Cardano
                </Button>
                <Button variant="outline" disabled>
                  Dogecoin
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
