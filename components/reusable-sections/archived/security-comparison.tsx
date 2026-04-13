"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import SunbeamBackground, {
  sunbeamGradient,
} from "@/components/ui/sunbeam/sunbeam-bg";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, X } from "lucide-react";

type StepProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  bulletPoints?: string[];
  color: string;
};

function Step({ icon: Icon, title, bulletPoints, color }: StepProps) {
  const [_scrollY, setScrollY] = useState(0);
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

  // Use inline styles instead of dynamic Tailwind classes
  const colorHex = color === "green" ? "#10b981" : "#ef4444";
  const iconColorClass =
    color === "green"
      ? "text-green-500 border-green-500/30"
      : "text-red-500 border-red-500/30";

  return (
    <Card
      ref={cardRef}
      className="rounded-lg overflow-hidden border-foreground shadow-xl relative"
      style={{
        borderColor: `${colorHex}`,
        boxShadow: `0 25px 50px -12px ${colorHex}`,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-left p-4 bg-blur-none bg-black/30 relative z-10">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border ${iconColorClass}`}
        >
          {/* Use inline style for dynamic color */}
          <Icon className={`h-6 w-6`} />
        </div>
        <h3 className="text-xl text-foreground font-bold pl-8">{title}</h3>
      </CardHeader>
      <CardContent className="bg-transparent flex items-center justify-center p-0 text-foreground font-semibold text-md relative z-10">
        <div className="p-6 text-left min-h-[350px] bg-black/20 w-full">
          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="space-y-2">
              {bulletPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start hover:scale-105 transition-all transition duration-300 hover:underline"
                >
                  <span className="mr-2">
                    {/* Use inline style for bullet point icons too */}
                    <Icon className={`h-6 w-6 text-foreground`} />
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
            top: "-300px",
            height: "1200px",
            background: sunbeamGradient("to bottom"),
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
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
