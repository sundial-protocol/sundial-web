import { Hero } from "./landing/hero";
import { AdvancedFeatures } from "./landing/advanced-features";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { Team } from "./landing/team";
import { HowItWorks } from "./staking/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SunbeamBackground />
      <Hero />
      <AdvancedFeatures />
      <HowItWorks />
      <Team />
    </div>
  );
}
