import { HeroSection } from "@/components/ui/hero-section";
import Image from "next/image";
import { L2Architecture } from "./l2-architecture";
import DawnTestnet from "./dawn-testnet";
import UseCases from "./use-cases";
import AlchemyWidget from "./alchemy-widget";

export default function Home() {
  return (
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
              Built on Bitcoin&apos;s Ledger Model
            </h1>
            <p className="text-lg md:text-xl text-foreground/80">
              Sundial leverages a UTXO architecture to deliver
              institutional-grade security, deterministic execution, and
              fraud-proof protection for Bitcoin yield
            </p>
          </div>
        </section>
      </HeroSection>

      {/*<EnterpriseSolutions />*/}
      <AlchemyWidget />
      <DawnTestnet />

      <L2Architecture />
      <UseCases />
      {/* <Partners classes="py-8 w-3/4 mx-auto" /> */}
    </div>
  );
}
