"use client";

import { CircleGauge, Activity, FastForward, Network } from "lucide-react";
import { FeatureCard } from "./feature-card";

export function AdvancedFeaturesGrid() {
  const features = [
    {
      icon: FastForward,
      title: "Speed",
      description:
        "24,000% faster than BTC, with less than .01% the fees - opening up a world of new possibilities.",
      className: "col-span-2 lg:col-span-4",
    },
    {
      icon: CircleGauge,
      title: "Gas Abstraction",
      description:
        "Pay native chain token (BTC, LTC, ADA), unlocking incredible new possibilities for Dapps and DeFi.",
      className: "col-span-1 lg:col-span-2",
    },
    {
      icon: Network,
      title: "Native UTXO Security",
      description:
        "Full UTXO security - stateless executions, etc. - leveraging trustless ZK bridge tech.",
      className: "col-span-1 lg:col-span-3",
    },
    {
      icon: Activity,
      title: "Ecosystem",
      description:
        "Partnered with the best UTXO ecosystem partners in DeFi, Dapps, and more.",
      className: "col-span-2 lg:col-span-3",
    },
  ];

  return (
    <div className="grid w-full auto-rows-min gap-4 col-span-2 grid-cols-2 md:mb-24 lg:grid-cols-6 lg:gap-3 md:max-h-[500px] grid-rows-none max-h-none">
      {features.map((feature, i) => (
        <FeatureCard
          key={i}
          index={i}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          className={feature.className}
        />
      ))}
    </div>
  );
}
