import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";
import { InstitutionalBitcoinSteps } from "./institutional-bitcoin-steps";

export default function InstitutionalBitcoin() {
  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            top: "-300px",
            height: "1200px",
            background: sunbeamGradient("to bottom"),
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
          },
        },
      ]}
    >
      <Section className="rounded-md w-4/5 px-8 mx-auto py-12 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        {" "}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Built for Institutional Bitcoin.
            </h2>
            <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl">
              Unlock the full potential of Bitcoin holdings with
              enterprise-grade infrastructure designed for security, compliance,
              and sustainable yield
            </p>
          </div>
        </div>
        <InstitutionalBitcoinSteps />
        <div className="flex justify-center mt-12">
          {/* <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background h-12 px-8 text-base font-medium transition-colors hover:bg-background/20 border hover:border-foreground hover:text-foreground"
          >
            Learn More
          </Link> */}
        </div>
      </Section>
    </SunbeamBackground>
  );
}
