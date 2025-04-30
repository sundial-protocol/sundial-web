import Link from "next/link";
import { ArrowRight, Book, FileText, HelpCircle } from "lucide-react";

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

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container px-4 md:px-6">
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
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <Link
              href="/docs/guides"
              className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <Book className="h-6 w-6 text-[#ffb70b]" />
                <h2 className="text-xl font-bold">Guides</h2>
              </div>
              <p className="text-gray-500">
                Step-by-step guides to help you get started with Sundial
                staking.
              </p>
              <div className="flex items-center text-[#ffb70b]">
                <span>View Guides</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
            <Link
              href="/docs/faq"
              className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-6 w-6 text-[#ffb70b]" />
                <h2 className="text-xl font-bold">FAQ</h2>
              </div>
              <p className="text-gray-500">
                Frequently asked questions about Sundial staking.
              </p>
              <div className="flex items-center text-[#ffb70b]">
                <span>View FAQ</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
            <Link
              href="/docs/api"
              className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-[#ffb70b]" />
                <h2 className="text-xl font-bold">API Reference</h2>
              </div>
              <p className="text-gray-500">
                Technical documentation for developers.
              </p>
              <div className="flex items-center text-[#ffb70b]">
                <span>View API Reference</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
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
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Need Help?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                Can&apos;t find what you&apos;re looking for? Our support team
                is here to help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 h-12 px-8 text-base font-medium transition-colors hover:bg-secondary"
              >
                Join Discord
              </a>
              <a
                href="mailto:sheldon@sundialprotocol.com"
                className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
