import Hero from "./landing/legacy_hero";
import { AdvancedFeatures } from "./landing/advanced-features";
import { Team } from "./landing/team";
import { HowItWorks } from "./staking/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <AdvancedFeatures />
      <HowItWorks />
      <Team />
    </div>
  );
}
