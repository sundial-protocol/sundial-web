import { ValidatorsPreview } from "./staking/validators-preview";
import { Hero } from "./landing/hero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <ValidatorsPreview />
    </div>
  );
}
