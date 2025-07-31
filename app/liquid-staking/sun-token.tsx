import { Section } from "@/components/ui/section";
import { ArrowRight, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SunToken() {
  return (
    <Section>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="flex justify-center">
          <div className="relative w-full max-w-[400px] aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-16 w-16 text-primary animate-spin-slow" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <Image
                      src="./logo.png"
                      className="w-full h-full rounded-full"
                      alt="Sundial Logo"
                      width={100}
                      height={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter">
            $SUN: Sundial&apos;s Liquid Staking Token
          </h2>
          <p className="text-gray-500 md:text-lg">
            $SUN is Sundial&apos;s liquid staking token that represents your
            staked Bitcoin. Each $SUN is backed 1:1 by staked Bitcoin and
            accrues staking rewards over time.
          </p>
          <p className="text-gray-500 md:text-lg">
            As staking rewards are earned, the value of $SUN increases relative
            to Bitcoin. This means your $SUN becomes more valuable over time,
            reflecting both your initial stake and the accumulated rewards.
          </p>
          <div className="pt-4">
            <Link
              href="/resources/$SUN"
              className="inline-flex items-center text-primary hover:underline"
            >
              Learn more about $SUN
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
