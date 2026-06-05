import Link from "next/link";
import {
  ArrowLeft,
  Vote,
  Shield,
  TrendingUp,
  Cpu,
  Users,
  BarChart2,
  BookOpen,
  Award,
  Bitcoin,
} from "lucide-react";
import InteractiveGradientBackground from "@/components/ui/interactive-gradient-bg";
import { AlchemyTable } from "@/components/ui/alchemy-table";
import { AlchemyFeatureCard } from "@/components/ui/alchemy-feature-card";

const benefits = [
  {
    icon: TrendingUp,
    title: "Early BTCfi Wedge",
    description:
      "Most Bitcoin DeFi infrastructure is being built outside Cardano. Alchemy gives Cardano a first-mover position in on-chain structured BTC exposure before the BTCfi category matures.",
    colorClasses: "border-orange-500/30 bg-background/85",
    accentClass: "text-orange-400",
  },
  {
    icon: Cpu,
    title: "Reusable DeFi Primitive",
    description:
      "FIRE and ICE are composable Cardano-native assets. Once live, wallets, DEXs, dashboards, and future BTC-facing Cardano applications can build on top of them - extending the ecosystem beyond just this protocol.",
    colorClasses: "border-sky-500/30 bg-background/85",
    accentClass: "text-sky-400",
  },
  {
    icon: BarChart2,
    title: "Transparent Reserve Infrastructure",
    description:
      "Reserve ratio, asset supply, fee flows, liquidity health, integrations, and milestone status are reported publicly through always-on dashboards and monthly governance updates.",
    colorClasses: "border-green-500/30 bg-background/85",
    accentClass: "text-green-400",
  },
  {
    icon: Shield,
    title: "Matching Capital Catalysis",
    description:
      "$1.0M in treasury-supported launch liquidity catalyzes a larger BTCfi liquidity base with matching outside capital - amplifying the treasury's impact beyond the direct deployment.",
    colorClasses: "border-primary/30 bg-background/85",
    accentClass: "text-primary",
  },
  {
    icon: Users,
    title: "Proven Demand Signal",
    description:
      "STRC, Pendle, Djed, and Ethena have all validated market demand for BTC-backed structured products and reserve-ratio systems. Alchemy brings that proven product logic to Cardano natively.",
    colorClasses: "border-purple-500/30 bg-background/85",
    accentClass: "text-purple-400",
  },
  //{
  //  icon: Award,
  //  title: "Teams that Deliver",
  //  description:
  //    "Two venture-backed startups with top-tier audits, multiple live protocols, thousands of users and deep institutional connections. Charms & Sundial have the expertise needed to execute.",
  //  colorClasses: "border-yellow-500/30 bg-background/85",
  //  accentClass: "text-yellow-400",
  //},
  {
    icon: Bitcoin,
    title: "Diversify the Treasury",
    description:
      "The $1.0M liquidity position puts idle ADA to work in a BTC-backed reserve, generating yield that returns to the Treasury quarterly — adding a new productive asset class to Cardano's balance sheet.",
    colorClasses: "border-orange-500/30 bg-background/85",
    accentClass: "text-orange-400",
  },
];

const milestones = [
  {
    id: "M1",
    pct: "10%",
    approx: "~$200K",
    description:
      "Design, economic modeling, audit scope, and Charms integration scope finalized.",
  },
  {
    id: "M2",
    pct: "25%",
    approx: "~$500K",
    description:
      "Testnet live; FIRE and ICE functional on testnet; dashboards and reporting operational.",
  },
  {
    id: "M3",
    pct: "15%",
    approx: "~$300K",
    description:
      "Security audit passed; economic model reviewed; reserve thresholds confirmed.",
  },
  {
    id: "M4",
    pct: "12.5%",
    approx: "~$250K",
    description:
      "Mainnet launch; DEX integrations live; governance reporting operational.",
  },
  {
    id: "M5",
    pct: "12.5%",
    approx: "~$250K",
    description:
      "30-day public report published; all internal benchmarks and test requirements passed.",
  },
  {
    id: "M6",
    pct: "25%",
    approx: "~$500K",
    description:
      "Final milestone - details to be confirmed at proposal submission.",
  },
];

const liquidityStages = [
  {
    month: "Month 1",
    amount: "$250K",
    condition:
      "After independent audit passed and launch-readiness review complete.",
  },
  {
    month: "Month 2",
    amount: "$250K",
    condition:
      "After public reporting, operational review, and 30-day performance grace period.",
  },
  {
    month: "Month 3",
    amount: "$500K",
    condition:
      "After mint/redeem threshold confirmation, reserve ratio tracking, growth monitoring, and dashboard performance review.",
  },
];

export default function AlchemyGovernancePage() {
  return (
    <InteractiveGradientBackground>
      <div className="container mx-auto pt-36 pb-24 px-4 max-w-4xl">
        <div className="mb-4">
          <Link
            href="/alchemy"
            className="inline-flex items-center gap-1.5 text-xs text-foreground/70 hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Alchemy
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/25 px-4 py-1.5 text-sm font-medium text-purple-400 mb-5">
            <Vote className="h-4 w-4" />
            DRep Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Governance
          </h1>
          <p className="text-lg text-foreground/85 max-w-2xl leading-relaxed">
            A strategic investment in Cardano's Bitcoin position. Here you will
            find the case for a Yes vote, the full funding structure, milestone
            schedule, and how to participate.
          </p>
        </div>

        {/* Why This Benefits Cardano */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Why This Benefits Cardano
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b) => (
              <AlchemyFeatureCard
                key={b.title}
                icon={b.icon}
                title={b.title}
                body={b.description}
                colorClasses={b.colorClasses}
                accentClass={b.accentClass}
              />
            ))}
          </div>
        </div>

        {/* Funding structure */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Funding Structure
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-primary/20 bg-background/85 p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary/80 mb-1">
                Pool A
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                $1.0M
              </div>
              <div className="font-medium text-foreground/80 mb-3">
                Launch Liquidity
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Deployed in three staged tranches with mandatory audit gates,
                operational reviews, and dashboard performance conditions.
                Tracked separately from Pool B at all times.
              </p>
            </div>
            <div className="rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-foreground/60 mb-1">
                Pool B
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                $1.0M
              </div>
              <div className="font-medium text-foreground/80 mb-3">
                Delivery Budget
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Covers engineering, design, security audits, economic review,
                legal setup, and operational costs. Released in six milestones
                over the project duration.
              </p>
            </div>
          </div>
        </div>

        {/* Milestone schedule */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Milestone Schedule
          </h2>
          <AlchemyTable
            columns={[
              { label: "Milestone" },
              { label: "Share" },
              { label: "Amount" },
              { label: "Deliverables" },
            ]}
            rows={milestones.map((m) => ({
              key: m.id,
              cells: [m.id, m.pct, m.approx, m.description],
              cellClassNames: [
                "font-semibold text-primary",
                "text-foreground/85",
                "text-foreground/85 whitespace-nowrap",
                "text-foreground/80 leading-snug",
              ],
            }))}
          />
        </div>

        {/* Staged liquidity */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Staged Liquidity Deployment
          </h2>
          <p className="text-sm text-foreground/60 mb-6">
            Pool A ($1.0M) is released in three tranches, each requiring
            specific conditions to be met before deployment.
          </p>
          <div className="space-y-3">
            {liquidityStages.map((stage, i) => (
              <div
                key={stage.month}
                className="flex gap-4 rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm p-5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-foreground">
                      {stage.month}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {stage.amount}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {stage.condition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DRep Resources */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/25 p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            DRep Resources
          </h2>
          <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
            The following materials are available to DReps, stake pool
            operators, and ADA holders evaluating this proposal.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Link
              href="/alchemy/proposal"
              className="flex items-center gap-3 rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm p-4 hover:border-foreground/25 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Full Proposal</div>
                <div className="text-xs text-foreground/70">PDF · 16 pages</div>
              </div>
            </Link>
            <Link
              href="/alchemy/faq"
              className="flex items-center gap-3 rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm p-4 hover:border-foreground/25 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Vote className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">FAQ</div>
                <div className="text-xs text-foreground/70">
                  Common governance questions
                </div>
              </div>
            </Link>
          </div>
          <div className="rounded-lg border border-foreground/15 bg-background/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60 mb-1">
              Governance Portal
            </p>
            <p className="text-sm text-foreground/80">
              The on-chain governance action link will be published here when
              the proposal is submitted to the Cardano governance process.
              Monthly reporting updates will also be posted here.
            </p>
          </div>
        </div>
      </div>
    </InteractiveGradientBackground>
  );
}
