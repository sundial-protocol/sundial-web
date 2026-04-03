"use client";

import { bitcoinAdapter, projectId, networks } from "./config";
import { createAppKit } from "@reown/appkit/react";
import { useRef, type ReactNode } from "react";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "Sundial Web",
  description: "Sundial Web Dashboard",
  url: "https://github.com/0xonerb/next-reown-appkit-ssr", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

function initModal() {
  return createAppKit({
    adapters: [bitcoinAdapter],
    projectId,
    networks,
    metadata,
    themeMode: "light",
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
      socials: [],
      email: false,
    },
    themeVariables: {
      "--w3m-accent": "#000000",
    },
  });
}

function ContextProvider({ children }: { children: ReactNode }) {
  const modalRef = useRef<ReturnType<typeof createAppKit> | null>(null);
  if (!modalRef.current) {
    modalRef.current = initModal();
  }
  return <>{children}</>;
}

export default ContextProvider;
