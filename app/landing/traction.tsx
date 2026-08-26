import { Section } from "@/components/ui/section";
import { Trophy, Users, ShieldCheck, Radio } from "lucide-react";

type Stat = {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
};

const stats: Stat[] = [
  {
    icon: Radio,
    value: "Testnet Live",
    label: "L2 Testnet & Yield Dashboard live on testnet",
  },
  {
    icon: Users,
    value: "30+",
    label: "Confirmed ecosystem partnerships, with more in the pipeline",
  },
  {
    icon: Trophy,
    value: "1st Place",
    label:
      "Institutional Track, Paris Blockchain Week 2026 (3rd overall, 1,000+ companies)",
  },
  {
    icon: ShieldCheck,
    value: "3",
    label: "Independent audits completed on the live testnet",
  },
];

export function Traction() {
  return (
    <Section className="pt-16">
      <div className="container px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col p-6 bg-secondary/90 rounded-sm shadow-sm"
            >
              <Icon className="h-6 w-6 text-primary mb-3" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-foreground/70 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
