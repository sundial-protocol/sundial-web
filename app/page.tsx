import { ValidatorsPreview } from "./staking/validators-preview";
import { Hero } from "./landing/hero";
import { AdvancedFeatures } from "./landing/advanced-features";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SunbeamBackground />
      <Hero />
      <AdvancedFeatures />
      <ValidatorsPreview />
    </div>
  );
}
