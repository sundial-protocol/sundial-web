import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import {
  CircleGauge,
  Gamepad2,
  ShieldCheck,
  ArrowLeftRight,
  Activity,
} from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col justify-center p-6 bg-secondary/90 rounded-sm shadow-sm hover:shadow-primary/60 hover:shadow-md transition-shadow overflow-hidden ${
        className || ""
      }`}
    >
      {/* Background Icon */}
      {Icon && (
        <Icon
          className="absolute -bottom-10 -right-10 m-auto opacity-30 text-gray-500 h-[150px] w-[150px] pointer-events-none select-none"
          aria-hidden="true"
        />
      )}
      {/* Foreground Content */}
      {Icon && <Icon className="text-gray-500 h-12 w-12 pb-4 relative z-10" />}
      <h2 className="text-lg text-primary font-semibold relative z-10">
        {title}
      </h2>
      <p className="text-gray-500 relative z-10">{description}</p>
    </div>
  );
}

export function AdvancedFeatures() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Native UTXO Security",
      description:
        "No wallet drainers, no smart contract compromises, no failed transactions, no outages. Only full UTXO security.",
      className: "col-span-2 lg:col-span-4",
    },
    {
      icon: CircleGauge,
      title: "Gas Abstraction",
      description: "Pay transactions with any token, including Bitcoin.",
      className: "col-span-1 lg:col-span-2",
    },
    {
      icon: ArrowLeftRight,
      title: "ZK Bridge",
      description:
        "Trustless rollup bridge. Interoperable with metaprotocols and secured by ZK proofs.",
      className: "col-span-1 lg:col-span-3",
    },
    {
      icon: Activity,
      title: "Cardano Defi & Gaming",
      description:
        "Partnered with Cardano's largest DeFi and gaming protocols.",
      className: "col-span-2 lg:col-span-3",
    },
  ];

  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            content: '""',
            position: "absolute",
            left: "0",
            top: "150px",
            width: "100%",
            height: "600px",
            background:
              " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)",
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section className="min-h-screen flex flex-col items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 container px-4 md:px-6 z-10">
          <div className="flex flex-row justify-center space-y-4">
            <div className="space-y-2 p-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Advanced Features
              </h1>
              <p className="mx-auto max-w-[700px] text-secondary-foreground md:text-xl">
                Sundial offers a unique set of features that maximize your
                Bitcoin yields while maintaining security.
              </p>
            </div>
          </div>
          <div className="grid w-full auto-rows-min gap-4 col-span-2 grid-cols-2 md:mb-24 lg:grid-cols-6 lg:gap-3 md:max-h-[500px] grid-rows-none max-h-none">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className={feature.className}
              />
            ))}
          </div>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
