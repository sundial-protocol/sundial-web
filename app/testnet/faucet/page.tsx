import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

import { FaucetForm } from "./faucet-form";

export const metadata: Metadata = {
  title: "Sundial L2 Testnet Faucet | Sundial",
  description: "Request Sundial testnet sBTC through the Sundial faucet.",
};

export default function TestnetFaucetPage() {
  return (
    <Section className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/60">
            Sundial Testnet
          </p>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Sundial L2 Testnet Faucet
          </h1>
          <p className="mx-auto max-w-2xl text-base text-foreground/75 sm:text-lg">
            Request Sundial testnet sBTC through the Sundial faucet. Paste a
            Sundial testnet payment address manually.
          </p>
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 px-3 py-1 text-primary"
            >
              Test tokens only. No monetary value.
            </Badge>
          </div>
        </div>

        <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardContent className="rounded-sm bg-background/95 p-6 sm:p-8">
            <FaucetForm />
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
