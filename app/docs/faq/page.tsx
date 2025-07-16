import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";

function Question({ q, a }: { q: string; a: string }) {
  return (
    <Card>
      <CardHeader className="text-xl font-bold">{q}</CardHeader>
      <CardContent className="whitespace-pre-line">{a}</CardContent>
    </Card>
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
              height: "600px", // Match the height of the triangle
              background:
                " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
              clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)", // Triangle shape
              zIndex: "-1",
              opacity: "0.3",
            },
          },
        ]}
      >
        <Section className="py-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">General Questions</h2>
            <div className="space-y-6">
              <Question
                q="What is Sundial?"
                a="Sundial is a blockchain platform that enables Bitcoin staking through a unique dual staking mechanism. It allows Bitcoin holders to earn passive income on their holdings while contributing to the security and decentralization of the network."
              />
              <Question
                q="How does Bitcoin staking work with Sundial?"
                a="Sundial's Bitcoin staking works by allowing users to delegate their Bitcoin to validators who secure the network. In return, stakers earn rewards proportional to their stake. Sundial uses a dual staking mechanism that maximizes yields while maintaining security."
              />
              <Question
                q="Is staking with Sundial secure?"
                a="Yes, staking with Sundial is designed with security as a priority. The platform uses a decentralized network of validators, and all smart contracts have been audited by leading security firms. Additionally, Sundial implements various security measures to protect user funds."
              />
            </div>
          </div>
        </Section>
      </SunbeamBackground>
      <Section className="py-12">
        <h2 className="text-2xl font-bold mb-6">UTXO Backend System Design</h2>
        <div className="space-y-6">
          <Question
            q="Why does Sundial use UTXO as opposed to EVM backend models for running the network?"
            a={`Sundial prioritizes security above all else, with self-custody and true asset ownership as non-negotiable principles. This directly influences our choice of UTXO (Unspent Transaction Output) architecture over the more common EVM-based (Ethereum Virtual Machine) models.\n\nWhy that matters: Over the past few years, billions of dollars have been lost to DeFi exploits on EVM chains, rooted in flaws of the account-based system (reentrancy attacks, global state manipulation, overly composable contracts). The EVM model operates on a shared global state, making systems fragile and highly attackable. Users often don’t have full custody of their assets when contracts execute on their behalf.\n\nSundial does it differently: By building on a UTXO-based architecture, we inherit the core design philosophy that makes Bitcoin secure and predictable: stateless execution, deterministic outcomes, isolated transaction logic, and true self-custody. The network can process multiple parallel transactions and uses zero knowledge proofs for efficiency. This makes UTXO ideal for financial infrastructure where safety, auditability, and reliability are critical.`}
          />
        </div>
      </Section>
      <Section className="py-12">
        {/* Business Model & Revenue */}
        <h2 className="text-2xl font-bold mb-6">Business Model & Revenue</h2>
        <div className="space-y-6">
          <Question
            q="How does Sundial generate revenue?"
            a={`Sundial’s revenue model includes: Protocol Fees (transaction fees on Sundial's Bitcoin-native Layer 2), Institutional Yield Services (white-labeled infrastructure for BTC-native yield products), Liquidity & Bridge Fees (cross-chain asset transfer fees), and SDK/API Licensing (institutional clients integrating Sundial’s middleware).`}
          />
          <Question
            q="What revenue validation has Sundial achieved so far?"
            a={`Sundial has achieved: successful dApp developer integrations on Cardano’s DeFi ecosystem, multiple MOUs/LOIs and pilot engagements with institutional partners, completed demos of permissionless BTC-ADA bridging, early market maker interest for BTC cross-chain swap liquidity, and interest from Bitcoin holders & exchanges for Bitcoin yield.`}
          />
          <Question
            q="Which protocols or partners are committed to using Sundial?"
            a={`Active MOUs and partnerships include: FluidTokens (Cardano DeFi lending & NFT collateralization), Bitlayer, BitcoinOS, IOG (all for cross-Layer-2 BTC infrastructure), and additional signed LOIs with two yield partners, several UTXO DeFi protocols, and one digital asset lending platform (names under NDA).`}
          />
          <Question
            q="What are Sundial’s revenue targets over the next 24 months (post Mainnet)?"
            a={`Targets: 3-5 institutional SDK clients onboarded, $1B total value bridged by month 24, and targeted annualized revenue of $14M+ after year 2.`}
          />
        </div>
      </Section>
      <Section className="py-12">
        {/* Technical Feasibility */}
        <h2 className="text-2xl font-bold mb-6">Technical Feasibility</h2>
        <div className="space-y-6">
          <Question
            q="What evidence supports Sundial’s technical claims?"
            a={`Sundial has completed two successful permissionless BTC-ADA bridge tests, demonstrated full BTC transfer and redemption between Bitcoin mainnet and Cardano, achieved significant throughput increases by leveraging Cardano’s eUTXO model (~200+ TPS target), and demonstrated Layer-2 speed and demo transfers.`}
          />
          <Question
            q="Have any security audits been performed on Sundial’s infrastructure?"
            a={`Internal security reviews are complete for Midgard (Sundial’s open source tech stack). A full third-party BTC ZK bridge audit is scheduled. Security and compliance are embedded from day one to support institutional adoption.`}
          />
          <Question
            q="How much of Sundial’s technical infrastructure is completed?"
            a={`Layer-2 functionality: 75% complete; zkProver Circuits: 50%; Cardano integration: 100%; BTC<>ADA Bridge: Alpha; Settlement Engine: 75%; Institutional SDK: 30%; Security Audits: In progress; Full Mainnet Launch: Targeting Q1 2026.`}
          />
          <Question
            q="Who are your technical partners and advisors?"
            a={`Partners and advisors include: Anastasia Labs, FluidTokens, Bitlayer, BitcoinOS, Check Point, Appold, independent research contributors from IOG, and cryptographic consultants for ZK expertise.`}
          />
        </div>
      </Section>
      <Section className="py-12">
        {/* Regulatory & Compliance */}
        <h2 className="text-2xl font-bold mb-6">Regulatory & Compliance</h2>
        <div className="space-y-6">
          <Question
            q="Why did Sundial pivot away from tokenization?"
            a={`Due to growing regulatory uncertainty around tokenized securities, complex and expensive compliance regimes, and a strategic shift toward non-custodial middleware (bridges, rollups, SDKs) with lower regulatory exposure. Using Bitcoin as the primary currency is highly attractive for the wider market.`}
          />
          <Question
            q="Which jurisdictions does Sundial operate in?"
            a={`Singapore (primary entity), Hong Kong (financial partnerships), Switzerland (planned technical partnerships), Cayman Islands/BVI (planned IP holding/foundation structure).`}
          />
          <Question
            q="What legal frameworks apply to Sundial’s model?"
            a={`Singapore Payment Services Act (mostly exempt activities), Hong Kong VASP regulations (not directly applicable), US MSB & CFTC frameworks (under review), and no retail securities issuance.`}
          />
          <Question
            q="Who handles Sundial’s legal and compliance affairs?"
            a={`Rajah & Tann (Singapore counsel), Wilson Sonsini (US counsel), institutional KYC providers integrated into the SDK stack, and Check Point (internal transaction monitoring and compliance).`}
          />
        </div>
      </Section>
      <Section className="py-12">
        {/* Financial Structure & Funding */}
        <h2 className="text-2xl font-bold mb-6">
          Financial Structure & Funding
        </h2>
        <div className="space-y-6">
          <Question
            q="How were funds allocated for the $4M round?"
            a={`Engineering: 46%, Operations: 30%, Marketing and Community: 16%, Legal and Compliance: 8%. The raise prioritized core engineering, audits, and SDK development.`}
          />
          <Question
            q="What deliverables were committed under your ADA grant?"
            a={`Milestone 1: Core business establishment, partnerships, litepaper. Milestone 2: BTC-ADA permissionless bridge demo. 50% complete: fine-tuned tech specs, security audits, etc.`}
          />
          <Question
            q="What is your estimated runway at current burn?"
            a={`Current burn: ~$50K/month. Runway: ~18 months fully funded.`}
          />
          <Question
            q="How do you justify your $40M valuation?"
            a={`Extensive day-1 ecosystem, committed partners for BTC staking and node operations, proven IP across BTC<>ADA bridges and zkRollup, de-risked regulatory posture, growing institutional interest, and first-mover advantage in Bitcoin-native rollup and cross-chain interoperability.`}
          />
          <Question
            q="What are your latest financial projections (annualised)?"
            a={`12M: Revenue +$6m, TVL $200m, Transaction Volume 2m. 24M: Revenue +$14m, TVL $400m+, Transaction Volume 10m+.`}
          />
        </div>
      </Section>
      <Section className="py-12">
        {/* Risk Factors */}
        <h2 className="text-2xl font-bold mb-6">Risk Factors</h2>
        <div className="space-y-6">
          <Question
            q="How does Sundial manage technical development risk?"
            a={`Modular architecture allows phased deployment (bridge-first if zkRollup is delayed). SDK and middleware monetization can proceed independently. Active partnerships reduce competitive isolation.`}
          />
          <Question
            q="How resilient is the business model to market downturns?"
            a={`BTC-native infrastructure targets conservative institutional holders, not dependent on speculative token volumes or synthetic yield farming. Revenue is diversified and not reliant on mass market adoption.`}
          />
          <Question
            q="Is there key person risk?"
            a={`Core engineering team has multi-year retention agreements, technical knowledge is shared across senior engineers, and succession plans are in place.`}
          />
        </div>
      </Section>
    </div>
  );
}
