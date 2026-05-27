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
} from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Early BTCfi Wedge",
    description:
      "Most Bitcoin DeFi infrastructure is being built outside Cardano. Alchemy gives Cardano a first-mover position in on-chain structured BTC exposure before the BTCfi category matures.",
    color: "border-orange-500/20 bg-orange-500/5 text-orange-400",
  },
  {
    icon: Cpu,
    title: "Reusable DeFi Primitive",
    description:
      "FIRE and ICE are composable Cardano-native assets. Once live, wallets, DEXs, dashboards, and future BTC-facing Cardano applications can build on top of them — extending the ecosystem beyond just this protocol.",
    color: "border-sky-500/20 bg-sky-500/5 text-sky-400",
  },
  {
    icon: BarChart2,
    title: "Transparent Reserve Infrastructure",
    description:
      "Reserve ratio, asset supply, fee flows, liquidity health, integrations, and milestone status are reported publicly through always-on dashboards and monthly governance updates.",
    color: "border-green-500/20 bg-green-500/5 text-green-400",
  },
  {
    icon: Shield,
    title: "Matching Capital Catalysis",
    description:
      "$1.0M in treasury-supported launch liquidity catalyzes a larger BTCfi liquidity base with matching outside capital — amplifying the treasury's impact beyond the direct deployment.",
    color: "border-primary/20 bg-primary/5 text-primary",
  },
  {
    icon: Users,
    title: "Proven Demand Signal",
    description:
      "STRC, Pendle, Djed, and Ethena have all validated market demand for BTC-backed structured products and reserve-ratio systems. Alchemy brings that proven product logic to Cardano natively.",
    color: "border-purple-500/20 bg-purple-500/5 text-purple-400",
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
      "Final milestone — details to be confirmed at proposal submission.",
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
    <div className="container mx-auto pt-36 pb-24 px-4 max-w-4xl">
      <div className="mb-4">
        <Link
          href="/alchemy"
          className="inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Alchemy
        </Link>
      </div>

      {/* Hero */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-sm font-medium text-purple-400 mb-5">
          <Vote className="h-4 w-4" />
          DRep Resources
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Governance
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl leading-relaxed">
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
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`rounded-xl border p-5 ${b.color.split(" ")[0]} ${b.color.split(" ")[1]}`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 mb-3 ${b.color.split(" ")[2]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">
                  {b.title}
                </h3>
                <p className="text-sm text-foreground/65 leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funding structure */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Funding Structure
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-1">
              Pool A
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">$1.0M</div>
            <div className="font-medium text-foreground/80 mb-3">
              Launch Liquidity
            </div>
            <p className="text-sm text-foreground/65 leading-relaxed">
              Deployed in three staged tranches with mandatory audit gates,
              operational reviews, and dashboard performance conditions. Tracked
              separately from Pool B at all times.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-secondary/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-1">
              Pool B
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">$1.0M</div>
            <div className="font-medium text-foreground/80 mb-3">
              Delivery Budget
            </div>
            <p className="text-sm text-foreground/65 leading-relaxed">
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
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-secondary/60">
                <th className="text-left px-4 py-3 font-medium text-foreground/60">
                  Milestone
                </th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">
                  Share
                </th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">
                  Amount
                </th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">
                  Deliverables
                </th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-white/5 hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-primary">
                    {m.id}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">{m.pct}</td>
                  <td className="px-4 py-3 text-foreground/80 whitespace-nowrap">
                    {m.approx}
                  </td>
                  <td className="px-4 py-3 text-foreground/65 leading-snug">
                    {m.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staged liquidity */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Staged Liquidity Deployment
        </h2>
        <p className="text-sm text-foreground/60 mb-6">
          Pool A ($1.0M) is released in three tranches, each requiring specific
          conditions to be met before deployment.
        </p>
        <div className="space-y-3">
          {liquidityStages.map((stage, i) => (
            <div
              key={stage.month}
              className="flex gap-4 rounded-xl border border-white/10 bg-secondary/50 p-5"
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
                <p className="text-sm text-foreground/65">{stage.condition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DRep Resources */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          DRep Resources
        </h2>
        <p className="text-sm text-foreground/65 mb-6 leading-relaxed">
          The following materials are available to DReps, stake pool operators,
          and ADA holders evaluating this proposal.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/alchemy/proposal"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-secondary/50 p-4 hover:border-white/20 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-foreground">Full Proposal</div>
              <div className="text-xs text-foreground/50">PDF · 16 pages</div>
            </div>
          </Link>
          <Link
            href="/alchemy/faq"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-secondary/50 p-4 hover:border-white/20 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Vote className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-foreground">FAQ</div>
              <div className="text-xs text-foreground/50">
                Common governance questions
              </div>
            </div>
          </Link>
        </div>
        <div className="rounded-lg border border-white/10 bg-background/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-1">
            Governance Portal
          </p>
          <p className="text-sm text-foreground/65">
            The on-chain governance action link will be published here when the
            proposal is submitted to the Cardano governance process. Monthly
            reporting updates will also be posted here.
          </p>
        </div>
      </div>
    </div>
  );
}
