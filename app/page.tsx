import { WhyStake } from "./landing/why-stake";
import { HowItWorks } from "./landing/how-it-works";
import { ValidatorsPreview } from "./landing/validators-preview";
import { Hero } from "./landing/hero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <WhyStake />
      <HowItWorks />
      <ValidatorsPreview />
    </div>
  );
}
