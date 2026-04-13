"use client";

import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";
import {
  FastForward,
  LockKeyhole,
  Shield,
  SearchCheck,
  Bitcoin,
  Link2,
  Link,
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

export function L2Architecture() {
  const features = [
    {
      icon: Bitcoin,
      title: "Bitcoin Layer 1",
      description:
        "Native Bitcoin blockchain providing ultimate security and finality. Assets never leave user custody.",
      className: "col-span-2 lg:col-span-4",
    },
    {
      icon: Link,
      title: "Bridge Infrastructure",
      description:
        "Trustless ZK-powered bridges enabling seamless asset movement between Bitcoin and Sundial without custodial risk.",
      className: "col-span-1 lg:col-span-2",
    },
    {
      icon: Sun,
      title: "Sundial Layer 2",
      description:
        "Optimistic rollup with fraud proofs, processing thousands of transactions per second with Bitcoin-level security.",
      className: "col-span-1 lg:col-span-3",
    },
    {
      icon: Wrench,
      title: "Application Layer",
      description:
        "DeFi protocols, institutional services, and SDK integrations built on Sundial's secure infrastructure.",
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
      <Section className="flex flex-col items-center justify-center pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 container px-4 md:px-6 z-10">
          <div className="flex flex-row justify-center space-y-4">
            <div className="mx-auto space-y-2 p-6 md:pl-12 lg:pl-0">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Layer 2 Architecture
              </h1>
              <p className="max-w-[700px] text-foreground/90 md:text-xl">
                A multi-layer approach to scaling Bitcoin while maintaining
                Layer 1 security guarantees
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
