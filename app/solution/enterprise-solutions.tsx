"use client";

import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";
import {
  BadgeDollarSign,
  Bitcoin,
  ChartBar,
  Link,
  PiggyBank,
  Sun,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  index,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150); // Stagger animations
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col justify-center p-6 bg-secondary/90 rounded-sm shadow-sm transition-all duration-700 overflow-hidden transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      } ${className || ""}`}
    >
      {/* Background Icon */}
      {Icon && (
        <Icon
          className="absolute -bottom-10 -right-10 m-auto opacity-30 text-gray-500 h-[150px] w-[150px] pointer-events-none select-none"
          aria-hidden="true"
        />
      )}
      {/* Foreground Content */}
      {Icon && <Icon className="text-gray-500 h-12 w-12 pb-4 relative z-10" />}
      <h2 className="text-lg text-primary font-semibold relative z-10">
        {title}
      </h2>
      <p className="text-gray-500 relative z-10">{description}</p>
    </div>
  );
}

export function EnterpriseSolutions() {
  const features = [
    {
      icon: BadgeDollarSign,
      title: "Institutional Yield",
      description:
        "Generate sustainable returns on Bitcoin holdings without sacrificing custody or security through our non-custodial staking infrastructure.",
      className: "col-span-2 lg:col-span-4",
    },
    {
      icon: PiggyBank,
      title: "Treasury Management",
      description:
        "Deploy corporate Bitcoin reserves into secure, yield-generating strategies with enterprise-grade reporting and compliance",
      className: "col-span-2 lg:col-span-2",
    },
    {
      icon: Wrench,
      title: "Enterprise SDK",
      description:
        "White-label infrastructure with plug-and-play modules for custody platforms, exchanges, and financial institutions.",
      className: "col-span-2 lg:col-span-3",
    },
    {
      icon: ChartBar,
      title: "Market Making",
      description:
        "Provide deep liquidity for Bitcoin and UTXO assets with institutional-grade market making infrastructure.",
      className: "col-span-2 lg:col-span-3",
    },
  ];

  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            top: "0px",
            height: "600px",
            background: sunbeamGradient("to bottom right"),
            clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)",
          },
        },
      ]}
    >
      <Section className="flex flex-col items-center justify-center pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 container px-24 md:px-36 z-10">
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
        </div>
      </Section>
    </SunbeamBackground>
  );
}
