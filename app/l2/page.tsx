import type { Metadata } from "next";
import Link from "next/link";
import { LucideArrowRight, Droplets } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";
import { Flags } from "@/lib/flags";
import { L2Pillars } from "./l2-pillars";
import { L2Onboarding } from "./l2-onboarding";

export const metadata: Metadata = {
  title: "Sundial L2 | Sundial Protocol",
  description:
    "Sundial's Bitcoin Layer-2: a fraud-proof, UTXO-native L2 with a Bitcoin-anchored bridge, no wrapped tokens and no bridge risk.",
};

export default function L2Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection classes="bg-gradient-to-b from-primary/20 to-background pb-16 pt-96">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-[2.75rem]/[1.1] font-bold tracking-tight sm:text-6xl">
            The Sundial <span className="text-[#f7931a]">Layer-2</span>
          </h1>
          <p className="pt-4 md:text-xl text-foreground/80">
            A fraud-proof, UTXO-native Bitcoin Layer-2 with its own
            Bitcoin-anchored bridge - no wrapped tokens, no bridge risk, no
            dependency on external L2s or custodians.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link
              href="/testnet/faucet"
              aria-disabled={Flags.DISABLE_TESTNET}
              className={`inline-flex items-center justify-center rounded-full h-14 md:px-12 text-black font-bold transition-colors bg-primary ${
                Flags.DISABLE_TESTNET
                  ? "opacity-50 pointer-events-none cursor-not-allowed grayscale"
                  : "hover:bg-primary/70"
              }`}
            >
              <Droplets className="mr-2 h-4 w-4" /> Get Testnet sBTC
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center rounded-full h-14 md:px-12 text-base font-medium transition-colors bg-background/20 hover:bg-foreground/20 border border-foreground"
            >
              Read the Docs <LucideArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </HeroSection>

      <L2Pillars />
      <L2Onboarding />
    </div>
  );
}
