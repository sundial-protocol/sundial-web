import Link from "next/link"
import { ArrowRight, Check, RefreshCw } from "lucide-react"

export default function LiquidStakingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Liquid Staking</h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Stake your Bitcoin while maintaining liquidity with Sundial&apos;s liquid staking solution.
              </p>
            </div>
            <Link
              href="/stake?type=liquid"
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
            >
              Start Liquid Staking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">What is Liquid Staking?</h2>
              <p className="text-gray-500 md:text-lg">
                Liquid staking allows you to stake your Bitcoin while receiving a liquid token ($SUN) that represents
                your staked assets. This means you can use your staked Bitcoin in DeFi applications while still earning
                staking rewards.
              </p>
              <p className="text-gray-500 md:text-lg">
                With Sundial&apos;s liquid staking, you get the best of both worlds: the security and rewards of staking,
                plus the flexibility and liquidity of having tradable tokens.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6 bg-secondary">
              <h3 className="text-xl font-bold mb-4">Liquid Staking Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Earn staking rewards while maintaining liquidity</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Use your $SUN in DeFi applications</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">No lockup period</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Instant unstaking via liquidity pools</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Competitive APY</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How Liquid Staking Works</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                Sundial&apos;s liquid staking process is simple and user-friendly.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb70b] text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Deposit Bitcoin</h3>
              <p className="text-gray-500">Connect your wallet and deposit your Bitcoin.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb70b] text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">Receive $SUN</h3>
              <p className="text-gray-500">Get $SUN tokens that represent your staked Bitcoin.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb70b] text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Use in DeFi</h3>
              <p className="text-gray-500">Use your $SUN in various DeFi applications.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb70b] text-white text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold">Earn Rewards</h3>
              <p className="text-gray-500">Earn staking rewards while maintaining liquidity.</p>
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <Link
              href="/stake?type=liquid"
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
            >
              Start Liquid Staking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-square">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-3/4 h-3/4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="h-16 w-16 text-[#ffb70b] animate-spin-slow" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-full p-4 shadow-lg">
                        <img src="./logo.png" className="w-full h-full rounded-full"></img>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">$SUN: Sundial&apos;s Liquid Staking Token</h2>
              <p className="text-gray-500 md:text-lg">
                $SUN is Sundial&apos;s liquid staking token that represents your staked Bitcoin. Each $SUN is backed 1:1 by
                staked Bitcoin and accrues staking rewards over time.
              </p>
              <p className="text-gray-500 md:text-lg">
                As staking rewards are earned, the value of $SUN increases relative to Bitcoin. This means your $SUN
                becomes more valuable over time, reflecting both your initial stake and the accumulated rewards.
              </p>
              <div className="pt-4">
                <Link href="/docs/$SUN" className="inline-flex items-center text-[#ffb70b] hover:underline">
                  Learn more about $SUN
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Liquid Staking FAQ</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                Common questions about liquid staking with Sundial.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">
                What is the difference between regular staking and liquid staking?
              </h3>
              <p className="text-gray-500">
                Regular staking locks up your Bitcoin for a period of time, while liquid staking gives you a token
                ($SUN) that represents your staked Bitcoin, allowing you to use it in DeFi applications while still
                earning staking rewards.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">How do I redeem my $SUN for Bitcoin?</h3>
              <p className="text-gray-500">
                You can redeem your $SUN for Bitcoin at any time through our platform. There are two options: instant
                redemption via liquidity pools (may include a small fee) or standard redemption (7-day unbonding
                period).
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Is there a minimum amount for liquid staking?</h3>
              <p className="text-gray-500">
                No, there is no minimum amount required for liquid staking. You can stake any amount of Bitcoin and
                receive the equivalent in $SUN.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Where can I use my $SUN?</h3>
              <p className="text-gray-500">
                $SUN can be used in various DeFi applications within the Sundial ecosystem, including lending platforms,
                liquidity pools, and yield farming opportunities.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">How are staking rewards distributed for liquid staking?</h3>
              <p className="text-gray-500">
                Staking rewards are automatically reflected in the increasing value of $SUN relative to Bitcoin. As
                rewards accrue, each $SUN becomes worth more Bitcoin.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Is liquid staking secure?</h3>
              <p className="text-gray-500">
                Yes, Sundial&apos;s liquid staking solution is built with security as a priority. All staked Bitcoin is
                secured by our network of validators, and the $SUN token contract has been audited by leading security
                firms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Try Liquid Staking?</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                Experience the benefits of staking while maintaining liquidity with Sundial&apos;s liquid staking solution.
              </p>
            </div>
            <Link
              href="/stake?type=liquid"
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
            >
              Start Liquid Staking Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

