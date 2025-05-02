import { Section } from "@/components/ui/section";
import { Check } from "lucide-react";

export default function WhatIsStaking() {
  return (
    <Section>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter">
            What is Bitcoin Staking?
          </h2>
          <p className="text-gray-500 md:text-lg">
            Bitcoin staking is a process where you lock up your Bitcoin to
            support the Sundial network and earn rewards in return. It&apos;s a
            way to put your Bitcoin to work and earn passive income.
          </p>
          <p className="text-gray-500 md:text-lg">
            When you stake your Bitcoin with Sundial, you&apos;re helping to
            secure the network while earning competitive yields on your
            holdings.
          </p>
        </div>
        <div className="rounded-lg border shadow-sm p-6 bg-secondary">
          <h3 className="text-xl font-bold mb-4">Staking Benefits</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-card-foreground">
                Earn up to 10% APY on your Bitcoin
              </span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-card-foreground">
                Support the Sundial network and ecosystem
              </span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-card-foreground">
                No technical knowledge required
              </span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-card-foreground">
                Secure and non-custodial
              </span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-card-foreground">
                Stake any amount of Bitcoin
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
