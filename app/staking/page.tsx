import StakingHero from "./staking-hero";
import WhatIsStaking from "./what-is-staking";
import { HowItWorks } from "./how-it-works";
import StakingFAQ from "./staking-faq";
import StakingCTA from "./staking-cta";
import { WhyStake } from "./why-stake";
import { ValidatorsPreview } from "@/components/reusable-sections/validators-preview";
import MaintenanceOverlay from "@/components/ui/maintenance-overlay";

export default function StakingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <StakingHero />

      <WhyStake />

      <WhatIsStaking />

      <HowItWorks />

      <ValidatorsPreview />

      <StakingFAQ />

      <StakingCTA />

      <MaintenanceOverlay />
    </div>
  );
}
