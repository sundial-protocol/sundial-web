import Link from "next/link";
import { ArrowLeft, ChevronDown, MessageCircleQuestion } from "lucide-react";
import InteractiveGradientBackground from "@/components/ui/interactive-gradient-bg";
import React from "react";

type FAQItem = { q: string; a: React.ReactNode };

const faqGroups: { title: string; items: FAQItem[] }[] = [
  {
    title: "Understanding Alchemy",
    items: [
      {
        q: "What is Alchemy?",
        a: "Alchemy is a Bitcoin treasury and liquidity system. It creates two reserve-backed assets - FIRE (BTC+) and ICE (BTC−) - from a shared Bitcoin reserve using the Charms protocol and Sundial's BTC platform.",
      },
      {
        q: "What is FIRE (BTC+)?",
        a: (
          <>
            FIRE is the junior reserve-growth asset. It absorbs downside first
            and captures residual upside after ICE liabilities are met -
            providing higher-beta BTC exposure without margin calls or
            liquidation mechanics. Its price is:
            <div className="my-3 rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3 text-center font-mono text-sm text-foreground">
              P<sub>FIRE</sub> = (V · P<sub>BTC</sub> &minus; L) / N
              <sub>FIRE</sub>
            </div>
            where{" "}
            <code className="rounded bg-foreground/8 px-1 py-0.5 font-mono text-xs">
              V
            </code>{" "}
            is vault BTC,{" "}
            <code className="rounded bg-foreground/8 px-1 py-0.5 font-mono text-xs">
              P<sub>BTC</sub>
            </code>{" "}
            is BTC price,{" "}
            <code className="rounded bg-foreground/8 px-1 py-0.5 font-mono text-xs">
              L
            </code>{" "}
            is total ICE liabilities, and{" "}
            <code className="rounded bg-foreground/8 px-1 py-0.5 font-mono text-xs">
              N<sub>FIRE</sub>
            </code>{" "}
            is FIRE token supply.
          </>
        ),
      },
      {
        q: "What is ICE (BTC−)?",
        a: (
          <>
            ICE is the senior BTC-backed claim. It is a lower-volatility,
            USD-denominated asset with priority redemption over FIRE in the
            shared vault. Each ICE token redeems at a fixed face value:
            <div className="my-3 rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3 text-center font-mono text-sm text-foreground">
              P<sub>ICE</sub> = F
            </div>
            where{" "}
            <code className="rounded bg-foreground/8 px-1 py-0.5 font-mono text-xs">
              F
            </code>{" "}
            is the fixed USD face value per ICE token, settled in BTC at the
            prevailing spot price. F grows over time through reserve yield and
            appreciation, but does not capture BTC upside beyond the fixed
            redemption value.
          </>
        ),
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
        a: (
          <>
            The reserve ratio measures total BTC vault value against outstanding
            ICE liabilities:
            <div className="my-3 rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3 text-center font-mono text-sm text-foreground">
              r = V · P<sub>BTC</sub> / L
            </div>
            A 4.0&times; ratio means the vault holds four dollars of BTC for
            every dollar of ICE liability. This overcollateralization protects
            ICE holders and gives FIRE room to capture upside.
          </>
        ),
      },
      {
        q: "What are the three reserve safety zones?",
        a: "Healthy (above 4.0×): FIRE redeemable, ICE mintable, all normal activity enabled. Buffer (2.0× to 4.0×): New ICE minting is paused, FIRE redemption becomes constrained. Locked (below 2.0×): New minting and redemption is constrained to prevent further reserve stress. These thresholds activate automatically based on the live reserve ratio.",
      },
      {
        q: "What happens if BTC price falls sharply?",
        a: "FIRE absorbs the downside first - its value falls proportionally as the vault's residual value above ICE liabilities decreases. ICE is more protected because it holds the senior claim. If the reserve ratio falls below 2.0×, the system automatically activates redemption and minting constraints to prevent further stress. The reserve can only recover through BTC price appreciation or new vault inflows.",
      },
      {
        q: "Can FIRE and ICE be redeemed at any time?",
        a: "Redemption is conditional on the reserve zone. In Healthy (above 4.0×), both assets can be redeemed normally. In Buffer (2.0×–4.0×), FIRE redemption is constrained. In Locked (below 2.0×), redemption gates activate for both assets. This design prevents runs that would destabilize the reserve.",
      },
    ],
  },
  {
    title: "Risk",
    items: [
      {
        q: "Is Alchemy risk-free?",
        a: "No. FIRE and ICE are exposed to BTC price risk, reserve health risk, oracle risk, bridge and locker risk, and DeFi liquidity risk. These risks are mitigated through audit gates, always-on public dashboards, reserve constraints, and regular reporting - but they cannot be eliminated entirely.",
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
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-background/40 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-green-400 mb-5">
            <MessageCircleQuestion className="h-4 w-4" />
            Common Questions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            FAQ
          </h1>
          <p className="text-lg text-foreground/90 leading-relaxed">
            Answers to common questions about FIRE, ICE, the reserve system,
            risk, and how it all works.
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
              Explore the reserve mechanics or try the interactive visualizer.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/alchemy/visualizer"
              className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/80 transition-colors"
            >
              Visualizer
            </Link>
          </div>
        </div>
      </div>
    </InteractiveGradientBackground>
  );
}
