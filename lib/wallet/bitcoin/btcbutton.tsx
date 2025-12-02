"use client";

import { useEffect, useState } from "react";
import { Bitcoin } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";

export const ConnectButton = () => {
  const [isClient, setIsClient] = useState(false);
  const { open } = useAppKit();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background h-10 px-4 py-2 w-full opacity-50">
        <Bitcoin className="w-4 h-4 mr-2" />
        Loading Bitcoin wallet...
      </div>
    );
  }

  return (
    <button
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
      onClick={() => open()}
    >
      <Bitcoin className="w-4 h-4 mr-2" />
      Connect Bitcoin Wallet
    </button>
  );
};
