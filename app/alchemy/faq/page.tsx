import Link from "next/link";
import { ArrowLeft, ChevronDown, MessageCircleQuestion } from "lucide-react";
import InteractiveGradientBackground from "@/components/ui/interactive-gradient-bg";

type FAQItem = { q: string; a: string };

const faqGroups: { title: string; items: FAQItem[] }[] = [
  {
    title: "Understanding Alchemy",
    items: [
      {
        q: "What is Alchemy?",
        a: "Alchemy is a Cardano-native Bitcoin treasury and liquidity system. It creates two reserve-backed assets — FIRE (BTC+) and ICE (BTC−) — from a shared Bitcoin reserve using the Charms protocol and Sundial's BTC platform. The system is being proposed for Cardano treasury funding to launch initial liquidity.",
      },
      {
        q: "What is FIRE (BTC+)?",
        a: "FIRE is the junior reserve-growth asset. It absorbs downside first and captures residual upside after ICE liabilities are met — providing higher-beta BTC exposure without margin calls or liquidation mechanics. Its price is calculated as (V·P − L) / N_fire, where V is vault BTC, P is BTC price, L is total ICE liabilities, and N_fire is FIRE token supply.",
      },
      {
        q: "What is ICE (BTC−)?",
        a: "ICE is the senior BTC-backed claim. It is a lower-volatility, USD-denominated asset with formulaic growth funded by the reserve structure. ICE has priority redemption over FIRE in the shared vault.",
      },
      {
        q: 'Is ICE "short Bitcoin"?',
        a: "No. ICE does not bet against Bitcoin's price. It is the senior claim in a reserve structure backed by BTC. Bitcoin going up is positive for the reserve; ICE simply takes a more conservative, senior-priority position on those gains. Holding ICE is structurally closer to holding a senior secured bond than a short position.",
      },
    ],
  },
  {
    title: "Reserve Mechanics",
    items: [
      {
        q: "What is the reserve ratio and why does it matter?",
        a: "The reserve ratio (r = V·P / L) measures total BTC vault value against outstanding ICE liabilities. A 4.0× ratio means the vault holds four dollars of BTC for every dollar of ICE liability. This overcollateralization protects ICE holders and gives FIRE room to capture upside. The 4.0× target was chosen based on stress-test scenarios.",
      },
      {
        q: "What are the three reserve safety zones?",
        a: "Healthy (above 4.0×): FIRE redeemable, ICE mintable, all normal activity enabled. Buffer (2.0× to 4.0×): New ICE minting is paused, FIRE redemption becomes constrained. Locked (below 2.0×): New minting and redemption is constrained to prevent further reserve stress. These thresholds activate automatically based on the live reserve ratio.",
      },
      {
        q: "What happens if BTC price falls sharply?",
        a: "FIRE absorbs the downside first — its value falls proportionally as the vault's residual value above ICE liabilities decreases. ICE is more protected because it holds the senior claim. If the reserve ratio falls below 2.0×, the system automatically activates redemption and minting constraints to prevent further stress. The reserve can only recover through BTC price appreciation or new vault inflows.",
      },
      {
        q: "Can FIRE and ICE be redeemed at any time?",
        a: "Redemption is conditional on the reserve zone. In Healthy (above 4.0×), both assets can be redeemed normally. In Buffer (2.0×–4.0×), FIRE redemption is constrained. In Locked (below 2.0×), redemption gates activate for both assets. This design prevents runs that would destabilize the reserve.",
      },
    ],
  },
  {
    title: "Governance & Risk",
    items: [
      {
        q: "How is the Cardano treasury's money protected?",
        a: "Launch liquidity is deployed in three tranches: $250K after audit and launch-readiness review; $250K after public reporting, operational review, and a 30-day grace period; and $500K after mint/redeem thresholds, reserve ratio tracking, growth monitoring, and dashboard performance are confirmed. The $1M liquidity pool is separately tracked from the $1M delivery budget.",
      },
      {
        q: "Who audits the protocol?",
        a: "Sundial's BTC platform and locker components are already Hacken-audited and live on testnet. Before mainnet launch, the Alchemy protocol will undergo an independent security review covering protocol logic, reserve thresholds, smart-contract execution, oracle dependencies, and economic assumptions.",
      },
      {
        q: "What happens when Alchemy's TVL reaches $60M?",
        a: "Sundial will submit a formal governance proposal, allowing DReps and the Constitutional Committee to vote on whether to return the full $1.0M principal to the Treasury ADA wallet. If approved, Sundial converts all funds back to ADA via Cardano-native DEXs at prevailing rates.",
      },
      {
        q: "Is this a risk-free investment for Cardano?",
        a: "No. Treasury-supported liquidity is deployed into a protocol exposed to BTC price risk, reserve health risk, oracle risk, bridge and locker risk, and DeFi liquidity risk. These risks are mitigated through staged deployment, audit gates, always-on public dashboards, reserve constraints, and monthly governance reporting — but they cannot be eliminated entirely.",
      },
    ],
  },
];

export default function AlchemyFAQ() {
  return (
    <InteractiveGradientBackground>
      <div className="container mx-auto pt-36 pb-24 px-4 max-w-3xl">
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
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/25 px-4 py-1.5 text-sm font-medium text-green-400 mb-5">
            <MessageCircleQuestion className="h-4 w-4" />
            Common Questions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            FAQ
          </h1>
          <p className="text-lg text-foreground/90 leading-relaxed">
            Answers to common questions about FIRE, ICE, the reserve system,
            risk, and the Cardano treasury proposal.
          </p>
        </div>

        {/* FAQ groups */}
        <div className="space-y-12 rounded-2xl border border-foreground/10 bg-background/90 backdrop-blur-sm px-6 py-8">
          {faqGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/60 mb-3 pb-3 border-b border-foreground/15">
                {group.title}
              </h2>
              <div>
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="border-b border-foreground/15 group"
                  >
                    <summary className="flex items-start justify-between py-4 cursor-pointer font-medium list-none [&::-webkit-details-marker]:hidden gap-4">
                      <span className="text-foreground leading-snug">
                        {item.q}
                      </span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-foreground/60 transition-transform group-open:rotate-180 mt-0.5" />
                    </summary>
                    <div className="pb-5 pr-9 text-sm text-foreground/85 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">
              Still have questions?
            </p>
            <p className="text-sm text-foreground/85 mt-1">
              Read the full proposal or try the interactive visualizer.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/alchemy/proposal"
              className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/80 transition-colors"
            >
              Read Proposal
            </Link>
            <Link
              href="/alchemy/visualizer"
              className="inline-flex h-9 items-center justify-center rounded-full border border-foreground/25 bg-foreground/8 px-5 text-sm font-medium text-foreground hover:bg-foreground/15 transition-colors"
            >
              Visualizer
            </Link>
          </div>
        </div>
      </div>
    </InteractiveGradientBackground>
  );
}
