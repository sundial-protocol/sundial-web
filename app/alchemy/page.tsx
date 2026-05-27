import { HeroSection } from "@/components/ui/hero-section";
import { Section } from "@/components/ui/section";
import Link from "next/link";
import {
  BookOpen,
  Cpu,
  TrendingUp,
  MessageCircleQuestion,
  Vote,
  ArrowRight,
  Flame,
  Snowflake,
} from "lucide-react";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";

const subpages = [
  {
    href: "/alchemy/proposal",
    icon: BookOpen,
    title: "The Proposal",
    description:
      "Read the full Cardano treasury proposal — funding structure, milestones, and accountability.",
    color: "text-primary",
  },
  {
    href: "/alchemy/visualizer",
    icon: Cpu,
    title: "System Visualizer",
    description:
      "Interactive simulator: move sliders to see how the reserve, FIRE, and ICE respond to market changes.",
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
];

export default function AlchemyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SunbeamBackground
        beams={[
          {
            styles: {
              top: "-200px",
              height: "800px",
              background:
                "linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 28%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 75%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(-100% 0%, 100% 8%, 100% 60%, 0% 100%)",
              opacity: "0.15",
            },
          },
        ]}
      >
        <HeroSection classes="pb-0">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto pt-36">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Cardano Treasury Proposal
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter">
              Alchemy
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl">
              Bitcoin reserve infrastructure for Cardano. Two complementary
              assets — FIRE and ICE — backed by a shared BTC reserve, built with
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
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-medium text-foreground hover:bg-white/10 transition-colors"
              >
                Try the Visualizer
              </Link>
            </div>
          </div>
        </HeroSection>
      </SunbeamBackground>

      {/* FIRE / ICE explainer cards */}
      <Section className="max-w-5xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-2 gap-5">
          {/* FIRE */}
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-orange-400/60">
                  BTC+
                </div>
                <div className="text-xl font-bold text-orange-400">FIRE</div>
              </div>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              The junior reserve-growth asset. FIRE absorbs downside first and
              captures residual upside after ICE liabilities are met —
              higher-beta BTC exposure without margin calls or liquidation
              mechanics.
            </p>
            <div className="rounded-lg bg-background/50 border border-orange-500/10 px-4 py-3 font-mono text-sm text-orange-300">
              FIRE = (V·P − L) / N<sub>fire</sub>
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/60">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                Junior claim — absorbs volatility first
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
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10">
                <Snowflake className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-sky-400/60">
                  BTC−
                </div>
                <div className="text-xl font-bold text-sky-400">ICE</div>
              </div>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              The senior BTC-backed claim. ICE is a lower-volatility,
              USD-denominated asset with formulaic growth funded by the reserve
              structure. Not short Bitcoin — the senior claim in the reserve.
            </p>
            <div className="rounded-lg bg-background/50 border border-sky-500/10 px-4 py-3 font-mono text-sm text-sky-300">
              r = (V·P) / L &nbsp;&nbsp;|&nbsp;&nbsp; Target: 4.0×
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/60">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                Senior claim — protected from downside first
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
        <div className="rounded-xl border border-white/10 bg-secondary/50 px-6 py-5">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">4.0×</div>
              <div className="text-xs text-foreground/50 mt-1 uppercase tracking-widest">
                Target Reserve
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">$2.0M</div>
              <div className="text-xs text-foreground/50 mt-1 uppercase tracking-widest">
                Requested Funding
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">8.3M</div>
              <div className="text-xs text-foreground/50 mt-1 uppercase tracking-widest">
                ADA Equivalent
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Subpage navigation */}
      <Section className="max-w-5xl mx-auto px-4 w-full">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-2">
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
                className="group rounded-xl border border-white/10 bg-secondary/60 p-5 flex flex-col gap-3 hover:border-white/20 hover:bg-secondary/80 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 ${page.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {page.title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/60">
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
        <div className="rounded-xl border border-white/10 bg-secondary/40 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground/50 uppercase tracking-widest font-medium">
            Built with
          </p>
          <div className="flex items-center gap-8 text-foreground">
            <span className="text-lg font-bold">Sundial Protocol</span>
            <span className="text-foreground/30 text-xl">×</span>
            <span className="text-lg font-bold">Charms</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
