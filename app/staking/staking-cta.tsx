import { Section } from "@/components/ui/section";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StakingCTA() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Ready to Start Earning?
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
            Join thousands of Bitcoin holders who are already earning passive
            income with Sundial.
          </p>
        </div>
        <Link
          href="/stake"
          className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
        >
          Start Staking Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
