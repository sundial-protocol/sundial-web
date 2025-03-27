import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

export default function StakingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Bitcoin Staking</h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Earn passive income by staking your Bitcoin with Sundial.
              </p>
            </div>
            <Link
              href="/stake"
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
            >
              Start Staking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">What is Bitcoin Staking?</h2>
              <p className="text-gray-500 md:text-lg">
                Bitcoin staking is a process where you lock up your Bitcoin to support the Sundial network and earn rewards
                in return. It&apos;s a way to put your Bitcoin to work and earn passive income.
              </p>
              <p className="text-gray-500 md:text-lg">
                When you stake your Bitcoin with Sundial, you&apos;re helping to secure the network while earning
                competitive yields on your holdings.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6 bg-secondary">
              <h3 className="text-xl font-bold mb-4">Staking Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Earn up to 10% APY on your Bitcoin</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Support the Sundial network and ecosystem</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">No technical knowledge required</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Secure and non-custodial</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Stake any amount of Bitcoin</span>
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How to Stake Bitcoin</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                Staking your Bitcoin with Sundial is simple and straightforward.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb70b] text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Connect Your Wallet</h3>
              <p className="text-gray-500">Connect your Bitcoin wallet to the Sundial staking platform.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb70b] text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">Choose a Validator</h3>
              <p className="text-gray-500">Select a validator from our network to stake your Bitcoin with.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb70b] text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Stake & Earn</h3>
              <p className="text-gray-500">Stake your Bitcoin and start earning rewards immediately.</p>
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <Link
              href="/stake"
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
            >
              Start Staking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Staking FAQ</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                Common questions about Bitcoin staking with Sundial.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Is there a minimum amount to stake?</h3>
              <p className="text-gray-500">
                No, there is no minimum amount required to stake Bitcoin with Sundial. You can stake any amount you&apos;re
                comfortable with.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">How often are rewards distributed?</h3>
              <p className="text-gray-500">
                Staking rewards are distributed daily and automatically added to your staking balance.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Can I unstake my Bitcoin at any time?</h3>
              <p className="text-gray-500">
                Yes, you can unstake your Bitcoin at any time. There is a 7-day unbonding period before your Bitcoin is
                returned to your wallet.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Is staking secure?</h3>
              <p className="text-gray-500">
                Yes, staking with Sundial is secure and non-custodial. You maintain control of your Bitcoin at all times.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">What is the APY for staking?</h3>
              <p className="text-gray-500">
                The APY for staking Bitcoin with Sundial ranges from 5% to 10%, depending on the validator you choose and
                network conditions.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Do I need technical knowledge to stake?</h3>
              <p className="text-gray-500">
                No, our staking platform is designed to be user-friendly and accessible to everyone, regardless of
                technical knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Start Earning?</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                Join thousands of Bitcoin holders who are already earning passive income with Sundial.
              </p>
            </div>
            <Link
              href="/stake"
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
            >
              Start Staking Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

