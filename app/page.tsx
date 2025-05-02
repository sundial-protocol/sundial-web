import { ValidatorsPreview } from "./staking/validators-preview";
import { Hero } from "./landing/hero";
import { AdvancedFeatures } from "./landing/advanced-features";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <AdvancedFeatures />
      <ValidatorsPreview />
    </div>
  );
}
