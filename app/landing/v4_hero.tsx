import { HeroSection } from "@/components/ui/hero-section";
import Link from "next/link";
import { LucideArrowRight } from "lucide-react";
import FeaturedPartner from "@/components/reusable-sections/featured-partner";
import { SmallPlanet, ImagePlanet } from "./orbit-planets";
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
              <g
                className="animate-bounce-2"
                style={{ filter: "url(#planet-glow)" }}
              >
                <svg
                  x="110"
                  y="148"
                  width="120"
                  height="120"
                  viewBox="0 0 4091.27 4091.73"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  overflow="visible"
                >
                  <path
                    fill="#F7931A"
                    fillRule="nonzero"
                    d="M4030.06 2540.77c-273.24,1096.01 -1383.32,1763.02 -2479.46,1489.71 -1095.68,-273.24 -1762.69,-1383.39 -1489.33,-2479.31 273.12,-1096.13 1383.2,-1763.19 2479,-1489.95 1096.06,273.24 1763.03,1383.51 1489.76,2479.57l0.02 -0.02z"
                  />
                  <path
                    fill="white"
                    fillRule="nonzero"
                    d="M2947.77 1754.38c40.72,-272.26 -166.56,-418.61 -450,-516.24l91.95 -368.8 -224.5 -55.94 -89.51 359.09c-59.02,-14.72 -119.63,-28.59 -179.87,-42.34l90.16 -361.46 -224.36 -55.94 -92 368.68c-48.84,-11.12 -96.81,-22.11 -143.35,-33.69l0.26 -1.16 -309.59 -77.31 -59.72 239.78c0,0 166.56,38.18 163.05,40.53 90.91,22.69 107.35,82.87 104.62,130.57l-104.74 420.15c6.26,1.59 14.38,3.89 23.34,7.49 -7.49,-1.86 -15.46,-3.89 -23.73,-5.87l-146.81 588.57c-11.11,27.62 -39.31,69.07 -102.87,53.33 2.25,3.26 -163.17,-40.72 -163.17,-40.72l-111.46 256.98 292.15 72.83c54.35,13.63 107.61,27.89 160.06,41.3l-92.9 373.03 224.24 55.94 92 -369.07c61.26,16.63 120.71,31.97 178.91,46.43l-91.69 367.33 224.51 55.94 92.89 -372.33c382.82,72.45 670.67,43.24 791.83,-303.02 97.63,-278.78 -4.86,-439.58 -206.26,-544.44 146.69,-33.83 257.18,-130.31 286.64,-329.61l-0.07 -0.05zm-512.93 719.26c-69.38,278.78 -538.76,128.08 -690.94,90.29l123.28 -494.2c152.17,37.99 640.17,113.17 567.67,403.91zm69.43 -723.3c-63.29,253.58 -453.96,124.75 -580.69,93.16l111.77 -448.21c126.73,31.59 534.85,90.55 468.94,355.05l-0.02 0z"
                  />
                </svg>
              </g>

              {/* Sundial logo */}
              {/*<image href="/logo_rd.png" x="0" y="345" width="70" height="70" />*/}
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute right-8 py-8 hidden lg:block">
        <FeaturedPartner />
      </div>
    </HeroSection>
  );
}
