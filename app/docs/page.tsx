import Link from "next/link";
import { ArrowRight, Book, FileText, HelpCircle } from "lucide-react";
import { Section } from "@/components/ui/section";
import PopularTopics from "./popular-topics";
import HelpCTA from "@/components/reusable-sections/help-cta";

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Documentation
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Learn everything you need to know about Sundial staking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <Link
            href="/docs/guides"
            className="flex flex-col space-y-3 rounded-sm border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <Book className="h-6 w-6 text-[#ffb70b]" />
              <h2 className="text-xl font-bold">Guides</h2>
            </div>
            <p className="text-gray-500">
              Step-by-step guides to help you get started with Sundial staking.
            </p>
            <div className="flex items-center text-[#ffb70b]">
              <span>View Guides</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
          <Link
            href="/docs/faq"
            className="flex flex-col space-y-3 rounded-sm border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-6 w-6 text-[#ffb70b]" />
              <h2 className="text-xl font-bold">FAQ</h2>
            </div>
            <p className="text-gray-500">
              Frequently asked questions about Sundial staking.
            </p>
            <div className="flex items-center text-[#ffb70b]">
              <span>View FAQ</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
          <Link
            href="/docs/api"
            className="flex flex-col space-y-3 rounded-sm border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-[#ffb70b]" />
              <h2 className="text-xl font-bold">API Reference</h2>
            </div>
            <p className="text-gray-500">
              Technical documentation for developers.
            </p>
            <div className="flex items-center text-[#ffb70b]">
              <span>View API Reference</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </div>
      </Section>

      <PopularTopics />
      <HelpCTA />
    </div>
  );
}
