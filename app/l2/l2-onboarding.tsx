import Link from "next/link";
import { Droplets, FileText, LayoutDashboard } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Flags } from "@/lib/flags";

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  number: number;
  title: string;
  description: string;
  href: string;
  cta: string;
  external?: boolean;
  disabled?: boolean;
};

const steps: Step[] = [
  {
    icon: Droplets,
    number: 1,
    title: "Get Testnet sBTC",
    description:
      "Request Sundial testnet sBTC through the faucet to start testing the L2 with no real funds at risk.",
    href: "/testnet/faucet",
    cta: "Open the Faucet",
    disabled: Flags.DISABLE_TESTNET,
  },
  {
    icon: FileText,
    number: 2,
    title: "Read the Docs",
    description:
      "Full L2 protocol documentation covering the sequencer, state model, and integration paths for developers.",
    href: "/resources",
    cta: "View Documentation",
  },
  {
    icon: LayoutDashboard,
    number: 3,
    title: "Explore the Testnet App",
    description:
      "See the Bitcoin yield experience live: lock BTC, mint on the eUTXO layer, and watch it settle back to L1.",
    href: "/dashboard",
    cta: "Open the Dashboard",
    disabled: Flags.DISABLE_DASHBOARD,
  },
];

export function L2Onboarding() {
  return (
    <Section className="pt-24 pb-16">
      <div className="container px-4 md:px-6 space-y-2 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Get Onboard
        </h2>
        <p className="text-foreground/90 md:text-xl">
          Start building on and testing the Sundial L2.
        </p>
      </div>

      <div className="container px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="flex flex-col p-6 bg-secondary/90 rounded-sm shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary font-bold">
                  {step.number}
                </div>
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-gray-500 mt-2 flex-1">{step.description}</p>
              <Link
                href={step.href}
                target={step.external ? "_blank" : undefined}
                aria-disabled={step.disabled}
                className={`inline-flex h-10 items-center justify-center rounded-full mt-4 px-6 text-sm font-medium text-background bg-foreground transition-colors ${
                  step.disabled
                    ? "opacity-50 pointer-events-none cursor-not-allowed grayscale"
                    : "hover:bg-foreground/80"
                }`}
              >
                {step.disabled ? "Coming Soon" : step.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
