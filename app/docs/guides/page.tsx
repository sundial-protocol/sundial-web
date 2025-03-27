import Link from "next/link"
import { ArrowLeft, ArrowRight, Book } from "lucide-react"

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
                <Link
                  href="/docs/guides/getting-started"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Getting Started with Sundial Staking</h3>
                  </div>
                  <p className="text-gray-500">Learn how to stake your Bitcoin with Sundial in a few simple steps.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/docs/guides/wallet-setup"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Setting Up Your Wallet</h3>
                  </div>
                  <p className="text-gray-500">How to set up and connect your Bitcoin wallet to Sundial.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Staking</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                <Link
                  href="/docs/guides/staking-process"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">The Staking Process Explained</h3>
                  </div>
                  <p className="text-gray-500">A detailed explanation of how staking works on Sundial.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/docs/guides/validators"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Choosing a Validator</h3>
                  </div>
                  <p className="text-gray-500">How to select the right validator for your staking needs.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/docs/guides/rewards"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Staking Rewards Explained</h3>
                  </div>
                  <p className="text-gray-500">Learn how staking rewards are calculated and distributed.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/docs/guides/unstaking"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Unstaking Process</h3>
                  </div>
                  <p className="text-gray-500">How to unstake your Bitcoin and withdraw your assets.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Liquid Staking</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                <Link
                  href="/docs/guides/liquid-staking"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Understanding Liquid Staking</h3>
                  </div>
                  <p className="text-gray-500">
                    Everything you need to know about Sundial&apos;s liquid staking solution.
                  </p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/docs/guides/$SUN"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">$SUN: Sundial&apos;s Liquid Staking Token</h3>
                  </div>
                  <p className="text-gray-500">
                    Learn about $SUN, how it works, and how to use it in DeFi applications.
                  </p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/docs/guides/redeeming-$SUN"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Redeeming $SUN for Bitcoin</h3>
                  </div>
                  <p className="text-gray-500">How to redeem your $SUN tokens for Bitcoin.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Security</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                <Link
                  href="/docs/guides/security"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Security Best Practices</h3>
                  </div>
                  <p className="text-gray-500">Tips for keeping your staked assets secure.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/docs/guides/wallet-security"
                  className="flex flex-col space-y-3 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-[#ffb70b]" />
                    <h3 className="text-xl font-bold">Wallet Security</h3>
                  </div>
                  <p className="text-gray-500">How to secure your Bitcoin wallet when staking.</p>
                  <div className="flex items-center text-[#ffb70b]">
                    <span>Read Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

