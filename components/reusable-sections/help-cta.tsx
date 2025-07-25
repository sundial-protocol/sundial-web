import { Section } from "../ui/section";

export default function HelpCTA() {
  return (
    <Section className="pb-12 md:pb-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Need Help?
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
            Can&apos;t find what you&apos;re looking for? Our support team is
            here to help.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 h-12 px-8 text-base font-medium transition-colors hover:bg-gray-300"
          >
            Join Discord
          </a>
          <a
            href="mailto:info@sundialprotocol.com"
            className="inline-flex items-center justify-center rounded-full bg-black text-white h-12 px-8 text-base font-medium transition-colors hover:bg-gray-800"
          >
            Contact Support
          </a>
        </div>
      </div>
    </Section>
  );
}
