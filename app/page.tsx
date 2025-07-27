import Hero from "./landing/v4_hero";
import { AdvancedFeatures } from "./landing/advanced-features";
import { Team } from "./landing/team";
import RecentNews from "./landing/recent-news";
import HowItWorks from "./landing/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <AdvancedFeatures />
      {/* <HowItWorks /> */}
      <RecentNews />
      <Team />
    </div>
  );
}
