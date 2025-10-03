"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  getWalletDisplayName,
  getWalletIcon,
  useWallet,
  WalletApiError,
  WalletConnectError,
  ExtensionNotInjectedError,
  WalletNotInstalledError,
  EnablementFailedError,
  getErrorMessage,
} from "@/lib/wallet";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function WalletButton() {
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
        toast.success(`Connected to ${getWalletDisplayName(extension)}`);
      } catch (error) {
        // Use existing error handling scheme
        if (error instanceof WalletApiError) {
          if (error.code === "Refused") {
            toast.info("Wallet connection canceled per your request");
          } else {
            toast.error(getErrorMessage(error));
          }
        } else if (
          error instanceof WalletConnectError ||
          error instanceof ExtensionNotInjectedError ||
          error instanceof WalletNotInstalledError ||
          error instanceof EnablementFailedError
        ) {
          toast.error(getErrorMessage(error));
        } else {
          toast.error(getErrorMessage(error));
        }
      }
    },
    [connect]
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
    toast.success("Wallet disconnected");
  }, [disconnect]);

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
        <Button variant="ghost" disabled={isConnecting}>
          {isConnecting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Connecting...
            </>
          ) : isConnected ? (
            <div className="flex items-center gap-2">
              <img
                src={getWalletIcon(selectedWallet)}
                className="h-5 w-5"
                alt={`${selectedWallet} Icon`}
              />
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
      <DropdownMenuContent>
        {installedExtensions.length > 0 ? (
          installedExtensions.map((extension, key) => (
            <DropdownMenuItem
              key={key}
              disabled={extension === selectedWallet}
              onClick={() => handleClick(extension)}
            >
              <div className="flex w-full items-center gap-3">
                <img
                  src={getWalletIcon(extension)}
                  alt="Wallet Icon"
                  className="h-5 w-5"
                />
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
              className="font-medium text-red-600 focus:text-red-600"
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
