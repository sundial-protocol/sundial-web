import Link from "next/link";
import { ArrowRight, Book, FileText, HelpCircle } from "lucide-react";
import { Section } from "@/components/ui/section";
import PopularTopics from "./popular-topics";
import HelpCTA from "@/components/reusable-sections/help-cta";
import { HeroSection } from "@/components/ui/hero-section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PageLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <Book className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">{title}</h2>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">{description}</p>
        <Link className="flex items-center text-primary" href={href}>
          <span>View {title}</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection classes="bg-gradient-to-b from-primary/20 to-background pb-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Documentation
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Learn everything you need to know about Sundial staking.
            </p>
          </div>
        </div>
      </HeroSection>

      <SunbeamBackground
        beams={[
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "0px",
              width: "100%",
              height: "600px",
              background:
                "linear-gradient(to bottom left, rgba(255, 183, 11, 0.9) 0%, rgba(255, 183, 11, 0.9) 40%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)",
              clipPath: "polygon(190% 100%, 0% 0%, 0% 66%)",
              zIndex: "-1",
              opacity: "0.3",
            },
          },
        ]}
      >
        <Section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <PageLink
              href="/docs/guides"
              title="Guides"
              description="Step-by-step guides to help you get started with Sundial staking."
            />
            <PageLink
              href="/docs/faq"
              title="FAQ"
              description="Frequently asked questions about Sundial staking."
            />
            <PageLink
              href="/docs/whitepaper"
              title="Whitepaper"
              description="Learn how it all works!"
            />
          </div>
        </Section>
      </SunbeamBackground>

      <PopularTopics />
      <HelpCTA />
    </div>
  );
}
