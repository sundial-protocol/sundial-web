import { Section } from "@/components/ui/section";
import Link from "next/link";

type StepProps = {
  number: number;
  title: string;
  description: string;
};

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center space-y-2 text-center rounded-lg bg-background border border-primary/20 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
        {number}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <Section className="rounded-lg bg-background/50 px-8 py-24">
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
        <Step
          number={1}
          title="Deposit Bitcoin"
          description="Connect your wallet and deposit your Bitcoin to start staking."
        />
        <Step
          number={2}
          title="Choose Validators"
          description="Select from our network of trusted validators to stake with."
        />
        <Step
          number={3}
          title="Earn Rewards"
          description="Start earning staking rewards immediately with competitive APY."
        />
      </div>
      <div className="flex justify-center mt-12">
        <Link
          href="/stake"
          className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900 border border-primary/20"
        >
          Start Staking
        </Link>
      </div>
    </Section>
  );
}
