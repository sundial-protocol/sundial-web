import { Section } from "@/components/ui/section";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HowLSWorks() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            How Liquid Staking Works
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
            Sundial&apos;s liquid staking process is simple and user-friendly.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
            1
          </div>
          <h3 className="text-xl font-bold">Deposit Bitcoin</h3>
          <p className="text-gray-500">
            Connect your wallet and deposit your Bitcoin.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
            2
          </div>
          <h3 className="text-xl font-bold">Receive $SUN</h3>
          <p className="text-gray-500">
            Get $SUN tokens that represent your staked Bitcoin.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
            3
          </div>
          <h3 className="text-xl font-bold">Use in DeFi</h3>
          <p className="text-gray-500">
            Use your $SUN in various DeFi applications.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
            4
          </div>
          <h3 className="text-xl font-bold">Earn Rewards</h3>
          <p className="text-gray-500">
            Earn staking rewards while maintaining liquidity.
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <Link
          href="/stake?type=liquid"
          className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
        >
          Start Liquid Staking
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
