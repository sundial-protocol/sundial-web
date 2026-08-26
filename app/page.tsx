import Hero from "./landing/v4_hero";
import { Problem } from "./landing/problem";
import { Traction } from "./landing/traction";
import { CoreTechnology } from "./landing/core-technology";
import HowItWorks from "./landing/institutional-bitcoin";
import HedgeCTA from "@/components/reusable-sections/hedge-cta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Problem />
      <Traction />
      <CoreTechnology />
      {/*<HowItWorks />*/}
      <HedgeCTA />
    </div>
  );
}
