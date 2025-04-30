import Link from "next/link";
import { Section } from "../ui/section";
import { ArrowRight } from "lucide-react";

export default function LSCTA() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Ready to Try Liquid Staking?
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
            Experience the benefits of staking while maintaining liquidity with
            Sundial&apos;s liquid staking solution.
          </p>
        </div>
        <Link
          href="/stake?type=liquid"
          className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
        >
          Start Liquid Staking Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
