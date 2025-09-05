import { LucideArrowRight, LucideSquareArrowRight } from "lucide-react";
import { Section } from "../ui/section";

export default function HedgeCTA() {
  return (
    <Section className="py-12 md:pb-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Empowering Your Bitcoin Treasury to Be More Than Just a Hedge
          </h2>
          <p className="mx-auto max-w-[700px] text-foreground/90 md:text-lg">
            Join leading institutions leveraging Sundial's secure infrastructure
            for sustainable Bitcoin yield
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://calendly.com/lewis-sundialprotocol/new-meeting"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-foreground text-background h-12 p-8 text-base font-medium transition-colors hover:bg-foreground/70"
          >
            Schedule a Consultation <LucideArrowRight className="ml-2" />
          </a>
        </div>
      </div>
    </Section>
  );
}
