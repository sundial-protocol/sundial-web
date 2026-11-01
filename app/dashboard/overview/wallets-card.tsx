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
import { useAppKitAccount, useWalletInfo } from "@reown/appkit/react";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";

// Whether a Bitcoin wallet is connected, said in words and shown outside the
// breakdown. Testers with several wallets installed couldn't tell from the card
// whether, or which one, had connected: the connect control sits inside the
// collapsed breakdown.
function BitcoinWalletStatus() {
  const { address, isConnected } = useAppKitAccount({ namespace: "bip122" });
  const { walletInfo } = useWalletInfo();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
        <span className="text-muted-foreground">
          Connected{walletInfo?.name ? ` with ${walletInfo.name}` : ""}:{" "}
          <span className="font-mono">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
        <span className="text-muted-foreground">No wallet connected</span>
      </div>
      <ConnectButton size="sm" />
    </div>
  );
}

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
            <BitcoinWalletStatus />
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
