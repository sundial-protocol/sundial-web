"use client";

import { useEffect, useState } from "react";
import { Bitcoin, Loader2 } from "lucide-react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitState,
  useWalletInfo,
} from "@reown/appkit/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const ConnectButton = () => {
  const [isClient, setIsClient] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { loading } = useAppKitState();
  const { walletInfo } = useWalletInfo();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // const formatAddress = (addr: string) => {
  //   if (!addr) return "";
  //   return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  // };

  const handleDisconnect = async () => {
    try {
      // AppKit should handle disconnection through the modal
      await open();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  if (!isClient) {
    return (
      <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background h-10 px-4 py-2 w-full opacity-50">
        <Bitcoin className="w-4 h-4 mr-2" />
        Loading Bitcoin wallet...
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isConnected && walletInfo ? (
            <>
              <img
                src={walletInfo.icon}
                alt={walletInfo.name}
                className="w-4 h-4 mr-2 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/wallets/default.png";
                }}
              />
              <span className="font-medium">{walletInfo.name}</span>
              {/*<span className="ml-2 text-xs text-muted-foreground">
                {formatAddress(address || "")}
              </span>*/}
            </>
          ) : (
            <div className="flex items-center gap-2">Connect Wallet</div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {isConnected && walletInfo ? (
          <>
            <DropdownMenuItem disabled className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={walletInfo.icon}
                  alt={walletInfo.name}
                  className="w-5 h-5 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/wallets/default.png";
                  }}
                />
                <span className="font-medium">{walletInfo.name}</span>
              </div>
              <div className="text-xs text-muted-foreground font-mono ml-7">
                {address}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => open()}>
              Manage Connection
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-600"
            >
              Disconnect
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => open()}>
            <div className="flex w-full items-center gap-4 font-bold">
              <Bitcoin className="w-5 h-5" />
              Connect Bitcoin Wallet
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
