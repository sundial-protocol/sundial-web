"use client";

import { PropsWithChildren, useEffect, useState } from "react";

export function WalletProviderWrapper({ children }: PropsWithChildren) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on server
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Only render children on client
  return <>{children}</>;
}
