import Link from "next/link";
import StakeCTA from "@/components/reusable-sections/stake-cta";
import { HeroSection } from "@/components/ui/hero-section";
import MaintenanceSunset from "@/components/reusable-sections/maintenance-sunset/maintenance-sunset";
import { Flags } from "@/lib/flags";

// Mock data for validators
const validators = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Validator ${i + 1}`,
  commission: (5 + (i % 5)).toFixed(1),
  apy: (7 + (i % 6)).toFixed(1),
  totalStaked: (1000 * (i + 1)).toFixed(0),
  uptime: (99 + (i % 2) * 0.9).toFixed(1),
  status: i % 10 === 0 ? "Slashed" : "Active",
}));

export default function ValidatorsPage() {
  if (Flags.DISABLE_VALIDATORS_PAGE) {
    return <MaintenanceSunset />;
  }

  return (
    <div className="flex flex-col min-h-screen mt-24">
      <HeroSection>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
              Validators
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Explore our network of trusted validators securing the Sundial
              network.
            </p>
          </div>
        </div>
      </HeroSection>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="rounded-sm border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Validator
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Commission
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      APY
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Total Staked
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Uptime
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validators.map((validator, index) => (
                    <tr
                      key={validator.id}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-secondary"
                      }
                    >
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/validators/${validator.id}`}
                          className="text-sm font-medium textforeground hover:text-primary"
                        >
                          {validator.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {validator.commission}%
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-foreground">
                        {validator.apy}%
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {validator.totalStaked} BTC
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {validator.uptime}%
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            validator.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {validator.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/stake?validator=${validator.id}`}
                          className="inline-flex items-center justify-center rounded-sm bg-black text-white h-8 px-4 text-xs font-medium transition-colors hover:bg-gray-900"
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
      <StakeCTA />
    </div>
  );
}
