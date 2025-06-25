import { HeroSection } from "@/components/ui/hero-section";
import Link from "next/link";

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
};

function SmallPlanet({ angle, radius, color }: SmallPlanetProps) {
  // Center of the ellipse
  const cx = 170;
  const cy = 250 + radius / 7;
  // Ellipse radii
  const rx = radius;
  const ry = radius * Math.cos((75 * Math.PI) / 180); // squash y-radius by cos(75deg)
  // Convert angle to radians
  const rad = (angle * Math.PI) / 180;
  // Calculate position on the visually rotated ellipse
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);
  return <circle cx={x} cy={y} r={5 + y * 0.03} fill={color} />;
}

export default function Hero() {
  return (
    <HeroSection>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              MAXIMIZE <span className="text-[#f7931a]">BITCOIN</span> STAKING
              YIELD WITH{" "}
              <span className="text-primary">OPTIMISTIC ROLLUPS</span>
            </h1>
            <div className="pt-4">
              <span>
                Unlock Bitcoin's $1.5 Trillion Potential with{" "}
                <span className="text-primary">Sundial</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/stake"
              className="inline-flex items-center justify-center rounded-full h-12 px-8 text-black font-bold transition-colors bg-primary text-accent hover:bg-accent-foreground/80"
            >
              Start Staking
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
              {/* SVG recreation of the beams */}
              <polygon
                points="-2000,-400 1200,-400 1200,550"
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
                  <stop offset="0%" stopColor="rgba(255, 183, 11, 1)" />
                  <stop offset="30%" stopColor="rgba(255, 183, 11, 1)" />
                  <stop offset="80%" stopColor="rgba(0, 0, 0, 0.1)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0.1)" />
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
                  <stop offset="0%" stopColor="rgba(255, 183, 11, 1)" />
                  <stop offset="30%" stopColor="rgba(255, 183, 11, 1)" />
                  <stop offset="50%" stopColor="rgba(0, 0, 0, 0)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </linearGradient>
              </defs>

              {/* Orbital paths */}

              <OrbitTrace size={90} />
              <OrbitTrace size={350} />
              <SmallPlanet angle={60} radius={350} color="#f7931a" />
              <OrbitTrace size={620} color="#999999" />
              <SmallPlanet angle={220} radius={620} color="#999999" />
              <OrbitTrace size={750} />
              <SmallPlanet angle={300} radius={750} color="#f7931a" />
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
              <circle cx="170" cy="208" r="60" fill="#F7931A" />
              <text
                x="168"
                y="210"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="60"
                fontWeight="bold"
                rotate={10}
              >
                ₿
              </text>

              {/* Sundial logo */}
              <image href="/logo_rd.png" x="0" y="345" width="70" height="70" />
            </svg>
          </div>
        </div>
      </div>
    </HeroSection>
  );
}
