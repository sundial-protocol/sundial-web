import type React from "react";
import { WalletProvider } from "@/components/wallet-provider";

// The Cardano wallet context pulls in lucid-cardano (and its wasm), so it is
// scoped to the dashboard instead of the root layout.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProvider>{children}</WalletProvider>;
}
