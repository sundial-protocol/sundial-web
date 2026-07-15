import MaintenanceSunset from "@/components/reusable-sections/maintenance-sunset/maintenance-sunset";

export default function GuidesPage() {
  return (
    <MaintenanceSunset />
    // <div className="flex flex-col min-h-screen pb-12">
    //   <HeroSection classes="bg-gradient-to-b from-background to-primary/20">
    //     <div className="flex flex-col space-y-4">
    //       <Link
    //         href="/resources"
    //         className="inline-flex items-center text-sm font-medium text-foreground/80 hover:text-foreground/50"
    //       >
    //         <ArrowLeft className="mr-1 h-4 w-4" />
    //         Back to Documentation
    //       </Link>
    //       <div className="space-y-2">
    //         <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
    //           Guides
    //         </h1>
    //         <p className="text-gray-500 md:text-lg">
    //           Step-by-step guides to help you get started with Sundial staking.
    //         </p>
    //       </div>
    //     </div>
    //   </HeroSection>

    //   <SunbeamBackground
    //     beams={[
    //       {
    //         styles: {
    //           content: '""',
    //           position: "absolute",
    //           left: "0",
    //           top: "150px",
    //           width: "100%",
    //           height: "600px", // Match the height of the triangle
    //           background:
    //             " linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
    //           clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)", // Triangle shape
    //           zIndex: "-1",
    //           opacity: "0.3",
    //         },
    //       },
    //     ]}
    //   >
    //     <Section>
    //       <div className="mx-auto max-w-5xl space-y-12">
    //         <div>
    //           <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
    //           <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
    //             <GuideLink
    //               href="/resources/guides/getting-started"
    //               title="Getting Started with Sundial Staking"
    //               description="Learn how to stake your Bitcoin with Sundial in a few simple steps."
    //             />
    //             <GuideLink
    //               href="/resources/guides/wallet-setup"
    //               title="Setting Up Your Wallet"
    //               description="How to set up and connect your Bitcoin wallet to Sundial."
    //             />
    //           </div>
    //         </div>

    //         <div>
    //           <h2 className="text-2xl font-bold mb-6">Staking</h2>
    //           <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
    //             <GuideLink
    //               href="docs/guides/staking-process"
    //               title="The Staking Process Explained"
    //               description="A detailed explanation of how staking works on Sundial."
    //             />
    //             <GuideLink
    //               href="/resources/guides/validators"
    //               title="Choosing a Validator"
    //               description="How to select the right validator for your staking needs."
    //             />
    //             <GuideLink
    //               href="/resources/guides/rewards"
    //               title="Staking Rewards Explained"
    //               description="Learn how staking rewards are calculated and distributed."
    //             />
    //             <GuideLink
    //               href="/resources/guides/unstaking"
    //               title="Unstaking Your Bitcoin"
    //               description="How to unstake your Bitcoin and withdraw your assets."
    //             />
    //           </div>
    //         </div>

    //         <div>
    //           <h2 className="text-2xl font-bold mb-6">Security</h2>
    //           <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
    //             <GuideLink
    //               href="/resources/guides/security"
    //               title="Security Best Practices"
    //               description="Tips for keeping your staked assets secure."
    //             />
    //             <GuideLink
    //               href="/resources/guides/wallet-security"
    //               title="Wallet Security"
    //               description="How to secure your Bitcoin wallet when staking."
    //             />
    //           </div>
    //         </div>
    //       </div>
    //     </Section>
    //   </SunbeamBackground>
    // </div>
  );
}
