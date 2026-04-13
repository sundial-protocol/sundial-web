"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Building2, CloudLightning, LockKeyholeIcon } from "lucide-react";

type StepData = {
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  title: string;
  description: string;
  bulletPoints?: string[];
  backgroundImage: string;
};

function Step({
  icon: Icon,
  image,
  title,
  description,
  bulletPoints,
  backgroundImage,
}: StepData) {
  const [scrollY, setScrollY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const cardCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(windowHeight / 2 - cardCenter);
        const maxDistance = windowHeight;
        const scrollFactor = 1 - Math.min(distanceFromCenter / maxDistance, 1);
        setScrollY(scrollFactor);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scale = 1 + scrollY * 0.5;

  return (
    <Card
      ref={cardRef}
      className="rounded-lg overflow-hidden border-foreground shadow-xl shadow-black/50 relative"
    >
      <Image
        src={backgroundImage}
        alt=""
        className="absolute inset-0 pointer-events-none z-0 object-cover h-full w-full"
        width={600}
        height={1000}
        style={{
          transform: `scale(${scale})`,
          transition: "transform 0.1s ease-out",
          filter: "brightness(0.6)",
        }}
      />
      <CardHeader className="flex flex-row items-center justify-left p-4 bg-blur-none bg-black/30 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30">
          {Icon && <Icon className="h-6 w-6 text-white" />}
          {image && (
            <Image
              src={image}
              alt={title}
              width={24}
              height={24}
              className="object-contain"
            />
          )}
        </div>
        <h3 className="text-xl text-white font-bold pl-8">{title}</h3>
      </CardHeader>
      <CardContent className="bg-transparent flex items-center justify-center p-0 text-white font-semibold text-md relative z-10">
        <div className="p-6 text-left min-h-[350px] bg-black/20 w-full h-full">
          <p className="mb-4">{description}</p>
          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="space-y-2">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const steps: StepData[] = [
  {
    icon: LockKeyholeIcon,
    title: "Non-Custodial Yield",
    description:
      "Generate sustainable returns on Bitcoin holdings without sacrificing custody or security",
    bulletPoints: [
      "Your keys, your Bitcoin",
      "2-5% sustainable APY",
      "No bridge risk",
    ],
    backgroundImage: "/stock-images/building.jpg",
  },
  {
    icon: Building2,
    title: "Enterprise SDK",
    description:
      "White-label infrastructure with compliance modules built for institutional requirements",
    bulletPoints: [
      "Plug-and-play integration",
      "KYC/AML modules included",
      "Audit-ready reporting",
    ],
    backgroundImage: "/stock-images/workers.jpg",
  },
  {
    icon: CloudLightning,
    title: "UTXO Ledger Model",
    description:
      "Leveraging Bitcoin's proven ledger model with deterministic execution",
    bulletPoints: [
      "No smart contract exploits",
      "Stateless validation",
      "Fraud-proof protection",
    ],
    backgroundImage: "/stock-images/nodes.jpg",
  },
];

export function InstitutionalBitcoinSteps() {
  return (
    <div className="mx-auto grid grid-cols-1 gap-8 xl:grid-cols-3 mt-12 md:px-24">
      {steps.map((step, i) => (
        <Step key={i} {...step} />
      ))}
    </div>
  );
}
