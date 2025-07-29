"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type StepProps = {
  number: number;
  title: string;
  description: string;
  image: string;
};

function Step({ number, title, description, image }: StepProps) {
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

  const scale = 1 + scrollY * 0.5; // Zoom from 1 to 1.2

  return (
    <Card
      ref={cardRef}
      className="rounded-lg overflow-hidden border-foreground shadow-xl shadow-black/50"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: `${Math.max(scale * 200, 100)}%`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-size 0.1s ease-out",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-left p-4 bg-blur-none bg-black/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black">
          {number}
        </div>
        <h3 className="text-xl text-white font-bold pl-8">{title}</h3>
      </CardHeader>
      <CardContent className="bg-transparent flex items-center justify-center p-0">
        <div className="p-6 text-center min-h-[350px] bg-black/20 w-full">
          <p className="text-white">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HowItWorks() {
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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl">
              Sundial&apos;s dual staking mechanism is simple and efficient.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-8 xl:grid-cols-3 mt-12 md:px-24">
          <Step
            number={1}
            title="Deposit Bitcoin"
            description="Connect your wallet and deposit your Bitcoin to start staking."
            image="/atlantis.jpg"
          />
          <Step
            number={2}
            title="Choose Validators"
            description="Select from our network of trusted validators to stake with."
            image="/doors.jpg"
          />
          <Step
            number={3}
            title="Earn Rewards"
            description="Start earning staking rewards immediately with competitive APY."
            image="/spaceman.jpg"
          />
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background h-12 px-8 text-base font-medium transition-colors hover:bg-background/20 border hover:border-foreground hover:text-foreground"
          >
            Learn More
          </Link>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
