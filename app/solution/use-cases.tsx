"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Building2, LockKeyholeIcon, PiggyBank } from "lucide-react";

type StepProps = {
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
}: StepProps) {
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
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scale = 1 + scrollY * 0.5;

  return (
    <Card
      ref={cardRef}
      className="rounded-lg overflow-hidden border-foreground shadow-xl relative bg-black/30 "
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
          filter: "brightness(0.6)", // 40% darker
        }}
      />

      <CardHeader className="flex flex-row items-center justify-left p-4 bg-blur-none relative z-10">
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

export default function UseCases() {
  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            content: '""',
            position: "absolute",
            left: "0",
            top: "-300px",
            width: "100%",
            height: "1200px",
            background:
              "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section className="rounded-md w-4/5 px-8 mx-auto py-12 mb-24 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="mx-auto grid grid-cols-1 gap-8 xl:grid-cols-3 mt-12 md:px-24">
          <Step
            icon={LockKeyholeIcon}
            title="Non-Custodial Bitcoin Yield"
            description="Generate sustainable returns on Bitcoin holdings without sacrificing custody or security"
            bulletPoints={[
              "100% Non-Custodial",
              "2-5% Sustainable APY",
              "0% bridge risk",
              "$100M+ BTC Committed",
            ]}
            backgroundImage="/stock-images/notepad.jpg"
          />
          <Step
            icon={PiggyBank}
            title="Corporate Treasury Solutions"
            description="Following the MicroStrategy playbook? Put your Bitcoin reserves to work with institutional-grade infrastructure designed for corporate treasuries. Generate yield while maintaining full custody and compliance."
            bulletPoints={[
              "SOC-2 Compliant",
              "24/7 Monitoring",
              "Multisig Security",
              "Real-time Reporting",
            ]}
            backgroundImage="/stock-images/building.jpg"
          />
          <Step
            icon={Building2}
            title="Enterprise SDK"
            description="Seamlessly integrate Bitcoin yield generation into your existing infrastructure. Our white-label SDK provides everything needed for custodians, exchanges, and financial platforms to offer Bitcoin staking services."
            bulletPoints={[
              "Low Latency",
              "99.99% Uptime SLA",
              "REST & WSS APIs",
              "24/7 Support",
            ]}
            backgroundImage="/stock-images/workers.jpg"
          />
        </div>
        <div className="flex justify-center mt-12">
          {/* <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background h-12 px-8 text-base font-medium transition-colors hover:bg-background/20 border hover:border-foreground hover:text-foreground"
          >
            Learn More
          </Link> */}
        </div>
      </Section>
    </SunbeamBackground>
  );
}
