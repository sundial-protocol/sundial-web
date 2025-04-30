import { Section } from "@/components/ui/section";
import Link from "next/link";

type GuideLinkProps = {
  href: string;
  title: string;
  description: string;
};

function GuideLink(props: GuideLinkProps) {
  const { href, title, description } = props;
  return (
    <Link
      href={href}
      className="rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow shadow-[#ffb70b] hover:shadow-[#ffb70b]/50"
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </Link>
  );
}

export default function PopularTopics() {
  return (
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
          href="/docs/guides/getting-started"
          title="Getting Started with Sundial Staking"
          description="Learn how to stake your Bitcoin with Sundial in a few simple steps."
        />
        <GuideLink
          href="/docs/guides/liquid-staking"
          title="Understanding Liquid Staking"
          description="Everything you need to know about Sundial's liquid staking solution."
        />
        <GuideLink
          href="/docs/guides/validators"
          title="Choosing a Validator"
          description="How to select the right validator for your staking needs."
        />
        <GuideLink
          href="/docs/guides/rewards"
          title="Staking Rewards Explained"
          description="Learn how staking rewards are calculated and distributed."
        />
        <GuideLink
          href="/docs/guides/security"
          title="Security Best Practices"
          description="Tips for keeping your staked assets secure."
        />
        <GuideLink
          href="/docs/guides/unstaking"
          title="Unstaking Process"
          description="How to unstake your Bitcoin and withdraw your assets."
        />
      </div>
    </Section>
  );
}
