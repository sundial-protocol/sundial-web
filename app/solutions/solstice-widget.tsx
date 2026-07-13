"use client";

import { Bitcoin, Gauge, ShieldCheck, MailIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";

const highlights = [
  {
    icon: Gauge,
    title: "Claim Ratio Engine",
    description:
      "A system-wide BTC-per-RT ratio prices investment and redemption from a single source of truth.",
  },
  {
    icon: Bitcoin,
    title: "Bitcoin-Native Settlement",
    description:
      "Atomic BTC-in and RT-out settlement keeps pricing and execution aligned to the same transaction.",
  },
  {
    icon: ShieldCheck,
    title: "Reserve-First Controls",
    description:
      "Operational reserve checks and proof-of-reserves gating are designed to protect backing integrity.",
  },
];

export default function SolsticeWidget() {
  function handleSubscribe() {
    document
      .getElementById("mailing-list-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.dispatchEvent(
      new CustomEvent("preselectMailingList", { detail: { listId: 4 } }),
    );
  }

  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            top: "-250px",
            height: "900px",
            background:
              "linear-gradient(to top left, hsl(var(--primary)) 0%, hsl(var(--primary)) 30%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 78%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(0% 8%, 100% 0%, 120% 80%, 0% 100%)",
            opacity: "0.16",
          },
        },
      ]}
    >
      <Section className="relative w-full max-w-6xl mx-auto pt-16 sm:pt-20 lg:pt-6 pb-8 lg:pr-24">
        <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5 px-3 py-4 shadow-2xl backdrop-blur-xl sm:px-4 sm:py-5 md:rounded-[28px] md:px-10 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,196,57,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_25%)] pointer-events-none" />

          <div className="relative mx-auto grid max-w-5xl gap-3 lg:gap-0 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Upcoming Product
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/60">
                  BTC Yield Vault
                </p>
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Solstice
                </h2>
                <p className="mx-auto max-w-xl text-base text-foreground/80 md:text-xl lg:mx-0">
                  Solstice is our next Bitcoin-native vault experience: BTC in,
                  receipt tokens out, with yield expressed through a rising
                  claim ratio over time.
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:items-center lg:justify-start">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background text-center whitespace-nowrap opacity-50 pointer-events-none cursor-not-allowed grayscale"
                  aria-disabled
                >
                  Coming Soon
                </button>
                <p className="text-sm text-foreground/60">
                  Launch details will be announced soon
                </p>
              </div>
            </div>

            <div className="grid max-w-[520px] gap-3 mt-8 justify-self-center lg:mt-20 lg:justify-self-end">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-sm border border-white/10 bg-secondary/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-foreground/70">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 -rotate-90 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Solstice Updates <MailIcon className="h-4 w-4" />
        </button>
      </Section>
    </SunbeamBackground>
  );
}
