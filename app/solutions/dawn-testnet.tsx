"use client";

import Link from "next/link";
import { Bitcoin, Lock, Coins } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Flags } from "@/lib/flags";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";

const highlights = [
  {
    icon: Bitcoin,
    title: "Built on Bitcoin",
    description:
      "Our novel BTC lockers are built entirely on Bitcoin for native, chain-level security.",
  },
  {
    icon: Lock,
    title: "Keep Assets On-Chain",
    description:
      "Send assets directly to our Bitcoin smart contracts without leaving the Bitcoin environment.",
  },
  {
    icon: Coins,
    title: "Native Rewards",
    description:
      "Yield and original assets are returned in BTC, preserving a clean Bitcoin-native experience.",
  },
];

export default function DawnTestnet() {
  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            top: "-250px",
            height: "900px",
            background:
              "linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 32%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 82%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(-100% 0%, 100% 10%, 100% 62%, 0% 100%)",
            opacity: "0.18",
          },
        },
      ]}
    >
      <Section className="w-full max-w-6xl mx-auto pt-60 lg:pt-6 pb-8">
        <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5 px-3 py-4 shadow-2xl backdrop-blur-xl sm:px-4 sm:py-5 md:rounded-[28px] md:px-10 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,196,57,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_25%)] pointer-events-none" />

          <div className="relative mx-auto grid max-w-5xl gap-3 lg:gap-0 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {Flags.DISABLE_DASHBOARD ? "Upcoming" : "New"} Release
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/60">
                  Sundial Dawn
                </p>
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Bitcoin Yield Testnet
                </h2>
                <p className="mx-auto max-w-xl text-base text-foreground/80 md:text-xl lg:mx-0">
                  Explore Sundial&apos;s newly released testnet and see how
                  Bitcoin-native yield can feel when the full flow stays rooted
                  in Bitcoin infrastructure.
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:items-center lg:justify-start">
                <Link
                  href="/dashboard"
                  className={`inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background text-center whitespace-nowrap transition-colors${
                    Flags.DISABLE_DASHBOARD
                      ? " opacity-50 pointer-events-none cursor-not-allowed grayscale"
                      : " hover:bg-foreground/80"
                  }`}
                  aria-disabled={Flags.DISABLE_DASHBOARD}
                >
                  {Flags.DISABLE_DASHBOARD ? "Coming Soon" : "Testnet"}
                </Link>
                <p className="text-sm text-foreground/60">
                  Live preview of the Bitcoin yield experience
                </p>
              </div>
            </div>

            <div className="grid max-w-[520px] gap-3 mt-8 justify-self-center lg:mt-20 lg:justify-self-end">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-sm border border-white/10 bg-secondary/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-foreground/70">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
