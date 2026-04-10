import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";

export function StakeHero() {
  return (
    <HeroSection classes="pb-12">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Stake Bitcoin
        </h1>
        <p className="text-gray-500 md:text-lg">
          Stake your Bitcoin with Sundial and start earning rewards.
        </p>
      </div>
    </HeroSection>
  );
}
