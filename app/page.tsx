import Hero from "./landing/v4_hero";
import HowItWorks from "./landing/institutional-bitcoin";
import { SecurityFirst } from "./landing/security-first";
import HedgeCTA from "@/components/reusable-sections/hedge-cta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <SecurityFirst />
      <HedgeCTA />
    </div>
  );
}
