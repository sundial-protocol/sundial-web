import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";
import { SecurityFirstGrid } from "./security-first-grid";

export function SecurityFirst() {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 container px-4 md:px-6 z-10">
          <div className="flex flex-row justify-center space-y-4">
            <div className="mx-auto space-y-2 p-6 md:pl-12 lg:pl-0">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Security-First Architecture
              </h2>
              <p className="max-w-[700px] text-foreground/90 md:text-xl">
                Sundial prioritizes institutional-grade security with a
                UTXO-based architecture that eliminates common attack vectors
                found in account-based systems.
              </p>
            </div>
          </div>
          <SecurityFirstGrid />
        </div>
      </Section>
    </SunbeamBackground>
  );
}
