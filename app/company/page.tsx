import MaintenanceSunset from "@/components/reusable-sections/maintenance-sunset/maintenance-sunset";
import Image from "next/image";
import Team from "./team";
import RecentNews from "./recent-news";
import Partners from "@/components/reusable-sections/partners";
import { HeroSection } from "@/components/ui/hero-section";

export default function Home() {
  return (
    // <MaintenanceSunset />
    <div className="flex flex-col min-h-screen">
      <HeroSection classes="bg-gradient-to-b from-primary/20 to-background pb-16">
        {/* Large Hero Section for Sundial Intro */}
        <section className="w-full pt-36 px-4 md:px-0 flex flex-col items-center">
          <div className="max-w-3xl text-center items-center flex flex-col">
            <Image
              src="/sundial-text-logo.png"
              alt="Sundial Logo"
              width={500}
              height={500}
            />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              The Future of Bitcoin Finance
            </h1>
            <p className="text-lg md:text-xl text-foreground/80">
              Our mission is to build the most secure, scalable, and
              user-friendly Bitcoin financial infrastructure, enabling seamless
              access to Bitcoin's potential for everyone.
            </p>
          </div>
        </section>
      </HeroSection>

      <Team />
      <RecentNews />

      <Partners classes="py-8 w-3/4 mx-auto" />
    </div>
  );
}
