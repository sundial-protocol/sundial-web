import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";

// Function to get validator data by ID
function getValidatorById(id: string) {
  const numId = Number.parseInt(id);
  return {
    id: numId,
    name: `Validator ${numId}`,
    description: `Validator ${numId} is a trusted node operator with years of experience in blockchain infrastructure.`,
    commission: (5 + (numId % 5)).toFixed(1),
    apy: (7 + (numId % 6)).toFixed(1),
    totalStaked: (1000 * numId).toFixed(0),
    uptime: (99 + (numId % 2) * 0.9).toFixed(1),
    status: numId % 10 === 0 ? "Slashed" : "Active",
    website: "https://example.com",
    address: `sundial1${numId}abcdef1234567890abcdef1234567890`,
    delegators: 50 + numId * 5,
    votingPower: ((numId * 0.5) % 10).toFixed(2),
  };
}

export default async function ValidatorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const awaitedParams = await params;
  const validator = getValidatorById(awaitedParams.id);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-4">
            <Link
              href="/validators"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              ← Back to Validators
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tighter">
                  {validator.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      validator.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {validator.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Uptime: {validator.uptime}%
                  </span>
                </div>
              </div>
              <Link
                href={`/stake?validator=${validator.id}`}
                className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
              >
                Stake with this Validator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <div className="rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-gray-700">{validator.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Website
                    </h3>
                    <a
                      href={validator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffb70b] hover:underline"
                    >
                      {validator.website.replace("https://", "")}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Address
                    </h3>
                    <p className="text-sm text-gray-900 truncate">
                      {validator.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Commission
                      </h3>
                      <p className="text-2xl font-bold">
                        {validator.commission}%
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">APY</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {validator.apy}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Staked
                      </h3>
                      <p className="text-2xl font-bold">
                        {validator.totalStaked} BTC
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Delegators
                      </h3>
                      <p className="text-2xl font-bold">
                        {validator.delegators}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Voting Power</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Voting Power
                    </h3>
                    <p className="text-2xl font-bold">
                      {validator.votingPower}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#ffb70b] h-2.5 rounded-full"
                      style={{ width: `${validator.votingPower}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border shadow-sm p-6 bg-secondary">
                <h2 className="text-xl font-bold mb-4">Staking Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Commission</span>
                    <span className="text-sm font-medium">
                      {validator.commission}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">APY</span>
                    <span className="text-sm font-medium text-green-600">
                      {validator.apy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Staked</span>
                    <span className="text-sm font-medium">
                      {validator.totalStaked} BTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Uptime</span>
                    <span className="text-sm font-medium">
                      {validator.uptime}%
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    href={`/stake?validator=${validator.id}`}
                    className="w-full inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-900"
                  >
                    Stake Now
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">
                  Why Stake with {validator.name}?
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      High uptime of {validator.uptime}%
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Competitive APY at {validator.apy}%
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Trusted by {validator.delegators} delegators
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Secure infrastructure
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border shadow-sm p-6 bg-blue-50">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Need Help?
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      If you have any questions about staking with this
                      validator, check our
                      <Link
                        href="/docs/faq"
                        className="text-blue-800 font-medium hover:underline"
                      >
                        {" "}
                        FAQ{" "}
                      </Link>
                      or
                      <Link
                        href="/docs/guides"
                        className="text-blue-800 font-medium hover:underline"
                      >
                        {" "}
                        Guides
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
