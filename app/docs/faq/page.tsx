import Link from "next/link"
import { ArrowLeft } from "lucide-react"

function Question({q, a}: {q: string, a: string}) {
  return (
    <div className="rounded-lg border shadow-sm p-6">
      <h3 className="text-xl font-bold mb-2">{q}</h3>
      <p className="text-gray-700">{a}</p>
    </div>
  )
}

export default function FaqPage() {
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
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h1>
              <p className="text-gray-500 md:text-lg">Find answers to common questions about Sundial staking.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">General Questions</h2>
              <div className="space-y-6">
                <Question q="What is Sundial?" 
                  a="Sundial is a blockchain platform that enables Bitcoin staking through a unique dual staking mechanism. It allows Bitcoin holders to earn passive income on their holdings while contributing to the security and decentralization of the network." />
                <Question q="How does Bitcoin staking work with Sundial?" 
                  a="Sundial's Bitcoin staking works by allowing users to delegate their Bitcoin to validators who secure the network. In return, stakers earn rewards proportional to their stake. Sundial uses a dual staking mechanism that maximizes yields while maintaining security." />
                <Question q="Is staking with Sundial secure?" 
                  a="Yes, staking with Sundial is designed with security as a priority. The platform uses a decentralized network of validators, and all smart contracts have been audited by leading security firms. Additionally, Sundial implements various security measures to protect user funds." />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Staking Questions</h2>
              <div className="space-y-6">
                <Question q="What is the minimum amount required to stake?"
                  a="There is no minimum amount required to stake Bitcoin with Sundial. You can stake any amount you're comfortable with, making it accessible to all Bitcoin holders regardless of their holdings." />
                <Question q="How often are staking rewards distributed?"
                  a="Staking rewards are distributed daily and automatically added to your staking balance. This means your rewards compound over time, maximizing your returns." />
                <Question q="What is the unbonding period?"
                  a="When you decide to unstake your Bitcoin, there is a 7-day unbonding period before your Bitcoin is returned to your wallet. During this period, your Bitcoin will not earn staking rewards. This period is necessary for network security." />
                <Question q="What is the APY for staking?"
                  a="The APY (Annual Percentage Yield) for staking Bitcoin with Sundial ranges from 5% to 10%, depending on the validator you choose and network conditions. The APY can fluctuate based on various factors, including the total amount of Bitcoin staked on the network." />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Liquid Staking Questions</h2>
              <div className="space-y-6">
                <Question q="What is liquid staking?"
                  a="Liquid staking allows you to stake your Bitcoin while receiving a liquid token ($SUN) that represents your staked assets. This means you can use your staked Bitcoin in DeFi applications while still earning staking rewards, giving you the best of both worlds." />
                <Question q="What is $SUN?"
                  a="$SUN is Sundial's liquid staking token that represents your staked Bitcoin. Each $SUN is backed 1:1 by staked Bitcoin and accrues staking rewards over time. As rewards are earned, the value of $SUN increases relative to Bitcoin." />
                <Question q="How do I redeem my $SUN for Bitcoin?"
                  a="You can redeem your $SUN for Bitcoin at any time through our platform. There are two options: instant redemption via liquidity pools (may include a small fee) or standard redemption (7-day unbonding period)." />
                <Question q="Where can I use my $SUN?"
                  a="$SUN can be used in various DeFi applications within the Sundial ecosystem, including lending platforms, liquidity pools, and yield farming opportunities. The ecosystem is continuously expanding, providing more ways to utilize your $SUN." />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Validator Questions</h2>
              <div className="space-y-6">
                <Question q="How do I choose a validator?"
                  a="When choosing a validator, consider factors such as commission rate, uptime, total stake, and voting power. A lower commission means more rewards for you, while high uptime indicates reliability. You can view all validators and their performance metrics on our platform." />
                <Question q="What is validator commission?"
                  a="Validator commission is the percentage of staking rewards that validators take as a fee for their
                    services. For example, if a validator has a 5% commission and the staking reward is 10 BTC, the
                    validator would receive 0.5 BTC, and the remaining 9.5 BTC would be distributed among stakers." />
                <Question q="Can I become a validator?"
                  a="Yes, you can become a validator on the Sundial network. However, it requires technical knowledge and a
                    significant amount of Bitcoin to stake. If you're interested in becoming a validator, please
                    refer to our validator documentation for detailed requirements and setup instructions." />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

