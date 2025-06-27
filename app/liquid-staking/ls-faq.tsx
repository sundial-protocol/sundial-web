import { Section } from "@/components/ui/section";

export default function LSFAQ() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Liquid Staking FAQ
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
            Common questions about liquid staking with Sundial.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
        <div className="rounded-sm border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            What is the difference between regular staking and liquid staking?
          </h3>
          <p className="text-gray-500">
            Regular staking locks up your Bitcoin for a period of time, while
            liquid staking gives you a token ($SUN) that represents your staked
            Bitcoin, allowing you to use it in DeFi applications while still
            earning staking rewards.
          </p>
        </div>
        <div className="rounded-sm border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            How do I redeem my $SUN for Bitcoin?
          </h3>
          <p className="text-gray-500">
            You can redeem your $SUN for Bitcoin at any time through our
            platform. There are two options: instant redemption via liquidity
            pools (may include a small fee) or standard redemption (7-day
            unbonding period).
          </p>
        </div>
        <div className="rounded-sm border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            Is there a minimum amount for liquid staking?
          </h3>
          <p className="text-gray-500">
            No, there is no minimum amount required for liquid staking. You can
            stake any amount of Bitcoin and receive the equivalent in $SUN.
          </p>
        </div>
        <div className="rounded-sm border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Where can I use my $SUN?</h3>
          <p className="text-gray-500">
            $SUN can be used in various DeFi applications within the Sundial
            ecosystem, including lending platforms, liquidity pools, and yield
            farming opportunities.
          </p>
        </div>
        <div className="rounded-sm border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            How are staking rewards distributed for liquid staking?
          </h3>
          <p className="text-gray-500">
            Staking rewards are automatically reflected in the increasing value
            of $SUN relative to Bitcoin. As rewards accrue, each $SUN becomes
            worth more Bitcoin.
          </p>
        </div>
        <div className="rounded-sm border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Is liquid staking secure?</h3>
          <p className="text-gray-500">
            Yes, Sundial&apos;s liquid staking solution is built with security
            as a priority. All staked Bitcoin is secured by our network of
            validators, and the $SUN token contract has been audited by leading
            security firms.
          </p>
        </div>
      </div>
    </Section>
  );
}
