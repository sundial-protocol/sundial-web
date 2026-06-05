import { HeroSection } from "@/components/ui/hero-section";
import { Section } from "@/components/ui/section";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Cpu,
  TrendingUp,
  MessageCircleQuestion,
  Vote,
  ArrowRight,
  ExternalLink,
  Flame,
  Snowflake,
} from "lucide-react";
import AlchemyLogoStrip from "./alchemy-logo-strip";
import InteractiveGradientBackground from "@/components/ui/interactive-gradient-bg";

const subpages = [
  {
    href: "https://medium.com/@SundialProtocol/sundial-x-charms-proposal-building-the-first-bitcoin-treasury-protocol-for-cardano-e437c964c3b6",
    icon: BookOpen,
    title: "The Proposal",
    description:
      "Read the draft Cardano treasury proposal - funding structure, milestones, and accountability.",
    color: "text-primary",
  },
  {
    href: "/alchemy/visualizer",
    icon: Cpu,
    title: "Simulator",
    description:
      "Interactive visualizer: move sliders to see how the reserve, FIRE, and ICE respond to market changes.",
    color: "text-orange-400",
  },
  {
    href: "/alchemy/market-precedent",
    icon: TrendingUp,
    title: "Market Precedent",
    description:
      "How STRC, Pendle, Djed, and Ethena validated demand for the product category Alchemy brings on-chain.",
    color: "text-sky-400",
  },
  {
    href: "/alchemy/faq",
    icon: MessageCircleQuestion,
    title: "FAQ",
    description:
      "Common questions about FIRE, ICE, the reserve structure, risk, and redemption mechanics.",
    color: "text-green-400",
  },
  {
    href: "/alchemy/governance",
    icon: Vote,
    title: "Governance",
    description:
      "DRep resources, Cardano strategic case, milestone structure, and how to participate in the vote.",
    color: "text-purple-400",
  },
  {
    href: "/alchemy/technical-implementation",
    icon: Code2,
    title: "Technical Implementation",
    description:
      "How Charms' zkVM-based programmable asset protocol powers FIRE and ICE natively on Cardano.",
    color: "text-cyan-400",
  },
];

export default function AlchemyPage() {
  return (
    <InteractiveGradientBackground>
      <div className="flex flex-col min-h-screen">
        <HeroSection classes="pb-0">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto pt-36">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-300/30 bg-background/40 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-foreground">
              <span className="h-2 w-2 rounded-full bg-green-300" />
              Cardano Treasury Proposal
            </div>
            <Image
              src="/alchemy/v2-gold.png"
              alt="Alchemy"
              width={1050}
              height={350}
              priority
              className="hidden dark:block h-auto w-full sm:w-5/6 md:w-4/5 lg:w-3/4 object-contain"
            />
            <Image
              src="/alchemy/v2-normal.png"
              alt="Alchemy"
              width={1050}
              height={350}
              priority
              className="block dark:hidden h-auto w-full sm:w-5/6 md:w-4/5 lg:w-3/4 object-contain"
            />
            <p className="text-lg md:text-xl text-foreground/90 max-w-2xl">
              Bitcoin reserve infrastructure for Cardano. Two complementary
              assets - FIRE and ICE - backed by a shared BTC reserve, built with
              Charms.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/alchemy/proposal"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background hover:bg-foreground/80 transition-colors"
              >
                Read the Proposal
              </Link>
              <Link
                href="/alchemy/visualizer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-foreground/25 bg-foreground/8 px-8 text-base font-medium text-foreground hover:bg-foreground/15 transition-colors"
              >
                Try the Visualizer
              </Link>
            </div>
          </div>
        </HeroSection>

        {/* FIRE / ICE explainer cards */}
        <Section className="max-w-5xl mx-auto px-4 w-full">
          <div className="grid md:grid-cols-2 gap-5">
            {/* FIRE */}
            <div className="rounded-2xl border border-orange-500/40 bg-background/90 backdrop-blur-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-orange-500/80">
                    BTC+
                  </div>
                  <div className="text-xl font-bold text-orange-500">FIRE</div>
                </div>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">
                The junior reserve-growth asset. FIRE absorbs downside first and
                captures residual upside after ICE liabilities are met -
                higher-beta BTC exposure without margin calls or liquidation
                mechanics.
              </p>
              <div className="rounded-lg bg-background/80 border border-orange-500/30 px-4 py-3 font-mono text-sm text-orange-600 dark:text-orange-400">
                FIRE = (V·P − L) / N<sub>fire</sub>
              </div>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  Junior claim - absorbs volatility first
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  Amplified upside from BTC price appreciation
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  No margin calls or liquidation mechanics
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  Redeemable above 4.0× reserve ratio
                </li>
              </ul>
            </div>

            {/* ICE */}
            <div className="rounded-2xl border border-sky-500/40 bg-background/90 backdrop-blur-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10">
                  <Snowflake className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-sky-500/80">
                    BTC−
                  </div>
                  <div className="text-xl font-bold text-sky-500">ICE</div>
                </div>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">
                The senior BTC-backed claim. ICE is a lower-volatility,
                USD-denominated asset with formulaic growth funded by the
                reserve structure. Not short Bitcoin - the senior claim in the
                reserve.
              </p>
              <div className="rounded-lg bg-background/80 border border-sky-500/30 px-4 py-3 font-mono text-sm text-sky-600 dark:text-sky-300">
                r = (V·P) / L &nbsp;&nbsp;|&nbsp;&nbsp; Target: 4.0×
              </div>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                  Senior claim - protected from downside first
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                  Lower volatility, USD-denominated
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                  Formulaic growth funded by reserve structure
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                  Redeemable above 2.0× reserve ratio
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Stats strip */}
        <Section className="max-w-5xl mx-auto px-4 w-full">
          <div className="rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm px-6 py-5">
            <div className="grid grid-cols-3 text-center items-center">
              <div>
                <div className="text-3xl font-bold text-foreground">$2.0M</div>
                <div className="text-xs text-foreground/70 mt-1 uppercase tracking-widest">
                  Requested Funding
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/alchemy/v2-badge.png"
                  alt="Alchemy"
                  width={160}
                  height={160}
                  className="h-auto w-16 object-contain"
                />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">9.3M</div>
                <div className="text-xs text-foreground/70 mt-1 uppercase tracking-widest">
                  ADA Equivalent
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Subpage navigation */}
        <Section className="max-w-5xl mx-auto px-4 w-full">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60 mb-2">
              Explore
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Learn More About Alchemy
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subpages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  {...(page.href.startsWith("http") && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  className="group rounded-xl border border-foreground/15 bg-background/80 backdrop-blur-sm p-5 flex flex-col gap-3 hover:border-foreground/25 hover:bg-background/90 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-foreground/15 bg-foreground/5 ${page.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {page.href.startsWith("http") ? (
                      <ExternalLink className="h-4 w-4 text-foreground/50 group-hover:text-foreground/80 transition-colors" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-foreground/50 group-hover:text-foreground/80 transition-colors" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {page.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/75">
                      {page.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>

        {/* Partners */}
        <Section className="max-w-5xl mx-auto px-4 w-full pb-24">
          <AlchemyLogoStrip />
        </Section>
      </div>
    </InteractiveGradientBackground>
  );
}
