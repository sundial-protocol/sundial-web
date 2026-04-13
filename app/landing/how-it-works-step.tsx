"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

type StepProps = {
  number: number;
  title: string;
  description: string;
  image: string;
};

export function Step({ number, title, description, image }: StepProps) {
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
