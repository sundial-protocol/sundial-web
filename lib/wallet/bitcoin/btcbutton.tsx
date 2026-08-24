"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BitcoinSymbol } from "@/components/ui/bitcoin-logo";
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
import {
  Button,
  buttonVariants,
  type ButtonProps,
} from "@/components/ui/button";

// `size` is passed through so the same control can sit in a wide form and in
// the narrow dashboard breakdown, where a full-height button dominates the
// balance it belongs to. Defaults to the full size this started at.
export const ConnectButton = ({
  size = "default",
}: {
  size?: ButtonProps["size"];
}) => {
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
      <div
        className={buttonVariants({
          variant: "outline",
          size,
          className: "w-full opacity-50",
        })}
      >
        <BitcoinSymbol />
        Loading wallet…
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} disabled={loading}>
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
              <BitcoinSymbol className="w-5 h-5" />
              Connect Bitcoin Wallet
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
