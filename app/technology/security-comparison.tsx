"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckIcon, X } from "lucide-react";

type StepProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  bulletPoints?: string[];
  color: string;
};

function Step({ icon: Icon, title, bulletPoints, color }: StepProps) {
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
      className="rounded-lg overflow-hidden border-foreground shadow-xl relative"
      style={{
        borderColor: color === "green" ? "#10b981" : "#ef4444",
        boxShadow: `0 25px 50px -12px ${
          color === "green"
            ? "rgba(16, 185, 129, 0.5)"
            : "rgba(239, 68, 68, 0.5)"
        }`,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-left p-4 bg-blur-none bg-black/30 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl text-foreground font-bold pl-8">{title}</h3>
      </CardHeader>
      <CardContent className="bg-transparent flex items-center justify-center p-0 text-foreground font-semibold text-md relative z-10">
        <div className="p-6 text-left min-h-[350px] bg-black/20 w-full">
          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="space-y-2">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">
                    {" "}
                    <Icon className="h-6 w-6 text-white" />
                  </span>
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

export default function SecurityComparison() {
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
      <Section className="rounded-md w-4/5 px-8 mx-auto py-12">
        {" "}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Security Comparison
            </h2>
            <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl">
              Why UTXO architecture provides superior security for institutional
              assets
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-8 xl:grid-cols-2 mt-12 md:px-24">
          <Step
            icon={CheckIcon}
            title="UTXO Model"
            bulletPoints={[
              "Stateless execution - no shared memory",
              "Deterministic outcomes guaranteed",
              "No reentrancy attacks possible",
              "Parallel transaction processing",
              "True self-custody maintained",
              "Audit trail permanently recorded",
            ]}
            color="green"
          />
          <Step
            icon={X}
            title="Account Model"
            bulletPoints={[
              "Shared global state vulnerabilities",
              "Non-deterministic execution paths",
              "Reentrancy attack vectors",
              "Sequential processing bottlenecks",
              "Contract custody requirements",
              "Complex state verification",
            ]}
            color="red"
          />
        </div>
        <div className="flex justify-center mt-12">
          {/* <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background h-12 px-8 text-base font-medium transition-colors hover:bg-background/20 border hover:border-foreground hover:text-foreground"
          >
            Learn More
          </Link> */}
        </div>
      </Section>
    </SunbeamBackground>
  );
}
