import Image from "next/image";
import Team from "./team";
import NewsHighlights from "../news/highlights";
import { HeroSection } from "@/components/ui/hero-section";

export default function Home() {
  return (
    // <MaintenanceSunset />
    <div className="flex flex-col min-h-screen py-8">
      <HeroSection classes="bg-gradient-to-b from-primary/20 to-background pb-16">
        {/* Large Hero Section for Sundial Intro */}
        <section className="w-full pt-24 px-4 md:px-0 flex flex-col items-center">
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
              access to Bitcoin&apos;s potential for everyone.
            </p>
          </div>
        </section>
      </HeroSection>

      <Team />
      <NewsHighlights />

      {/* <Partners classes="py-8 w-3/4 mx-auto" /> */}
    </div>
  );
}
