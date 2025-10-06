"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import { getWalletDisplayName, getWalletIcon, useWallet } from "@/lib/wallet";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function WalletButton() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const {
    connect,
    disconnect,
    isInitializing,
    isConnected,
    isConnecting,
    selectedWallet,
    installedExtensions,
    accountBalance,
  } = useWallet();

  const handleClick = useCallback(
    async (extension: string) => {
      try {
        await connect(extension);
        // Don't show success toast here since WalletProvider already shows it
      } catch (error) {
        // Don't show error toasts here since the errors are already handled
        // in the connect function via notifyError
        console.error("Wallet connection failed:", error);
      }
    },
    [connect]
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
    // Don't show disconnect toast here since WalletProvider already shows it
  }, [disconnect]);

  const handleImageError = (walletName: string) => {
    setImageErrors((prev) => ({ ...prev, [walletName]: true }));
  };

  const WalletImage = ({
    walletName,
    className,
  }: {
    walletName: string;
    className?: string;
  }) => {
    const iconSrc = getWalletIcon(walletName);

    if (imageErrors[walletName]) {
      // Fallback to a simple div with first letter
      return (
        <div
          className={`${
            className ?? ""
          } bg-gray-300 rounded flex items-center justify-center text-xs font-bold`}
        >
          {getWalletDisplayName(walletName)[0]}
        </div>
      );
    }

    // Use regular img for all wallet icons (including data URLs)
    return (
      <Image
        src={iconSrc}
        alt={`${walletName} Icon`}
        className={className}
        onError={() => handleImageError(walletName)}
        width={32}
        height={32}
      />
    );
  };

  if (isInitializing) {
    return (
      <Button variant="ghost" disabled>
        <Loader2 className="size-4 animate-spin mr-2" />
        Initializing...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isConnecting}
          className="py-5 bg-secondary hover:bg-accent-foreground hover:text-secondary-foreground"
        >
          {isConnecting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Connecting...
            </>
          ) : isConnected ? (
            <div className="flex items-center gap-2">
              <WalletImage walletName={selectedWallet} className="rounded" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {getWalletDisplayName(selectedWallet)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {accountBalance.toFixed(2)} ADA
                </span>
              </div>
            </div>
          ) : (
            "Connect Cardano Wallet"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-secondary">
        {installedExtensions.length > 0 ? (
          installedExtensions.map((extension, key) => (
            <DropdownMenuItem
              key={key}
              disabled={extension === selectedWallet}
              onClick={() => handleClick(extension)}
            >
              <div className="flex w-full items-center gap-3 px-8 pr-24">
                <WalletImage walletName={extension} className="rounded" />
                <span className="font-medium">
                  {getWalletDisplayName(extension)}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No wallets installed</span>
          </DropdownMenuItem>
        )}

        {isConnected && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="font-medium text-red-600 focus:text-red-600 px-8"
              onClick={handleDisconnect}
            >
              Disconnect
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
