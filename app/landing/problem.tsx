import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";

export function Problem() {
  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            top: "-100px",
            height: "700px",
            background: sunbeamGradient("to bottom"),
            clipPath: "polygon(190% 100%, 0% 0%, 0% 45%)",
            opacity: "0.15",
          },
        },
      ]}
    >
      <Section className="pt-24">
        <div className="container px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              The Problem
            </p>
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              98% of Bitcoin earns nothing.
            </h2>
            <p className="text-foreground/80 md:text-xl">
              Hundreds of millions of dollars are lost every year to bridge
              exploits and poor wrappers. Institutions want yield, but DeFi
              demands unacceptable risk.
            </p>
            <p className="text-lg font-semibold text-primary pt-2">
              The clients are ready. The yield is missing. Sundial is the
              solution.
            </p>
          </div>
          <div className="flex flex-col justify-center p-8 bg-secondary/90 rounded-sm shadow-sm">
            <p className="text-5xl md:text-6xl font-bold text-primary">
              $292M+
            </p>
            <p className="text-foreground/80 mt-3">
              Lost in a single bridge exploit (Kelp DAO), one of hundreds of
              millions lost annually to bridge exploits and poor wrappers
              across DeFi.
            </p>
          </div>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
