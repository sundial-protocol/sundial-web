import { HeroSection } from "@/components/ui/hero-section";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StakingHero() {
  return (
    <HeroSection>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Bitcoin Staking
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            Earn passive income by staking your Bitcoin with{" "}
            <span className="text-primary">Sundial</span>.
          </p>
        </div>
        <Link
          href="/stake"
          className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
        >
          Start Staking
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </HeroSection>
  );
}
