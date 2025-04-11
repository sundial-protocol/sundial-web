import Link from "next/link"
import { ArrowLeft, ArrowRight, Book } from "lucide-react"

type GuideLinkProps = {
  href: string
  title: string
  description: string
}

function GuideLink(props: GuideLinkProps) {
  const { href, title, description } = props
  return (
    <Link
    href={href}
    className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-3">
      <Book className="h-6 w-6 text-[#ffb70b]" />
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-gray-500">{description}</p>
    <div className="flex items-center text-[#ffb70b]">
      <span>Read Guide</span>
      <ArrowRight className="ml-1 h-4 w-4" />
    </div>
  </Link>
  )
}

export default function GuidesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-4">
            <Link
              href="/docs"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Documentation
            </Link>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Guides</h1>
              <p className="text-gray-500 md:text-lg">Step-by-step guides to help you get started with Sundial staking.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                <GuideLink 
                  href="/docs/guides/getting-started" 
                  title="Getting Started with Sundial Staking" 
                  description="Learn how to stake your Bitcoin with Sundial in a few simple steps." />
                <GuideLink 
                  href="/docs/guides/wallet-setup" 
                  title="Setting Up Your Wallet" 
                  description="How to set up and connect your Bitcoin wallet to Sundial." />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Staking</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                <GuideLink
                  href="docs/guides/staking-process"
                  title="The Staking Process Explained"
                  description="A detailed explanation of how staking works on Sundial."
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
                  href="/docs/guides/unstaking"
                  title="Unstaking Your Bitcoin"
                  description="How to unstake your Bitcoin and withdraw your assets."
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Liquid Staking</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                <GuideLink
                  href="/docs/guides/liquid-staking"
                  title="Understanding Liquid Staking"
                  description="Everything you need to know about Sundial's liquid staking solution."
                />
                <GuideLink
                  href="/docs/guides/$SUN"
                  title="$SUN: Sundial's Liquid Staking Token"
                  description="Learn about $SUN, how it works, and how to use it in DeFi applications."
                />
                <GuideLink
                  href="/docs/guides/redeeming-$SUN"
                  title="Redeeming $SUN for Bitcoin"
                  description="How to redeem your $SUN tokens for Bitcoin."
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Security</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                <GuideLink
                  href="/docs/guides/security"
                  title="Security Best Practices"
                  description="Tips for keeping your staked assets secure."
                />
                <GuideLink
                  href="/docs/guides/wallet-security"
                  title="Wallet Security"
                  description="How to secure your Bitcoin wallet when staking."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

