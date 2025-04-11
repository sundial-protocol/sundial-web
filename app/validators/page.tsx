import Link from "next/link"
import { ArrowRight } from "lucide-react"

// Mock data for validators
const validators = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Validator ${i + 1}`,
  commission: (5 + (i % 5)).toFixed(1),
  apy: (7 + (i % 6)).toFixed(1),
  totalStaked: (1000 * (i + 1)).toFixed(0),
  uptime: (99 + (i % 2) * 0.9).toFixed(1),
  status: i % 10 === 0 ? "Slashed" : "Active",
}))

export default function ValidatorsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Validators</h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Explore our network of trusted validators securing the Sundial network.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Validator</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">APY</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Staked</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Uptime</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {validators.map((validator, index) => (
                    <tr key={validator.id} className={index % 2 === 0 ? "bg-background" : "bg-secondary"}>
                      <td className="px-4 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/validators/${validator.id}`}
                          className="text-sm font-medium textforeground hover:text-[#ffb70b]"
                        >
                          {validator.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{validator.commission}%</td>
                      <td className="px-4 py-4 text-sm font-medium text-foreground">{validator.apy}%</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{validator.totalStaked} BTC</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{validator.uptime}%</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            validator.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {validator.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/stake?validator=${validator.id}`}
                          className="inline-flex items-center justify-center rounded-md bg-black text-white h-8 px-4 text-xs font-medium transition-colors hover:bg-gray-900"
                        >
                          Stake
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Ready to Start Staking?</h2>
              <p className="mx-auto max-w-[600px] text-gray-500">
                Choose a validator and start earning rewards on your Bitcoin today.
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
    </div>
  )
}

