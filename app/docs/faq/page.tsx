import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";

function Question({ q, a }: { q: string; a: React.ReactNode[] }) {
  return (
    <Card>
      <CardHeader className="text-xl font-bold">{q}</CardHeader>
      <CardContent>
        {a.map((para, i) => (
          <div key={i} className="mb-2 last:mb-0 whitespace-pre-line">
            {para}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function UtxoSection() {
  return (
    <Section className="py-12">
      <h2 className="text-2xl font-bold mb-6">UTXO Backend System Design</h2>
      <div className="space-y-6">
        <Question
          q="Why does Sundial use UTXO as opposed to EVM backend models for running the network?"
          a={[
            "Sundial prioritizes security above all else, with self-custody and true asset ownership as non-negotiable principles. This directly influences our choice of the UTXO (Unspent Transaction Output) architecture over the more common EVM-based (Ethereum Virtual Machine) models.",
            "Why that matters: Over the past few years, billions of dollars have been lost to DeFi exploits on EVM chains, rooted in flaws of the account-based system (reentrancy attacks, global state manipulation, overly composable contracts). The EVM model operates on a shared global state, making systems fragile and highly attackable. Users often don’t have full custody of their assets when contracts execute on their behalf.",
            "Sundial does it differently: By building on a UTXO-based architecture, we inherit the core design philosophy that makes Bitcoin secure and predictable: stateless execution, deterministic outcomes, isolated transaction logic, and true self-custody. The network can process multiple parallel transactions and zero knowledge proofs with much greater efficiency. This makes UTXO ideal for financial infrastructure where safety, auditability, and reliability are critical.",
          ]}
        />
      </div>
    </Section>
  );
}

function BusinessModelSection() {
  return (
    <Section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Business Model & Revenue</h2>
      <div className="space-y-6">
        <Question
          q="How does Sundial generate revenue?"
          a={[
            "Sundial’s revenue model includes:",
            "• Protocol Fees: Transaction fees on Sundial's Bitcoin-native Layer 2, capturing a portion of every transaction.",
            "• Institutional Yield Services: White-labeled infrastructure for custody providers, asset managers, and lenders to build BTC-native yield products.",
            "• Liquidity & Bridge Fees: Fees from cross-chain asset transfers (BTC, ADA, etc.) using Sundial’s permissionless bridges, and from expedited withdrawals.",
            "• SDK/API Licensing: Revenue from institutional clients integrating Sundial’s middleware into existing infrastructure for custody, settlement, and financial operations.",
          ]}
        />
        <Question
          q="What revenue validation has Sundial achieved so far?"
          a={[
            "Sundial has achieved:",
            "• Successful dApp developer integrations on Cardano’s DeFi ecosystem.",
            "• Multiple MOUs, LOIs, and pilot engagements with institutional partners.",
            "• Completed demos of permissionless BTC-ADA bridging.",
            "• Early market maker interest for BTC cross-chain swap liquidity.",
            "• Interest from Bitcoin holders & exchanges for Bitcoin yield.",
          ]}
        />
        <Question
          q="Which protocols or partners are committed to using Sundial?"
          a={[
            "Active MOUs and partnerships include:",
            "• FluidTokens (Cardano DeFi lending & NFT collateralization)",
            "• Bitlayer, BitcoinOS, IOG (cross-Layer-2 BTC infrastructure)",
            "• Additional signed LOIs with two yield partners, several UTXO DeFi protocols, and one digital asset lending platform (names disclosed under NDA).",
          ]}
        />
        <Question
          q="What are Sundial’s revenue targets over the next 24 months (post Mainnet)?"
          a={[
            "Targets:",
            "• 3-5 institutional SDK clients onboarded",
            "• $1B total value bridged by month 24",
            "• Targeted annualized revenue of $14M+ after year 2.",
          ]}
        />
      </div>
    </Section>
  );
}

function TechnicalFeasibilitySection() {
  return (
    <Section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Technical Feasibility</h2>
      <div className="space-y-6">
        <Question
          q="What evidence supports Sundial’s technical claims?"
          a={[
            "• Completed two successful permissionless BTC-ADA bridge tests using BitcoinOS stack (Charms) and IOG’s stack (Cardinal).",
            "• Demonstrated full BTC transfer and redemption between Bitcoin mainnet and Cardano.",
            "• Achieving significant throughput increases vs Bitcoin’s base layer by leveraging Cardano’s eUTXO model for parallel processing (~200+ TPS target for BTC-native settlement).",
            "• Demonstrated Layer-2 speed, functionality and demo transfers.",
          ]}
        />
        <Question
          q="Have any security audits been performed on Sundial’s infrastructure?"
          a={[
            "Internal security reviews are complete for Midgard (Sundial’s open source tech stack). A full third-party BTC ZK bridge audit is scheduled. Security and compliance are embedded from day one to support institutional adoption.",
          ]}
        />
        <Question
          q="How much of Sundial’s technical infrastructure is completed?"
          a={[
            <table key="infra-table" className="text-left text-sm mb-4">
              <thead>
                <tr>
                  <th className="py-2 px-3 border-b-2">Module</th>
                  <th className="py-2 px-3 border-b-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1 px-3 border-b">Layer-2 functionality</td>
                  <td className="py-1 px-3 border-b">75% complete</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 border-b">zkProver Circuits</td>
                  <td className="py-1 px-3 border-b">50% complete</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 border-b">Cardano integration</td>
                  <td className="py-1 px-3 border-b">100% complete</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 border-b">BTC&lt;&gt;ADA Bridge</td>
                  <td className="py-1 px-3 border-b">Alpha</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 border-b">Settlement Engine</td>
                  <td className="py-1 px-3 border-b">75% complete</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 border-b">Institutional SDK</td>
                  <td className="py-1 px-3 border-b">30% complete</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 border-b">Security Audits</td>
                  <td className="py-1 px-3 border-b">In progress</td>
                </tr>
                <tr>
                  <td className="py-1 px-3">Full Mainnet Launch</td>
                  <td className="py-1 px-3">Targeting Q1 2026</td>
                </tr>
              </tbody>
            </table>,
          ]}
        />
        <Question
          q="Who are your technical partners and advisors?"
          a={[
            "Partners and advisors include:",
            "• Anastasia Labs",
            "• FluidTokens",
            "• Bitlayer",
            "• BitcoinOS",
            "• Check Point",
            "• Appold",
            "• Independent research contributors from IOG",
            "• Cryptographic consultants for ZK expertise.",
          ]}
        />
      </div>
    </Section>
  );
}

function RegulatorySection() {
  return (
    <Section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Regulatory & Compliance</h2>
      <div className="space-y-6">
        <Question
          q="Why did Sundial pivot away from tokenization?"
          a={[
            "Due to growing regulatory uncertainty around tokenized securities, complex and expensive compliance regimes, and a strategic shift toward non-custodial middleware (bridges, rollups, SDKs) with lower regulatory exposure. Using Bitcoin as the primary currency is highly attractive for the wider market.",
          ]}
        />
        <Question
          q="Which jurisdictions does Sundial operate in?"
          a={[
            "• Singapore (primary entity)",
            "• Hong Kong (financial partnerships)",
            "• Switzerland (planned technical partnerships)",
            "• Cayman Islands/BVI (planned IP holding/foundation structure)",
          ]}
        />
        <Question
          q="What legal frameworks apply to Sundial’s model?"
          a={[
            "• Singapore Payment Services Act (mostly exempt activities)",
            "• Hong Kong VASP regulations (not directly applicable)",
            "• US MSB & CFTC frameworks (under review)",
            "• No retail securities issuance",
          ]}
        />
        <Question
          q="Who handles Sundial’s legal and compliance affairs?"
          a={[
            "• Rajah & Tann (Singapore counsel)",
            "• Wilson Sonsini (US counsel)",
            "• Institutional KYC providers integrated into the SDK stack",
            "• Check Point (internal transaction monitoring and compliance)",
          ]}
        />
      </div>
    </Section>
  );
}

function FinancialSection() {
  return (
    <Section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Financial Structure & Funding</h2>
      <div className="space-y-6">
        <Question
          q="How were funds allocated for the $4M round?"
          a={[
            "Engineering: 46%",
            "Operations: 30%",
            "Marketing and Community: 16%",
            "Legal and Compliance: 8%",
            "The raise prioritized core engineering, audits, and SDK development.",
          ]}
        />
        <Question
          q="What deliverables were committed under your ADA grant?"
          a={[
            "\u2713 Milestone 1: Core business establishment, partnerships, litepaper.",
            "\u2713 Milestone 2: BTC-ADA permissionless bridge demo.",
            "50% complete: fine-tuned tech specs, security audits, etc.",
          ]}
        />
        <Question
          q="What is your estimated runway at current burn?"
          a={["Current burn: ~$50K/month.", "Runway: ~18 months fully funded."]}
        />
        <Question
          q="How do you justify your $40M valuation?"
          a={[
            "• Extensive day-1 ecosystem of users, wallets, DeFi functionality, liquidity, and Dapps.",
            "• Committed partners for BTC for non-custodial staking and node operations.",
            "• Proven IP across BTC<>ADA bridges and zkRollup architecture.",
            "• De-risked regulatory posture post-tokenization pivot.",
            "• Growing institutional interest with LOIs in place.",
            "• First-mover advantage in Bitcoin-native rollup + cross-chain interoperability space.",
          ]}
        />
        <Question
          q="What are your latest financial projections (annualised)?"
          a={[
            <table key="proj-table" className="text-left text-sm mb-4">
              <thead>
                <tr>
                  <th className="py-2 px-3 border-b-2">Metric</th>
                  <th className="py-2 px-3 border-b-2">12M</th>
                  <th className="py-2 px-3 border-b-2">24M</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1 px-3 border-b">Revenue</td>
                  <td className="py-1 px-3 border-b">+$6m</td>
                  <td className="py-1 px-3 border-b">+$14m</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 border-b">TVL</td>
                  <td className="py-1 px-3 border-b">$200m</td>
                  <td className="py-1 px-3 border-b">$400m+</td>
                </tr>
                <tr>
                  <td className="py-1 px-3">Transaction Volume</td>
                  <td className="py-1 px-3">2m</td>
                  <td className="py-1 px-3">10m+</td>
                </tr>
              </tbody>
            </table>,
          ]}
        />
      </div>
    </Section>
  );
}

function RiskSection() {
  return (
    <Section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Risk Factors</h2>
      <div className="space-y-6">
        <Question
          q="How does Sundial manage technical development risk?"
          a={[
            "• Modular architecture allows for phased deployment (bridge-first if zkRollup is delayed).",
            "• SDK and middleware monetization can proceed independently of full rollup deployment.",
            "• Active partnerships (Check Point, Anastasia Labs, Bitlayer, BitcoinOS, FluidTokens) reduce competitive isolation.",
          ]}
        />
        <Question
          q="How resilient is the business model to market downturns?"
          a={[
            "• BTC-native infrastructure targets more conservative institutional Bitcoin holders.",
            "• Not dependent on speculative token volumes or synthetic yield farming.",
            "• Revenue diversified across bridges, SDK licensing, and institutional settlement.",
            "• Institutions to deploy large amounts of Bitcoin, with no need for mass market adoption.",
          ]}
        />
        <Question
          q="Is there key person risk?"
          a={[
            "• Core engineering team has multi-year retention agreements.",
            "• Technical knowledge is shared across multiple senior engineers.",
            "• Founder and executive succession plans in place.",
          ]}
        />
      </div>
    </Section>
  );
}

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection classes="bg-gradient-to-b from-primary/20 to-background">
        <div className="flex flex-col space-y-4">
          <Link
            href="/docs"
            className="inline-flex items-center text-sm font-medium text-foreground/80 hover:text-foreground/50"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Documentation
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 md:text-lg">
              Find answers to common questions about Sundial staking.
            </p>
          </div>
        </div>
      </HeroSection>

      <SunbeamBackground
        beams={[
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "150px",
              width: "100%",
              height: "600px", // Main FAQ triangle
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)", // Triangle shape
              zIndex: "-1",
              opacity: "0.3",
            },
          },
          // Triangle from staking/how-it-works.tsx
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "800px",
              width: "100%",
              height: "700px",
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
              zIndex: "-2",
              opacity: "0.18",
            },
          },
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "1150px",
              width: "100%",
              height: "600px", // Main FAQ triangle
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)", // Triangle shape
              zIndex: "-1",
              opacity: "0.3",
            },
          },
          // Triangle from staking/how-it-works.tsx
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "1500px",
              width: "100%",
              height: "1400px",
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
              zIndex: "-2",
              opacity: "0.18",
            },
          },
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "2150px",
              width: "100%",
              height: "600px", // Main FAQ triangle
              background:
                " linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)", // Triangle shape
              zIndex: "-1",
              opacity: "0.3",
            },
          },
          // Triangle from staking/how-it-works.tsx
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "2800px",
              width: "100%",
              height: "700px",
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
              zIndex: "-2",
              opacity: "0.18",
            },
          },
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "3500px",
              width: "100%",
              height: "700px",
              background:
                " linear-gradient(to left, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
              zIndex: "-2",
              opacity: "0.18",
            },
          },
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "4200px",
              width: "100%",
              height: "600px", // Main FAQ triangle
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)", // Triangle shape
              zIndex: "-1",
              opacity: "0.3",
            },
          },
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "5000px",
              width: "100%",
              height: "900px", // Main FAQ triangle
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(-90% 100%, 100% 0%, 100% 100%)", // Triangle shape
              zIndex: "-1",
              opacity: "0.3",
            },
          },
        ]}
      >
        <UtxoSection />
        <BusinessModelSection />
        <TechnicalFeasibilitySection />
        <RegulatorySection />
        <FinancialSection />
        <RiskSection />
      </SunbeamBackground>
    </div>
  );
}
