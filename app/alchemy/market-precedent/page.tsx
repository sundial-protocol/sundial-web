import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import InteractiveGradientBackground from "@/components/ui/interactive-gradient-bg";
import { AlchemyTable } from "@/components/ui/alchemy-table";

const precedents = [
  {
    id: "strc",
    color: "border-orange-500/40 bg-background/90 backdrop-blur-sm",
    accentColor: "text-orange-400",
    badgeColor:
      "border-orange-500/30 bg-background/80 text-orange-400 backdrop-blur-sm",
    label: "Public Equity Markets",
    name: "Strategy STRC",
    tagline: "BTC-backed senior preferred shares",
    body: [
      "Strategy's STRC is a perpetual preferred equity instrument paying an 11.5% adjustable annual dividend and backed by Strategy's Bitcoin balance sheet - the largest corporate BTC holder. STRC trades on NASDAQ and has raised over $10 billion, demonstrating that structured, senior-priority BTC exposure has deep institutional demand.",
      "The important precedent is not Strategy's corporate model itself. It is what investors revealed: they want more than passive spot exposure. They want senior claims, yield-oriented BTC reserve products, and structured ways to participate in Bitcoin balance-sheet growth - and they will pay a significant premium for them.",
      "Tokenized and yield-routed STRC products have since begun moving through DeFi venues such as Ondo, Saturn/Apyx, and Pendle, showing that markets are not only buying BTC-linked preferred instruments in brokerage accounts, but also decomposing, tokenizing, and trading their yield on-chain.",
    ],
    stats: [
      { label: "Structure", value: "Senior preferred shares" },
      { label: "Chain", value: "Traditional markets (NASDAQ)" },
      { label: "BTC-linked", value: "Yes - BTC balance-sheet" },
      { label: "On-chain", value: "Partial (via Ondo/Pendle)" },
    ],
    relevance:
      "Alchemy's ICE directly mirrors the senior-claim structure of STRC - a lower-volatility, priority-return vehicle backed by a BTC reserve - but built natively on-chain with deterministic reserve mechanics and DeFi interoperability.",
  },
  {
    id: "pendle",
    color: "border-sky-500/40 bg-background/90 backdrop-blur-sm",
    accentColor: "text-sky-400",
    badgeColor:
      "border-sky-500/30 bg-background/80 text-sky-400 backdrop-blur-sm",
    label: "DeFi Yield Infrastructure",
    name: "Pendle Finance",
    tagline: "Entirely new markets emerge around financial primitives",
    body: [
      "Pendle transforms yield-bearing assets into separate principal (PT) and yield (YT) claims, creating new financial primitives from existing assets such as stETH, USDe, and tokenized treasury products. By 2025, Pendle had grown to over $4B TVL and facilitated billions of dollars in trading volume across these markets.",
      "Pendle's success demonstrates that once a yield-bearing asset is decomposed into distinct risk and return profiles, entirely new economic activity emerges around those components. Fixed-yield markets, yield speculation, leveraged positions, collateralized lending, and structured products all developed around PT and YT tokens despite not existing in the underlying assets themselves.",
      "The recent integration of tokenized Strategy products further reinforces this trend. Rather than simply holding STRC exposure, users gained new ways to trade duration, speculate on yield, access leverage, and construct custom risk profiles. The result was not merely another venue for STRC, but an expanded financial ecosystem built on top of it.",
    ],
    stats: [
      { label: "Structure", value: "PT (senior) + YT (junior)" },
      { label: "Chain", value: "Ethereum (primary)" },
      { label: "BTC-linked", value: "Indirect (via tokenized STRC)" },
      { label: "On-chain", value: "Yes - fully composable" },
    ],
    relevance:
      "Alchemy applies the same principle directly to Bitcoin reserves. FIRE and ICE are designed as foundational financial primitives rather than end-user products alone. Just as Pendle transformed yield-bearing assets into broader financial ecosystems, FIRE and ICE can support secondary markets, collateralized lending, structured products, and new forms of Bitcoin-native fixed-income and reserve-equity exposure throughout the ecosystem.",
  },
  {
    id: "djed",
    color: "border-primary/40 bg-background/90 backdrop-blur-sm",
    accentColor: "text-primary",
    badgeColor:
      "border-primary/30 bg-background/80 text-primary backdrop-blur-sm",
    label: "Algorithmic Reserve System",
    name: "Djed",
    tagline: "Algorithmic reserve-backed stablecoin",
    body: [
      "Djed launched with reserve ratios exceeding 400% and surpassed $10M TVL in its first 24 hours - demonstrating that users will adopt visibly overcollateralized reserve systems and that the reserve-ratio model is legible and trusted.",
      "Djed's architecture uses a seigniorage-style reserve with two complementary tokens: DJED (the stable senior claim) and SHEN (the reserve-equity token that absorbs volatility and captures upside). This dual-token reserve structure is the closest existing precedent to Alchemy's FIRE/ICE model.",
    ],
    stats: [
      { label: "Structure", value: "Dual-token reserve (DJED + SHEN)" },
      { label: "Chain", value: "On-chain (native)" },
      { label: "BTC-linked", value: "No - crypto-backed" },
      { label: "On-chain", value: "Yes - native" },
    ],
    relevance:
      "Djed is a strong proof point: users already understand and adopt dual-token reserve systems. Alchemy uses BTC as the reserve asset and substitutes FIRE/ICE for SHEN/DJED - bringing Bitcoin-native capital into the same proven reserve-ratio framework.",
  },
];

const broader = [
  {
    name: "Centrifuge / Tinlake",
    description:
      "Pioneered on-chain private credit with a senior/junior tranche structure. Centrifuge surpassed $450M in financed real-world assets, validating that structured credit tranching is a viable on-chain primitive.",
  },
  {
    name: "Ethena USDe",
    description:
      "Transparent reserve-backed synthetic dollar that grew to $2B+ circulating supply within months of launch. Validated that users adopt reserve-backed instruments when the reserve mechanics are public and auditable.",
  },
];

const comparison = [
  {
    product: "Strategy STRC",
    network: "NASDAQ",
    structure: "Senior preferred shares",
    btcLinked: "Yes",
    onChain: "Partial",
    composable: "No",
  },
  {
    product: "Pendle PT/YT",
    network: "Ethereum",
    structure: "Yield token split",
    btcLinked: "Indirect",
    onChain: "Yes",
    composable: "Yes",
  },
  {
    product: "Djed / SHEN",
    network: "eUTXO",
    structure: "Reserve dual-token",
    btcLinked: "No",
    onChain: "Yes",
    composable: "Partial",
  },
  {
    product: "Centrifuge",
    network: "Ethereum",
    structure: "Senior/junior credit",
    btcLinked: "No",
    onChain: "Yes",
    composable: "Partial",
  },
  {
    product: "Ethena USDe",
    network: "Ethereum",
    structure: "Delta-neutral reserve",
    btcLinked: "Indirect",
    onChain: "Yes",
    composable: "Yes",
  },
  {
    product: "Alchemy FIRE/ICE",
    network: "Bitcoin",
    structure: "BTC reserve senior/junior",
    btcLinked: "Yes",
    onChain: "Yes",
    composable: "Yes",
    highlight: true,
  },
];

export default function MarketPrecedentPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-background/40 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-sky-400 mb-5">
            <TrendingUp className="h-4 w-4" />
            The Demand Exists
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Market Precedent
          </h1>
          <p className="text-lg text-foreground/85 max-w-2xl leading-relaxed">
            Alchemy does not need to prove that BTC-backed structured products
            can work. Public-market and DeFi precedents already confirm the
            demand. Alchemy brings that proven product logic into transparent,
            on-chain infrastructure.
          </p>
        </div>

        {/* Deep-dive precedents */}
        <div className="space-y-10 mb-16">
          {precedents.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border ${p.color} p-6 md:p-8`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                <div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium mb-3 ${p.badgeColor}`}
                  >
                    {p.label}
                  </span>
                  <h2 className={`text-2xl font-bold ${p.accentColor}`}>
                    {p.name}
                  </h2>
                  <p className="text-sm text-foreground/75 mt-1">{p.tagline}</p>
                </div>
                <div className="shrink-0 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {p.stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-xs text-foreground/60 uppercase tracking-widest">
                        {s.label}
                      </div>
                      <div className="font-medium text-foreground">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {p.body.map((para, i) => (
                  <p
                    key={i}
                    className="text-sm text-foreground/85 leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>

              <div className={`rounded-lg border ${p.color} p-4`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60 mb-1">
                  Relevance to Alchemy
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {p.relevance}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Broader precedents */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Broader Reserve System Adoption
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {broader.map((b) => (
              <div
                key={b.name}
                className="rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm p-5"
              >
                <h3 className="font-semibold text-foreground mb-2">{b.name}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Product Comparison
          </h2>
          <AlchemyTable
            columns={[
              { label: "Product" },
              { label: "Network" },
              { label: "Structure" },
              { label: "BTC-linked", align: "center" },
              { label: "On-chain", align: "center" },
              { label: "Composable", align: "center" },
            ]}
            rows={comparison.map((row) => ({
              key: row.product,
              highlight: row.highlight,
              cells: [
                row.product,
                row.network,
                row.structure,
                row.btcLinked,
                row.onChain,
                row.composable,
              ],
              cellClassNames: [
                row.highlight
                  ? "font-medium text-primary"
                  : "font-medium text-foreground",
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
              ],
            }))}
          />
        </div>

        {/* Why Alchemy is different */}
        <div className="rounded-2xl border border-primary/30 bg-background/90 backdrop-blur-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Why Alchemy Is Different
          </h2>
          <div className="space-y-3 mb-6">
            <p className="text-sm text-foreground/90 leading-relaxed">
              Every precedent above proved something important about what
              investors want. But each one is either off-chain, on the wrong
              chain, not BTC-backed, or requires bridging and wrapping to
              participate.
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Alchemy combines all the right properties in one system: a
              transparent BTC reserve, a senior/junior split that markets
              understand, native composability for wallets and DEXs, and
              always-on public reporting. FIRE and ICE are not analogies to
              these products - they are the on-chain, auditable version of a
              product category that public markets have already validated.
            </p>
          </div>
          <Link
            href="/alchemy/visualizer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:bg-foreground/80 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Try the Visualizer
          </Link>
        </div>
      </div>
    </InteractiveGradientBackground>
  );
}
