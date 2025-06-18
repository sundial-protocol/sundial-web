import { Section } from "@/components/ui/section";

export function WhyStake() {
  return (
    <Section>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Why Stake with Sundial?
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            Sundial offers a unique dual staking mechanism that maximizes your
            Bitcoin yields while maintaining security.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
        <div className="flex flex-col items-center space-y-2 rounded-sm border p-6 shadow-sm">
          <div className="rounded-full bg-[#ffb70b]/20 p-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            Earn up to 10% APY on your Bitcoin through our dual staking
            mechanism.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 rounded-sm border p-6 shadow-sm">
          <div className="rounded-full bg-[#ffb70b]/20 p-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#ffb70b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16V12"
                stroke="#ffb70b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8H12.01"
                stroke="#ffb70b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Security</h3>
          <p className="text-center text-gray-500">
            Your assets are secured by our decentralized network of validators.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 rounded-sm border p-6 shadow-sm">
          <div className="rounded-full bg-[#ffb70b]/20 p-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            Maintain liquidity with our liquid staking solution while earning
            rewards.
          </p>
        </div>
      </div>
    </Section>
  );
}
