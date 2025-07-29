"use client";

import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { CircleGauge, Activity, FastForward, Network } from "lucide-react";
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
      { threshold: 0.1 }
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

export function AdvancedFeatures() {
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
    <SunbeamBackground
      beams={[
        {
          styles: {
            content: '""',
            position: "absolute",
            left: "0",
            top: "0px",
            width: "100%",
            height: "600px",
            background:
              " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)",
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section className="flex flex-col items-center justify-center pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 container px-4 md:px-6 z-10">
          <div className="flex flex-row justify-center space-y-4">
            <div className="space-y-2 p-6">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                Advanced Features
              </h1>
              <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl">
                Sundial offers a unique set of features that maximize your
                Bitcoin yields while maintaining security.
              </p>
            </div>
          </div>
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
