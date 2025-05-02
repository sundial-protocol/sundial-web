import { Section } from "@/components/ui/section";

export default function StakingFAQ() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Staking FAQ
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
            Common questions about Bitcoin staking with Sundial.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
        <div className="rounded-lg border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            Is there a minimum amount to stake?
          </h3>
          <p className="text-gray-500">
            No, there is no minimum amount required to stake Bitcoin with
            Sundial. You can stake any amount you&apos;re comfortable with.
          </p>
        </div>
        <div className="rounded-lg border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            How often are rewards distributed?
          </h3>
          <p className="text-gray-500">
            Staking rewards are distributed daily and automatically added to
            your staking balance.
          </p>
        </div>
        <div className="rounded-lg border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            Can I unstake my Bitcoin at any time?
          </h3>
          <p className="text-gray-500">
            Yes, you can unstake your Bitcoin at any time. There is a 7-day
            unbonding period before your Bitcoin is returned to your wallet.
          </p>
        </div>
        <div className="rounded-lg border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Is staking secure?</h3>
          <p className="text-gray-500">
            Yes, staking with Sundial is secure and non-custodial. You maintain
            control of your Bitcoin at all times.
          </p>
        </div>
        <div className="rounded-lg border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            What is the APY for staking?
          </h3>
          <p className="text-gray-500">
            The APY for staking Bitcoin with Sundial ranges from 5% to 10%,
            depending on the validator you choose and network conditions.
          </p>
        </div>
        <div className="rounded-lg border shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">
            Do I need technical knowledge to stake?
          </h3>
          <p className="text-gray-500">
            No, our staking platform is designed to be user-friendly and
            accessible to everyone, regardless of technical knowledge.
          </p>
        </div>
      </div>
    </Section>
  );
}
