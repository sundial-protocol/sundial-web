import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { ArrowRight, Book, Sun } from "lucide-react";
import Link from "next/link";

type GuideLinkProps = {
  href: string;
  title: string;
  description: string;
};

function GuideLink(props: GuideLinkProps) {
  const { href, title, description } = props;
  return (
    <Card>
      <CardHeader>
        <Book className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">{description}</p>
        <Link href={href} className="flex items-center text-primary">
          <span>Read Guide</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function PopularTopics() {
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
              "linear-gradient(to bottom right, rgba(255, 183, 11, 0.9) 0%, rgba(255, 183, 11, 0.9) 40%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)",
            clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)",
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section>
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Popular Topics
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
              Quick access to our most frequently visited documentation.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
          <GuideLink
            href="/resources/guides/getting-started"
            title="Getting Started with Sundial Staking"
            description="Learn how to stake your Bitcoin with Sundial in a few simple steps."
          />
          <GuideLink
            href="/resources/guides/liquid-staking"
            title="Understanding Liquid Staking"
            description="Everything you need to know about Sundial's liquid staking solution."
          />
          <GuideLink
            href="/resources/guides/validators"
            title="Choosing a Validator"
            description="How to select the right validator for your staking needs."
          />
          <GuideLink
            href="/resources/guides/rewards"
            title="Staking Rewards Explained"
            description="Learn how staking rewards are calculated and distributed."
          />
          <GuideLink
            href="/resources/guides/security"
            title="Security Best Practices"
            description="Tips for keeping your staked assets secure."
          />
          <GuideLink
            href="/resources/guides/unstaking"
            title="Unstaking Process"
            description="How to unstake your Bitcoin and withdraw your assets."
          />
        </div>
      </Section>
    </SunbeamBackground>
  );
}
