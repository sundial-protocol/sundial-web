import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import Link from "next/link";

type StepProps = {
  number: number;
  title: string;
  description: string;
  image: string;
};

function Step({ number, title, description, image }: StepProps) {
  return (
    <Card
      className={` bg-cover bg-center rounded-lg`}
      style={{
        backgroundImage: `url(${image})`,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-left p-4 bg-blur-none rounded-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black">
          {number}
        </div>
        <h3 className="text-xl text-white font-bold pl-8">{title}</h3>
      </CardHeader>
      <CardContent className="bg-transparent flex items-center justify-center p-0">
        <div className="p-6 text-center min-h-[350px] bg-black/20 w-full">
          <p className="text-white">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HowItWorks() {
  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            content: '""',
            position: "absolute",
            left: "0",
            top: "-300px",
            width: "100%",
            height: "1600px", // Match the height of the triangle
            background:
              "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)", // Triangle shape
            zIndex: "-1",
            opacity: "0.3",
          },
        },
        // {
        //   styles: {
        //     content: '""',
        //     position: "absolute",
        //     left: "0",
        //     top: "150px",
        //     width: "100%",
        //     height: "600px", // Match the height of the triangle
        //     background:
        //       "linear-gradient(to bottom right, rgba(255, 183, 11, 0.9) 0%, rgba(255, 183, 11, 0.9) 40%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)", // Gradient from orange to black
        //     clipPath: "polygon(-90% 100%, 100% 0%, 100% 66%)", // Triangle shape
        //     zIndex: "-1",
        //     opacity: "0.3",
        //   },
        // },
      ]}
    >
      <Section className="rounded-md mx-auto w-4/5 px-8 py-12 bg-accent-foreground backdrop-blur-2xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl">
              Sundial&apos;s dual staking mechanism is simple and efficient.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          <Step
            number={1}
            title="Deposit Bitcoin"
            description="Connect your wallet and deposit your Bitcoin to start staking."
            image="/arch.jpg"
          />
          <Step
            number={2}
            title="Choose Validators"
            description="Select from our network of trusted validators to stake with."
            image="/fantasy.jpg"
          />
          <Step
            number={3}
            title="Earn Rewards"
            description="Start earning staking rewards immediately with competitive APY."
            image="/spaceman.jpg"
          />
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-full bg-background text-foreground h-12 px-8 text-base shadow-lg font-medium transition-colors hover:bg-foreground/20 border border-primary/70"
          >
            Learn More
          </Link>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
