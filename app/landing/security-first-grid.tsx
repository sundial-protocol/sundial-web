"use client";

import { LockKeyhole, Shield, SearchCheck } from "lucide-react";
import { FeatureCard } from "./feature-card";

export function SecurityFirstGrid() {
  const features = [
    {
      icon: LockKeyhole,
      title: "Deterministic Execution",
      description:
        "No reentrancy attacks or state manipulation vulnerabilities",
      className: "col-span-2 lg:col-span-6",
    },
    {
      icon: Shield,
      title: "Fraud-Proof System",
      description:
        "Optimistic rollup with efficient on-chain dispute resolution",
      className: "col-span-1 lg:col-span-3",
    },
    {
      icon: SearchCheck,
      title: "Third Party Audits",
      description: "Comprehensive security reviews by industry-leading firms",
      className: "col-span-1 lg:col-span-3",
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
