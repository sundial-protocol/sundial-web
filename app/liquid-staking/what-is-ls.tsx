import { Section } from "@/components/ui/section";
import { Check } from "lucide-react";

export default function WhatIsLS() {
  return (
    <Section>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter">
            What is Liquid Staking?
          </h2>
          <p className="text-gray-500 md:text-lg">
            Liquid staking allows you to stake your Bitcoin while receiving a
            liquid token ($SUN) that represents your staked assets. This means
            you can use your staked Bitcoin in DeFi applications while still
            earning staking rewards.
          </p>
          <p className="text-gray-500 md:text-lg">
            With Sundial&apos;s liquid staking, you get the best of both worlds:
            the security and rewards of staking, plus the flexibility and
            liquidity of having tradable tokens.
          </p>
        </div>
        <div className="rounded-lg border shadow-sm p-6 bg-secondary">
          <h3 className="text-xl font-bold mb-4">Liquid Staking Benefits</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">
                Earn staking rewards while maintaining liquidity
              </span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">
                Use your $SUN in DeFi applications
              </span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">No lockup period</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">
                Instant unstaking via liquidity pools
              </span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">Competitive APY</span>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
