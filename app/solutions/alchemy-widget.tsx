"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Snowflake,
  Shield,
  ExternalLinkIcon,
  MailIcon,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { PROPOSAL_LINK } from "../alchemy/constants";

const highlights = [
  {
    icon: Flame,
    title: "FIRE (BTC+)",
    description:
      "The junior reserve-growth asset. Captures residual BTC upside after ICE liabilities are met.",
    iconClass: "border-orange-500/20 bg-orange-500/10",
    iconColor: "text-orange-400",
  },
  {
    icon: Snowflake,
    title: "ICE (BTC−)",
    description:
      "The senior BTC-backed claim. Lower volatility, USD-denominated, with formulaic reserve-funded growth.",
    iconClass: "border-sky-500/20 bg-sky-500/10",
    iconColor: "text-sky-400",
  },
  {
    icon: Shield,
    title: "ZK Security",
    description:
      "Alchemy's ZK proofs ensure holders can always verify their claim on the shared BTC vault.",
    iconClass: "border-primary/20 bg-primary/10",
    iconColor: "text-primary",
  },
];

export default function AlchemyWidget() {
  function handleSubscribe() {
    document
      .getElementById("mailing-list-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.dispatchEvent(
      new CustomEvent("preselectMailingList", { detail: { listId: 3 } }),
    );
  }

  return (
    <Section className="relative w-full max-w-6xl mx-auto pt-16 sm:pt-20 lg:pt-6 pb-8 lg:pr-24">
      <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5 px-3 py-4 shadow-2xl backdrop-blur-xl sm:px-4 sm:py-5 md:rounded-[28px] md:px-10 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,196,57,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_25%)] pointer-events-none" />

        <div className="relative mx-auto grid max-w-5xl gap-3 lg:gap-0 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Cardano Treasury Proposal
            </div>
            <div className="mt-6 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/60">
                Sundial × Charms
              </p>
              <Image
                src="/alchemy/v2-gold.png"
                alt="Alchemy"
                width={1050}
                height={350}
                priority
                className="hidden dark:block h-auto w-full object-contain"
              />
              <Image
                src="/alchemy/v2-normal.png"
                alt="Alchemy"
                width={1050}
                height={350}
                priority
                className="block dark:hidden h-auto w-full object-contain"
              />
              <p className="mx-auto max-w-xl text-base text-foreground/80 md:text-xl lg:mx-0">
                BTC-backed reserve assets for Cardano. FIRE and ICE - a
                senior/junior split of a shared Bitcoin vault - built natively
                on Cardano & Bitcoin with the Charms protocol.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:items-center lg:justify-start">
              <Link
                href="/alchemy"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background text-center whitespace-nowrap hover:bg-foreground/80 transition-colors"
              >
                Learn More
              </Link>
              <Link
                href={PROPOSAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-foreground/20 bg-white/5 px-8 text-base font-medium text-foreground text-center whitespace-nowrap hover:bg-white/10 transition-colors"
              >
                Read Proposal
                <ExternalLinkIcon className="h-4 w-4 ml-2" />
              </Link>
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
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${item.iconClass}`}
                    >
                      <Icon className={`h-4 w-4 ${item.iconColor}`} />
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

      <button
        onClick={handleSubscribe}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 -rotate-90 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        Alchemy Updates <MailIcon className="h-4 w-4" />
      </button>
    </Section>
  );
}
