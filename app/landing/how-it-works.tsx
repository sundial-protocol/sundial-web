import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";
import Link from "next/link";
import { Step } from "./how-it-works-step";

export default function HowItWorks() {
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
        <div className="mx-auto grid grid-cols-1 gap-8 xl:grid-cols-3 mt-12 md:px-24">
          <Step
            number={1}
            title="Deposit Bitcoin"
            description="Connect your wallet and deposit your Bitcoin to start staking."
            image="/stock-images/atlantis.jpg"
          />
          <Step
            number={2}
            title="Choose Validators"
            description="Select from our network of trusted validators to stake with."
            image="/stock-images/doors.jpg"
          />
          <Step
            number={3}
            title="Earn Rewards"
            description="Start earning staking rewards immediately with competitive APY."
            image="/stock-images/spaceman.jpg"
          />
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background h-12 px-8 text-base font-medium transition-colors hover:bg-background/20 border hover:border-foreground hover:text-foreground"
          >
            Learn More
          </Link>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
