import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  ExternalLink,
  Layers,
  Zap,
  Shield,
  GitBranch,
  Box,
  Cpu,
} from "lucide-react";
import InteractiveGradientBackground from "@/components/ui/interactive-gradient-bg";
import { AlchemyTable } from "@/components/ui/alchemy-table";
import { AlchemyFeatureCard } from "@/components/ui/alchemy-feature-card";

const pillars = [
  {
    label: "01",
    icon: Layers,
    title: "eUTXO Architecture",
    colorClasses: "border-sky-500/30 bg-sky-500/25",
    accentClass: "text-sky-400",
    body: "Charms builds directly on Cardano's pioneering extended UTXO model. Each transaction output can carry multiple assets and arbitrary programmable data. Charms are entries in an app → data mapping attached to a UTXO - you can have as many charms per output as you need, and they travel with Bitcoin-level ownership guarantees.",
  },
  {
    label: "02",
    icon: GitBranch,
    title: "Bitcoin Metaprotocols",
    colorClasses: "border-orange-500/30 bg-orange-500/25",
    accentClass: "text-orange-400",
    body: 'Inspired by Ordinals and Runes, Charms creates fully native digital assets using client-side validation. Every Charms transaction contains a "spell" encoded in an OP_RETURN output. Spells are client-side validated - nodes choose to interpret or ignore them, and double-spending is still prevented by Bitcoin itself.',
  },
  {
    label: "03",
    icon: Zap,
    title: "zkVM Technology",
    colorClasses: "border-purple-500/30 bg-purple-500/25",
    accentClass: "text-purple-400",
    body: "Charms app contracts are Rust functions compiled to a zero-knowledge virtual machine. Each spell carries a Groth16 ZK proof attesting to its correctness - that the app contract logic was satisfied. The proof is compact and verifiable by anyone, including on-chain validators on Cardano, without re-executing the logic.",
  },
];

const stack = [
  {
    layer: "Bitcoin",
    role: "Reserve custody",
    detail:
      "Sundial's Hacken-audited BTC lockers hold the shared vault BTC. Bitcoin's UTXO model provides base-layer security; no custodian, no bridge trust assumption.",
    icon: Box,
    color: "text-orange-400",
  },
  {
    layer: "Charms Protocol",
    role: "Token logic & reserve enforcement",
    detail:
      "FIRE and ICE app contracts written in Rust define minting, burning, and redemption rules. Each spell carries a Groth16 proof that reserve constraints were satisfied before state changes occur.",
    icon: Cpu,
    color: "text-purple-400",
  },
  {
    layer: "Charms-Cardano",
    role: "On-chain verification",
    detail:
      "Aiken validators deployed on Cardano verify ZK proofs trustlessly via the Groth16 validator. A main routing contract delegates to versioned validators, with beacon tokens for on-chain discoverability.",
    icon: Shield,
    color: "text-sky-400",
  },
  {
    layer: "Cardano Native Tokens",
    role: "FIRE and ICE token lifecycle",
    detail:
      "FIRE and ICE live as CNTs (Cardano Native Tokens) on Cardano, making them compatible with every Cardano wallet, DEX, and application without bridging or wrapping.",
    icon: Layers,
    color: "text-green-400",
  },
];

const alchemySteps = [
  {
    step: "1",
    title: "FIRE and ICE as Charms Tokens",
    body: "FIRE (BTC+) and ICE (BTC\u2212) are implemented as Charms tokens, derived from Bitcoin-native app contracts. Once beamed to Cardano, they are standard Cardano Native Tokens, compatible with every Cardano wallet and DEX from day one.",
    colorClasses: "border-orange-500/30 bg-orange-500/25",
    accentClass: "text-orange-400",
  },
  {
    step: "2",
    title: "Reserve Rules as App Contracts",
    body: "The minting and redemption logic for FIRE and ICE is encoded as Charms app contracts (Rust). The contract checks: Is the reserve ratio above 4.0\u00d7 before minting ICE? Is it above 4.0\u00d7 before minting FIRE? Is the reserve zone allowing redemption? These rules cannot be bypassed - they are enforced by the ZK proof.",
    colorClasses: "border-green-500/30 bg-green-500/25",
    accentClass: "text-green-400",
  },
  {
    step: "3",
    title: "ZK Proof as On-Chain Enforcement",
    body: "When a user wants to mint or redeem, the Charms prover generates a Groth16 proof off-chain that all reserve constraints were satisfied. This proof is embedded in the transaction spell. Cardano's Charms-Cardano Groth16 validator verifies the proof on-chain before allowing the CNTs to be minted or burned.",
    colorClasses: "border-purple-500/30 bg-purple-500/25",
    accentClass: "text-purple-400",
  },
  {
    step: "4",
    title: "Cardano-Native, No Bridges",
    body: 'FIRE and ICE are created on Cardano as CNTs through the Charms beaming mechanism. The BTC stays on Bitcoin; the token logic runs on Cardano. This is "chain agnostic" in the Charms sense, and it\'s purely user-run software.',
    colorClasses: "border-sky-500/30 bg-sky-500/25",
    accentClass: "text-sky-400",
  },
];

export default function TechnicalImplementationPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-background/40 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-cyan-400 mb-5">
            <Code2 className="h-4 w-4" />
            Powered by Charms
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Technical Implementation
          </h1>
          <p className="text-lg text-foreground/85 max-w-2xl leading-relaxed">
            FIRE and ICE are implemented using the Charms protocol - a
            zkVM-based programmable asset system built on Bitcoin and Cardano.
            This page explains what Charms is, how it works, and exactly how
            Alchemy uses it to enforce reserve mechanics on-chain.
          </p>
        </div>

        {/* What is Charms */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            What is Charms?
          </h2>
          <div className="rounded-2xl border border-foreground/15 bg-background/85 backdrop-blur-sm p-6 md:p-8 mb-5">
            <p className="text-foreground/85 leading-relaxed mb-4">
              Charms is a programmable assets protocol for Bitcoin (and beyond).
              Put simply, charms are programmable tokens on top of Bitcoin UTXOs
              - but with full app contract logic, ZK proof verification, and
              cross-chain portability. No bridges. No wrappers. No trusted third
              parties.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              A single charm is a token, NFT, or instance of arbitrary app
              state. Structurally, it is an entry in a mapping of{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-foreground/90">
                app → data
              </code>{" "}
              living on top of a Bitcoin UTXO. Multiple charms can coexist on
              the same UTXO, creating composable strings of programmable state.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Charms is inspired by Ordinals and Runes but goes further: it adds
              full programmability via ZK-provable app contracts written in
              mainstream languages (Rust), and it deploys those assets natively
              on other chains - including Cardano - under their standard token
              formats (CNTs, ERC-20, SPL) without any bridging infrastructure.
            </p>
          </div>

          {/* Charms credentials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Backed by", value: "Draper Associates" },
              { label: "Live product", value: "eBTC Bridge" },
              { label: "Ecosystems", value: "Bitcoin, Cardano" },
              { label: "Wallet users", value: "3,000+" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm px-4 py-3"
              >
                <div className="text-xs text-foreground/55 uppercase tracking-widest mb-1">
                  {s.label}
                </div>
                <div className="font-semibold text-foreground text-sm">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="https://charms.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              charms.dev
            </Link>
            <Link
              href="https://github.com/CharmsDev/charms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              github.com/CharmsDev/charms
            </Link>
            <Link
              href="https://docs.charms.dev/Charms-whitepaper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Whitepaper
            </Link>
          </div>
        </div>

        {/* How Charms Works */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            How Charms Works
          </h2>
          <p className="text-foreground/75 text-sm mb-6">
            Three innovations combine to make programmable Bitcoin assets
            possible.
          </p>
          <div className="space-y-4">
            {pillars.map((p) => (
              <AlchemyFeatureCard
                key={p.label}
                icon={p.icon}
                label={p.label}
                title={p.title}
                body={p.body}
                colorClasses={p.colorClasses}
                accentClass={p.accentClass}
                layout="horizontal"
              />
            ))}
          </div>
        </div>

        {/* Spells */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Spells - Charms Transactions
          </h2>
          <div className="space-y-4">
            <p className="text-foreground/80 leading-relaxed text-sm">
              Every Charms transaction contains a{" "}
              <strong className="text-foreground">spell</strong> -
              Charms-related metadata stored in an{" "}
              <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs font-mono text-foreground/90">
                OP_RETURN
              </code>{" "}
              output, encoded as a CBOR-encoded{" "}
              <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs font-mono text-foreground/90">
                (NormalizedSpell, Proof)
              </code>{" "}
              tuple. The proof is a Groth16 ZK proof attesting to the
              correctness of the spell.
            </p>
            <p className="text-foreground/80 leading-relaxed text-sm">
              A spell is <strong className="text-foreground">correct</strong> if
              and only if: it is successfully parsed, it makes sense for the
              transaction (no more charm outputs than Bitcoin outputs), and it
              carries a valid ZK proof. Correct spells can mint, burn, and
              transfer tokens. Incorrect spells are simply ignored.
            </p>
            <div className="rounded-xl border border-foreground/15 bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/65 mb-3">
                Spell structure (simplified)
              </p>
              <pre className="text-xs font-mono text-foreground/85 leading-relaxed overflow-x-auto">
                {`version: 11
tx:
  ins:
    - <input_utxo_txid:vout>       # UTXOs being spent
  outs:
    - 0:                           # output 0 carries charm for app[0]
        ticker: FIRE
        amount: 1000
    - 1:                           # output 1 carries charm for app[1]
        ticker: ICE
        amount: 500
app_public_inputs:
  t/<identity>/<vk>:               # FIRE app contract (token type)
    reserve_ratio: 4.2             # public input to ZK proof
  t/<identity>/<vk>:               # ICE app contract`}
              </pre>
            </div>
          </div>
        </div>

        {/* Apps */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            App Contracts
          </h2>
          <p className="text-foreground/80 leading-relaxed text-sm mb-5">
            Each asset type is governed by an{" "}
            <strong className="text-foreground">app contract</strong> - a Rust
            function that defines the rules for minting, burning, and
            transferring. This function is compiled to a zkVM, and a Groth16
            proof is generated off-chain. Anyone can verify the proof; no one
            can fake a compliant spell without satisfying the contract.
          </p>
          <div className="rounded-xl border border-foreground/15 bg-background/80 p-4 mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/65 mb-3">
              App contract signature (Rust)
            </p>
            <pre className="text-xs font-mono text-foreground/90 leading-relaxed overflow-x-auto">
              {`pub fn app_contract(
    app: &App,         // identifies the asset (tag, identity, vk)
    tx:  &Transaction, // the full transaction context
    x:   &Data,        // public inputs (e.g. current reserve ratio)
    w:   &Data,        // private witness (e.g. vault BTC balance)
) -> bool`}
            </pre>
          </div>
          <p className="text-sm text-foreground/75 leading-relaxed">
            The predicate must return{" "}
            <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs font-mono text-foreground/90">
              true
            </code>{" "}
            for the spell to be valid. If all app contracts in the spell are
            satisfied, and all prerequisite transactions had correct spells, the
            spell is accepted and the resulting charms are minted or
            transferred.
          </p>
        </div>

        {/* Charms-Cardano */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Charms on Cardano
          </h2>
          <p className="text-foreground/75 text-sm mb-6">
            The{" "}
            <Link
              href="https://github.com/CharmsDev/charms-cardano"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 underline hover:text-foreground"
            >
              charms-cardano
            </Link>{" "}
            repository implements Charms as Cardano Native Token
            smart-contracts, written in Aiken in collaboration between the
            Charms and Sundial teams.
          </p>
          <AlchemyTable
            showHeader={false}
            columns={[{ label: "Component" }, { label: "Description" }]}
            rows={[
              {
                name: "Main Validator",
                desc: "Routes validation to the appropriate versioned script. Upgradeable by design - new proving systems can be added without breaking existing tokens.",
              },
              {
                name: "Groth16 Validator",
                desc: "Verifies zkSNARK proofs using the Groth16 proving system. Trustless - no ICP verifiers, no multisig, just math. This is the validator Alchemy targets.",
              },
              {
                name: "Scrolls Validator (V1)",
                desc: "Initial version using ICP (Internet Computer) verifiers for signature-based approval. Useful for early deployment before Groth16 is fully optimized.",
              },
              {
                name: "Beacon Token Minting Policy",
                desc: "Manages beacon tokens that enable on-chain discoverability and verification of the delegated validators.",
              },
            ].map((row) => ({
              key: row.name,
              cells: [row.name, row.desc],
              cellClassNames: [
                "w-44 border-r border-foreground/10 font-medium text-foreground align-top",
                "text-foreground/80 leading-snug",
              ],
            }))}
            className="mb-5"
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href="https://github.com/CharmsDev/charms-cardano"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              charms-cardano on GitHub
            </Link>
            <Link
              href="https://docs.charms.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              docs.charms.dev
            </Link>
          </div>
        </div>

        {/* How Alchemy Uses Charms */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            How Alchemy Uses Charms
          </h2>
          <p className="text-foreground/75 text-sm mb-6">
            Charms is the execution layer that makes Alchemy&apos;s reserve
            constraints enforced - not promised.
          </p>
          <div className="space-y-4">
            {alchemySteps.map((item) => (
              <AlchemyFeatureCard
                key={item.step}
                step={item.step}
                title={item.title}
                body={item.body}
                colorClasses={item.colorClasses}
                accentClass={item.accentClass}
              />
            ))}
          </div>
        </div>

        {/* Technical Stack */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Technical Stack
          </h2>
          <AlchemyTable
            showHeader={false}
            columns={[{ label: "Layer" }, { label: "Detail" }]}
            rows={stack.map((row) => {
              const Icon = row.icon;
              return {
                key: row.layer,
                cells: [
                  <div key={row.layer} className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${row.color}`} />
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {row.layer}
                      </div>
                      <div className="text-xs text-foreground/65 mt-0.5">
                        {row.role}
                      </div>
                    </div>
                  </div>,
                  row.detail,
                ],
                cellClassNames: [
                  "w-40 border-r border-foreground/10 align-top",
                  "text-foreground/80 leading-relaxed",
                ],
              };
            })}
          />
        </div>

        {/* Resources */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/25 p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight mb-2">
            Further Reading
          </h2>
          <p className="text-sm text-foreground/75 mb-6">
            Technical documentation, source code, and the Charms whitepaper.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                label: "Charms Whitepaper",
                sub: "Full protocol specification",
                href: "https://docs.charms.dev/Charms-whitepaper.pdf",
              },
              {
                label: "Charms Docs",
                sub: "Guides, concepts, API reference",
                href: "https://docs.charms.dev/",
              },
              {
                label: "charms-cardano",
                sub: "Aiken validators & spec",
                href: "https://github.com/CharmsDev/charms-cardano",
              },
              {
                label: "charms core",
                sub: "Rust app contract SDK",
                href: "https://github.com/CharmsDev/charms",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm px-4 py-3.5 hover:border-foreground/25 transition-colors group"
              >
                <div>
                  <div className="font-medium text-sm text-foreground">
                    {link.label}
                  </div>
                  <div className="text-xs text-foreground/70 mt-0.5">
                    {link.sub}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-foreground/50 group-hover:text-foreground/75 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </InteractiveGradientBackground>
  );
}
