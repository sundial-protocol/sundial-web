import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import Image from "next/image";

function TeamMember({
  name,
  role,
  image,
  link,
  description,
}: {
  name: string;
  role: string;
  image: string;
  link: string;
  description?: string;
}) {
  return (
    <a
      href={link}
      className="flex flex-col items-center text-center p-6 bg-primary-foreground/20 backdrop-blur-sm rounded-xs shadow-sm hover:shadow-primary/60 transition-shadow btn-effect-shine"
    >
      <Image
        src={image}
        alt={name}
        height={100}
        width={100}
        className="w-36 h-36 rounded-full mb-4"
      />
      <h2 className="text-2xl font-bold text-primary">{name}</h2>
      <p>{role}</p>
      <p className="text-gray-500 text-sm">{description ?? ""}</p>
    </a>
  );
}

export default function Team() {
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
              "linear-gradient(to top left, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)", // Triangle shape
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section className="py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col px-12 lg:pt-24 items-center text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
              Our Team
            </h1>
            <span className="text-foreground/90 md:text-lg">
              We're working around the dial to bring next-generation DeFi
              functionality to Bitcoin, Litecoin, Cardano, and Dogecoin, among
              others.
            </span>
          </div>
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:col-span-2 gap-6 p-4 md:p-6">
            <TeamMember
              name="Sheldon Hunt"
              role="CEO"
              image="/team/sheldon.jpg"
              link="https://x.com/_MrHunt_"
              description="Ex-Head of Cardano Ecosystem"
            />

            <TeamMember
              name="Michael Yagi"
              role="Developer & Ecosystem"
              image="/team/michael.png"
              link="https://x.com/gubguub"
              description="Founder of Ikigai Technologies"
            />

            <TeamMember
              name="Yoram Benzvi"
              role="Business Development & Partnerships"
              image="/team/yoram.png"
              link="https://x.com/yorambenzvi"
            />

            <TeamMember
              name="Sam Delaney"
              role="Senior Developer"
              image="/team/sam.jpg"
              link="https://x.com/sde_laney"
              description="Founder of Grabbit"
            />

            <TeamMember
              name="Phil Disarro"
              role="Senior Developer"
              image="/team/phil.png"
              link="https://x.com/uplc_phil"
              description="Founder of Anastasia Labs"
            />

            <TeamMember
              name="Appold Team"
              role="Operations & Project Management"
              image="/team/appold-logo.svg"
              link="https://www.linkedin.com/company/appold/"
            />

            {/*<TeamMember
              name="Lewis Harding"
              role="Investor Relations & Operations"
              image="/team/lewis.jpg"
              link="https://x.com/Lewis_Harding13"
            />*/}
          </div>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
