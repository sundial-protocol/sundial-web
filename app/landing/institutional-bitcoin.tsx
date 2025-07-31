"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Building2, CloudLightning, LockKeyholeIcon } from "lucide-react";

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
      className="rounded-lg overflow-hidden border-foreground shadow-xl shadow-black/50 relative"
    >
      <Image
        src={backgroundImage}
        alt=""
        className="absolute inset-0 pointer-events-none z-0 object-cover"
        width={600}
        height={1000}
        style={{
          transform: `scale(${scale})`,
          transition: "transform 0.1s ease-out",
          filter: "brightness(0.6)", // 40% darker
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
        <div className="p-6 text-left min-h-[350px] bg-black/20 w-full">
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

export default function InstitutionalBitcoin() {
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
      <Section className="rounded-md w-4/5 px-8 mx-auto py-12 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        {" "}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Built for Institutional Bitcoin.
            </h2>
            <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl">
              Unlock the full potential of Bitcoin holdings with
              enterprise-grade infrastructure designed for security, compliance,
              and sustainable yield
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-8 xl:grid-cols-3 mt-12 md:px-24">
          <Step
            icon={LockKeyholeIcon}
            title="Non-Custodial Yield"
            description="Generate sustainable returns on Bitcoin holdings without sacrificing custody or security"
            bulletPoints={[
              "Your keys, your Bitcoin",
              "2-5% sustainable APY",
              "No bridge risk",
            ]}
            backgroundImage="/notepad.jpg"
          />
          <Step
            icon={Building2}
            title="Enterprise SDK"
            description="White-label infrastructure with compliance modules built for institutional requirements"
            bulletPoints={[
              "Plug-and-play integration",
              "KYC/AML modules included",
              "Audit-ready reporting",
            ]}
            backgroundImage="/explaining.jpg"
          />
          <Step
            icon={CloudLightning}
            title="UTXO Ledger Model"
            description="Leveraging Bitcoin's proven ledger model with deterministic execution"
            bulletPoints={[
              "No smart contract exploits",
              "Stateless validation",
              "Fraud-proof protection",
            ]}
            backgroundImage="/phone.jpg"
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
