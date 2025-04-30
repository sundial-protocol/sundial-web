import HowLSWorks from "./how-ls-works";
import WhatIsLS from "./what-is-ls";
import { SunToken } from "./sun-token";
import LSFAQ from "./ls-faq";
import LSCTA from "@/components/reusable-sections/ls-cta";

export default function LiquidStakingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <WhatIsLS />
      <HowLSWorks />
      <SunToken />
      <LSFAQ />
      <LSCTA />
    </div>
  );
}
