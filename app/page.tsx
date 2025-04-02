import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                <span className="text-[#ffb70b]">Sundial</span> The Super UTxO L2 Networking
                </h1>
                <p className="text-xl md:text-2xl text-gray-700">
                  Unlock Bitcoin&apos;s $1.5 Trillion Liquidity, Yield & Utility with <span className="text-[#0033AA]">Cardano</span> Smart Contracts.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/stake"
                  className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
                >
                  Stake Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-square">
                <svg width="100%" height="100%" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Orbital paths */}
                  <ellipse
                    cx="250"
                    cy="250"
                    rx="200"
                    ry="120"
                    stroke="#ffb70b"
                    strokeWidth="2"
                    transform="rotate(30 250 250)"
                  />
                  <ellipse
                    cx="250"
                    cy="250"
                    rx="220"
                    ry="150"
                    stroke="#F7931A"
                    strokeWidth="2"
                    transform="rotate(-15 250 250)"
                  />

                  {/* Bitcoin logo */}
                  <circle cx="180" cy="220" r="40" fill="#F7931A" />
                  <text
                    x="180"
                    y="220"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="40"
                    fontWeight="bold"
                  >
                    ₿
                  </text>

                  {/* TODO: Sundial logo */}
                  <circle cx="345" cy="300" r="40" fill="#ffb70b" />
                  <text
                    x="345"
                    y="300"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="24"
                    fontWeight="bold"
                  >
                    $SUN
                  </text>

                  {/* Orbital points */}
                  <circle cx="100" cy="250" r="5" fill="#F7931A" />
                  <circle cx="400" cy="250" r="5" fill="#ffb70b" />
                  <circle cx="250" cy="150" r="5" fill="#F7931A" />
                  <circle cx="250" cy="350" r="5" fill="#ffb70b" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Stake with Sundial?</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Sundial offers a unique dual staking mechanism that maximizes your Bitcoin yields while maintaining
                security.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-[#ffb70b]/20 p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#ffb70b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 9H9V15H15V9Z"
                    stroke="#ffb70b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">High Yields</h3>
              <p className="text-center text-gray-500">
                Earn up to 10% APY on your Bitcoin through our dual staking mechanism.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-[#ffb70b]/20 p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#ffb70b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 16V12" stroke="#ffb70b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8H12.01" stroke="#ffb70b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Security</h3>
              <p className="text-center text-gray-500">
                Your assets are secured by our decentralized network of validators.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-[#ffb70b]/20 p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#ffb70b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 14L12 10L16 14"
                    stroke="#ffb70b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Liquidity</h3>
              <p className="text-center text-gray-500">
                Maintain liquidity with our liquid staking solution while earning rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Sundial&apos;s dual staking mechanism is simple and efficient.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb70b] text-white">1</div>
              <h3 className="text-xl font-bold">Deposit Bitcoin</h3>
              <p className="text-gray-500">Connect your wallet and deposit your Bitcoin to start staking.</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb70b] text-white">2</div>
              <h3 className="text-xl font-bold">Choose Validators</h3>
              <p className="text-gray-500">Select from our network of trusted validators to stake with.</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb70b] text-white">3</div>
              <h3 className="text-xl font-bold">Earn Rewards</h3>
              <p className="text-gray-500">Start earning staking rewards immediately with competitive APY.</p>
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <Link
              href="/stake"
              className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
            >
              Start Staking
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Top Validators</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Our network consists of trusted validators with proven track records.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            {[1, 2, 3].map((id) => (
              <Link
                key={id}
                href={`/validators/${id}`}
                className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary-foreground border-foreground/10 border-2 p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#ffb70b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Validator {id}</h3>
                    <p className="text-sm text-gray-500">Commission: {5 + id}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span>APY</span>
                    <span className="font-bold">{7 + id}%</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Total Staked</span>
                    <span className="font-bold">{1000 * id} BTC</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link
              href="/validators"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 h-12 px-8 text-base font-medium transition-colors hover:bg-secondary"
            >
              View All Validators
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

