import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";
import { AdvancedFeaturesGrid } from "./advanced-features-grid";

export function AdvancedFeatures() {
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
            <div className="space-y-2 p-6">
              <h2 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                Advanced Features
              </h2>
              <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl">
                Sundial offers a unique set of features that maximize your
                Bitcoin yields while maintaining security.
              </p>
            </div>
          </div>
          <AdvancedFeaturesGrid />
        </div>
      </Section>
    </SunbeamBackground>
  );
}
