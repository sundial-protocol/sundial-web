import { ValidatorsPreview } from "./staking/validators-preview";
import { Hero } from "./landing/hero";
import { AdvancedFeatures } from "./landing/advanced-features";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { Team } from "./landing/team";
import RecentNews from "./landing/recent-news";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SunbeamBackground />
      <Hero />
      <AdvancedFeatures />
      <RecentNews />
      <ValidatorsPreview />
      <Team />
    </div>
  );
}
