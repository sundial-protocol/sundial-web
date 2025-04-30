import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StakeCTA() {
  return (
    <section className="py-12 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
              Ready to Start Staking?
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-500">
              Choose a validator and start earning rewards on your Bitcoin
              today.
            </p>
          </div>
          <Link
            href="/stake"
            className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
          >
            Start Staking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
