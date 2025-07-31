import StakingHero from "./staking-hero";
import WhatIsStaking from "./what-is-staking";
import HowItWorks from "../landing/institutional-bitcoin";
import StakingFAQ from "./staking-faq";
import StakingCTA from "./staking-cta";
import { WhyStake } from "./why-stake";
import { ValidatorsPreview } from "@/components/reusable-sections/validators-preview";
import MaintenanceSunset from "@/components/reusable-sections/maintenance-sunset/maintenance-sunset";

export default function StakingPage() {
  return (
    <MaintenanceSunset />
    // <div className="flex flex-col min-h-screen">
    //   <StakingHero />

    //   <WhyStake />

    //   <WhatIsStaking />

    //   <HowItWorks />

    //   <ValidatorsPreview />

    //   <StakingFAQ />

    //   <StakingCTA />
    // </div>
  );
}
