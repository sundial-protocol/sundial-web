"use client";

import { HeroSection } from "@/components/ui/hero-section";
import Link from "next/link";
import Partners from "../../components/reusable-sections/partners";
import { useEffect, useState } from "react";
import { LucideArrowRight } from "lucide-react";
// import Image from "next/image";

function OrbitTrace({ size, color }: { size: number; color?: string }) {
  // Squash the y-radius mathematically
  const cx = 170;
  const cy = 250 + size / 7;
  const rx = size;
  const ry = size * Math.cos((75 * Math.PI) / 180);
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      stroke={color || `#f7931a`}
      strokeWidth="2"
      opacity={0.6}
      z={-50}
    />
  );
}

type SmallPlanetProps = {
  angle: number;
  radius: number;
  color: string;
  speed?: number;
};

function SmallPlanet({ angle, radius, color, speed = 1 }: SmallPlanetProps) {
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentAngle((prev) => (prev + speed * 0.1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [speed]);

  // Don't render until mounted on client
  if (!mounted) return null;

  // Center of the ellipse
  const cx = 170;
  const cy = 250 + radius / 7;
  // Ellipse radii
  const rx = radius;
  const ry = radius * Math.cos((75 * Math.PI) / 180); // squash y-radius by cos(75deg)
  // Convert angle to radians
  const rad = (currentAngle * Math.PI) / 180;
  // Calculate position on the visually rotated ellipse
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);
  return <circle cx={x} cy={y} r={y * 0.05} fill={color} />;
}

function ImagePlanet({
  angle,
  radius,
  speed = 1,
  imageUrl,
  size = 70,
}: {
  angle: number;
  radius: number;
  speed?: number;
  imageUrl: string;
  size?: number;
}) {
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentAngle((prev) => (prev + speed * 0.1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [speed]);

  if (!mounted) return null;

  // Center of the ellipse
  const cx = 170;
  const cy = 250 + radius / 7;
  const rx = radius;
  const ry = radius * Math.cos((75 * Math.PI) / 180);
  const rad = (currentAngle * Math.PI) / 180;
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);

  // Dynamically update size based on y
  const dynamicSize = size + (y - 300) * 0.2;

  return (
    <image
      href={imageUrl}
      x={x - dynamicSize / 2}
      y={y - dynamicSize / 2}
      width={dynamicSize}
      height={dynamicSize}
      style={{ filter: "url(#planet-glow)" }}
    />
  );
}

export default function Hero() {
  return (
    <HeroSection classes="pt-48">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <h1 className="text-[2.75rem]/[1.1] font-bold tracking-tight sm:text-6xl md:text-7xl">
              INSTITUTIONAL GRADE{" "}
              <span className="text-[#f7931a]">BITCOIN</span> INFRASTRUCTURE
            </h1>
            <div className="pt-4 md:text-xl">
              <span>
                The first UTXO-native Layer 2 enabling secure, compliant Bitcoin
                yield generation at scale
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://calendly.com/lewis-sundialprotocol/new-meeting"
              className="inline-flex items-center justify-center rounded-full h-14 md:px-12 text-black font-bold transition-colors bg-primary hover:bg-primary/70"
              target="_blank"
            >
              Schedule Demo <LucideArrowRight className="ml-2 h-4 w-4" />
            </a>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center rounded-full h-14 md:px-12 text-base font-medium transition-colors bg-background/20 hover:bg-foreground/20 border border-foreground"
            >
              Documentation
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[500px] aspect-square overflow-visible -z-50">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible -z-50"
            >
              <defs>
                <filter
                  id="planet-glow"
                  x="-100%"
                  y="-100%"
                  width="400%"
                  height="400%"
                >
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* SVG recreation of the beams */}
              <polygon
                points="-4000,-1200 1800,-1200 1800,800"
                fill="url(#beam1-gradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient
                  id="beam1-gradient"
                  x1="0"
                  y1="0"
                  x2="1200"
                  y2="550"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="30%" stopColor="hsl(var(--primary))" />
                  <stop
                    offset="80%"
                    stopColor="hsl(var(--background))"
                    stopOpacity="0"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--background))"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <polygon
                points="-2000,-400 -150,-400 1200,2200"
                fill="url(#beam2-gradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient
                  id="beam2-gradient"
                  x1="1200"
                  y1="0"
                  x2="0"
                  y2="2200"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="30%" stopColor="hsl(var(--primary))" />
                  <stop
                    offset="50%"
                    stopColor="hsl(var(--background))"
                    stopOpacity="0"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--background))"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Orbital paths */}

              <OrbitTrace size={90} />
              <OrbitTrace size={350} />
              <SmallPlanet
                angle={60}
                radius={350}
                color="#f7931a"
                speed={0.5}
              />
              <ImagePlanet
                angle={0}
                radius={350}
                imageUrl="/logo_rd.png"
                speed={0.6}
                size={70}
              />

              <OrbitTrace size={620} color="#999999" />
              <SmallPlanet
                angle={220}
                radius={620}
                color="#999999"
                speed={0.3}
              />
              <OrbitTrace size={750} />
              <SmallPlanet
                angle={300}
                radius={750}
                color="#f7931a"
                speed={0.8}
              />
              <polygon
                points="1200,2200 -150,-400 -2000,-400"
                fill="url(#beam3-gradient)"
                opacity="1"
                z={-40}
              />
              <defs>
                <linearGradient
                  id="beam3-gradient"
                  x1="0"
                  y1="2200"
                  x2="1200"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="hsl(var(--background))" />
                  <stop offset="55%" stopColor="hsl(var(--background))" />
                  <stop
                    offset="60%"
                    stopColor="hsl(var(--background))"
                    stopOpacity="0"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--background))"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Central sun */}

              {/* Bitcoin logo */}
              <circle
                cx="170"
                cy="208"
                r="60"
                fill="#F7931A"
                className="animate-bounce-2"
                style={{ filter: "url(#planet-glow)" }}
              />
              <text
                x="168"
                y="210"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="60"
                fontWeight="bold"
                rotate={10}
                className="animate-bounce-2"
              >
                ₿
              </text>

              {/* Sundial logo */}
              {/*<image href="/logo_rd.png" x="0" y="345" width="70" height="70" />*/}
            </svg>
          </div>
        </div>
      </div>
      <Partners />
    </HeroSection>
  );
}
