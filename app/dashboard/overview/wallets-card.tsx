"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Bitcoin, Coins } from "lucide-react";
//import { WalletButton } from "@/lib/wallet/cardano/wallet-button";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/lib/wallet/bitcoin/btcbutton";

export default function WalletsCard() {
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
          {/* Bitcoin */}
          <div className="flex-1 border rounded p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <Bitcoin className="w-5 h-5 text-yellow-500" />
              <div className="flex flex-col">
                <span className="font-semibold">Bitcoin</span>
                <span className="text-xs italic text-muted-foreground">
                  Testnet3
                </span>
              </div>
            </div>
            <ConnectButton />
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

            {/*<WalletButton />*/}
            <Button variant="outline" disabled>
              Cardano
            </Button>
            <Button variant="outline" disabled>
              Dogecoin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
