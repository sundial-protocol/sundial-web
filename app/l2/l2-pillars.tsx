import { Gauge, Network } from "lucide-react";
import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";

type Pillar = {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
  stat: string;
};

const pillars: Pillar[] = [
  {
    icon: Gauge,
    eyebrow: "Sundial-built from the ground up",
    title: "Bitcoin Layer-2",
    description:
      "Full L2 stack: sequencer, state management, and commitment pipeline, with fraud-proof settlement back to Bitcoin L1.",
    stat: "1,000+ TPS benchmarked under load · Fraud-proof settlement",
  },
  {
    icon: Network,
    eyebrow: "Sundial-built bridge system",
    title: "UTXO Bridge",
    description:
      "Seamless Bitcoin–eUTXO bridging with verifiable state proofs. No wrapped tokens. No centralized custodian. Full bridge architecture owned by Sundial.",
    stat: "Bitcoin-anchored · Trust-minimized verification",
  },
];

export function L2Pillars() {
  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            top: "0px",
            height: "600px",
            background: sunbeamGradient("to bottom right"),
            clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)",
          },
        },
      ]}
    >
      <Section className="flex flex-col items-center justify-center pt-24">
        <div className="container px-4 md:px-6 z-10 space-y-2 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Architecture
          </h2>
          <p className="text-foreground/90 md:text-xl">
            Proprietary infrastructure. No dependencies on external L2s,
            bridges, or custodians.
          </p>
        </div>
        <div className="container px-4 md:px-6 z-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-12">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="relative flex flex-col justify-center p-8 bg-secondary/90 rounded-sm shadow-sm overflow-hidden"
              >
                <Icon
                  className="absolute -bottom-10 -right-10 m-auto opacity-30 text-gray-500 h-[150px] w-[150px] pointer-events-none select-none"
                  aria-hidden="true"
                />
                <Icon className="text-gray-500 h-12 w-12 pb-4 relative z-10" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary relative z-10">
                  {pillar.eyebrow}
                </p>
                <h3 className="text-2xl font-bold relative z-10 mt-1">
                  {pillar.title}
                </h3>
                <p className="text-gray-500 relative z-10 mt-2">
                  {pillar.description}
                </p>
                <p className="text-sm font-semibold text-primary relative z-10 mt-4">
                  {pillar.stat}
                </p>
              </div>
            );
          })}
        </div>
      </Section>
    </SunbeamBackground>
  );
}
