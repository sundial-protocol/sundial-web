import Link from "next/link";
import { ArrowRight, Book, FileText, Sunrise } from "lucide-react";
import { Section } from "@/components/ui/section";
import { HeroSection } from "@/components/ui/hero-section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { getNews } from "@/hooks/get-news";
import HedgeCTA from "@/components/reusable-sections/hedge-cta";
import NewsList from "../news/newslist";

export function PageLink({
  href,
  title,
  description,
  icon: Icon = Book,
  newTab = false,
}: {
  href: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  newTab?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <Icon className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">{title}</h2>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">{description}</p>
        <Link
          className="flex items-center text-primary"
          href={href}
          target={newTab ? "_blank" : "_self"}
        >
          <span>View {title}</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function DocsPage() {
  const newsData = await getNews();
  const latestNews = newsData.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection classes="bg-gradient-to-b from-primary/20 to-background pb-16">
        {/* Large Hero Section for Sundial Intro */}
        <section className="w-full pb-16 pt-36 px-4 md:px-0 flex flex-col items-center">
          <div className="max-w-3xl text-center items-center flex flex-col">
            <Image
              src="/sundial-text-logo.png"
              alt="Sundial Logo"
              width={500}
              height={500}
            />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              The first sophisticated Layer-2 (L2) solution built on Bitcoin.
            </h1>
            <p className="text-lg md:text-xl text-foreground/80">
              Bitcoin and other UTXO chains (Unspent Transaction Output) have
              remained largely untapped in terms of their vast liquidity
              potential. Sundial Protocol is set to change this dynamic by
              seamlessly merging Bitcoin’s liquidity with advanced eUTXO smart
              contracts. As the first sophisticated Layer-2 (L2) solution built
              on Bitcoin, Sundial offers scalability, security, and
              institutional-grade compliance while addressing the limitations of
              existing blockchain networks.
            </p>
          </div>
        </section>
      </HeroSection>

      <SunbeamBackground
        beams={[
          {
            styles: {
              content: '""',
              position: "absolute",
              left: "0",
              top: "0px",
              width: "100%",
              height: "600px",
              background:
                "linear-gradient(to bottom left, rgba(255, 183, 11, 0.9) 0%, rgba(255, 183, 11, 0.9) 40%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)",
              clipPath: "polygon(190% 100%, 0% 0%, 0% 66%)",
              zIndex: "-1",
              opacity: "0.3",
            },
          },
        ]}
      >
        <Section>
          <div className="grid gap-6 md:grid-cols-3 lg:gap-12 px-auto mx-auto w-4/5">
            <PageLink
              href="https://sundial-protocol-docs.readthedocs.io/"
              title="Technical Documentation"
              description="Full L2 protocol documentation for developers."
              newTab
            />

            <PageLink
              icon={FileText}
              href="/resources/litepaper"
              title="Litepaper"
              description="Learn how it all works!"
            />

            <PageLink
              icon={Sunrise}
              href="/resources/roadmap"
              title="Roadmap"
              description="View our development roadmap and upcoming features."
            />
          </div>
        </Section>
      </SunbeamBackground>

      <Section className="p-24">
        <h2 className="text-2xl font-bold py-4">Latest News</h2>
        <NewsList news={latestNews} />
        <div className="flex justify-end w-full mt-6">
          <Link
            href="/news"
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <span>Read More</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <HedgeCTA />
      </Section>
    </div>
  );
}
