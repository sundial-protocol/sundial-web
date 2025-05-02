import { Section } from "@/components/ui/section";
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
            className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary-foreground border-foreground/10 border-2 p-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#ffb70b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Validator {id}</h3>
                <p className="text-sm text-gray-500">Commission: {5 + id}%</p>
              </div>
            </div>
            <div className="mt-4">
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
