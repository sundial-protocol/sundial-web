import { Section } from "@/components/ui/section";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

export function ValidatorsPreview() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Top Validators
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            Our network consists of trusted validators with proven track
            records.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
        {[1, 2, 3].map((id) => (
          <Link
            key={id}
            href={`/validators/${id}`}
            className="flex flex-col space-y-2 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow bg-background/60 hover:brightness-105 hover:shadow-primary/30"
          >
            <div className="flex items-center px-4 py-2">
              <div className="pt-2">
                <h3 className="text-xl font-bold">Validator {id}</h3>
                <p className="text-sm text-gray-500">Commission: {5 + id}%</p>
              </div>
              <div className="rounded-full bg-primary-foreground border-foreground/10 border-2 p-2 ml-auto mt-0">
                <BadgeCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-b-lg border-t">
              <div className="flex justify-between text-sm">
                <span>APY</span>
                <span className="font-bold">{7 + id}%</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Total Staked</span>
                <span className="font-bold">{1000 * id} BTC</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <Link
          href="/validators"
          className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 h-12 px-8 text-base font-medium transition-colors hover:bg-secondary"
        >
          View All Validators
        </Link>
      </div>
    </Section>
  );
}
