import { Section } from "@/components/ui/section";

export function AdvancedFeatures() {
  return (
    <Section>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2 py-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Advanced Features
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Explore the advanced features of Sundial staking.
            </p>
          </div>
        </div>
        <div className="grid w-full auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-3 md:grid-rows-[200px_250px] md:max-h-[500px] grid-rows-none max-h-none">
          <div className="flex flex-col col-span-2 justify-center p-6 bg-secondary rounded-lg shadow-sm hover:shadow-primary/60 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold">Native UTXO Security</h2>
            <p className="text-gray-500">
              No wallet drainers, no smart contract compromises, no failed
              transactions, no outages. Only full UTXO security.
            </p>
          </div>
          <div className="flex flex-col justify-center p-6 bg-primary rounded-lg shadow-sm hover:shadow-primary/60 hover:shadow-md transition-shadow">
            <h2 className="text-xl text-black font-bold">Gas Abstraction</h2>
            <p className="text-gray-500">
              Pay transactions with any token, unlocking incredible new
              possibilities for Dapps and DeFi.
            </p>
          </div>
          <div className="flex flex-col justify-center p-6 bg-accent-foreground rounded-lg shadow-sm hover:shadow-primary/60 hover:shadow-md transition-shadow">
            <h2 className="text-xl text-accent font-bold">ZK Bridge</h2>
            <p className="text-gray-500">
              Trustless rollup bridge. Interoperable with metaprotocols and
              secured by ZK proofs.
            </p>
          </div>
          <div className="flex flex-col col-span-2 justify-center p-6 bg-secondary rounded-lg shadow-sm hover:shadow-primary/60 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold">Cardano Defi & Gaming</h2>
            <p className="text-gray-500">
              Partnered with Cardano&apos;s largest DeFi and gaming protocols.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
