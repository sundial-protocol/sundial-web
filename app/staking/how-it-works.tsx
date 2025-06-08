import { Section } from "@/components/ui/section";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            Sundial&apos;s dual staking mechanism is simple and efficient.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb70b] text-white">
            1
          </div>
          <h3 className="text-xl font-bold">Deposit Bitcoin</h3>
          <p className="text-gray-500">
            Connect your wallet and deposit your Bitcoin to start staking.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb70b] text-white">
            2
          </div>
          <h3 className="text-xl font-bold">Choose Validators</h3>
          <p className="text-gray-500">
            Select from our network of trusted validators to stake with.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb70b] text-white">
            3
          </div>
          <h3 className="text-xl font-bold">Earn Rewards</h3>
          <p className="text-gray-500">
            Start earning staking rewards immediately with competitive APY.
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <Link
          href="/stake"
          className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
        >
          Start Staking
        </Link>
      </div>
    </Section>
  );
}
