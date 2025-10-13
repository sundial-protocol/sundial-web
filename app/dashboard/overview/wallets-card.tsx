"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Bitcoin, Check, Coins, Copy } from "lucide-react";
import { WalletButton } from "@/components/ui/wallet-button";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type WalletsCardProps = {
  btcWallet: string | null;
  setBtcWallet: (address: string | null) => void;
};

const formatAddress = (address: string, length = 20) => {
  if (!address) return "";
  if (address.length <= length) return address;
  return `${address.slice(0, length)}...${address.slice(-6)}`;
};

export default function WalletsCard({
  btcWallet,
  setBtcWallet,
}: WalletsCardProps) {
  function handleCopy(addr: string) {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 1200);
  }

  const [copied, setCopied] = useState<string | null>(null);

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
            {btcWallet ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs truncate">
                    {formatAddress(btcWallet)}
                  </span>
                  <button
                    onClick={() => handleCopy(btcWallet)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy address"
                  >
                    {copied === btcWallet ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBtcWallet(null)}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setBtcWallet(null)}>
                Connect Bitcoin Wallet
              </Button>
            )}
          </div>

          {/* Other */}
          <div className="flex-1 border rounded p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Other</span>
            </div>
            <WalletButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
