import Hero from "./landing/v4_hero";
import { Team } from "./landing/team";
import RecentNews from "./landing/recent-news";
import HowItWorks from "./landing/institutional-bitcoin";
import { SecurityFirst } from "./landing/security-first";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <SecurityFirst />
      <RecentNews />
      <Team />
    </div>
  );
}
