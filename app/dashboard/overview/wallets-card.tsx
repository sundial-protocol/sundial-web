"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Bitcoin, Coins } from "lucide-react";
import { WalletButton } from "@/lib/wallet/cardano/wallet-button";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";

export default function WalletsCard() {
  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Wallet Connections</CardTitle>
        <CardDescription>
          View and connect wallets from different ecosystems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:gap-8">
          {/* Bitcoin */}
          <div className="flex-1 border rounded p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <Bitcoin className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Bitcoin</span>
            </div>
            <ConnectButton />
          </div>

          {/* Other */}
          <div className="flex-1 border rounded p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Other</span>
            </div>
            <WalletButton />
            <Button variant="outline" disabled>
              Connect Dogecoin Wallet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
