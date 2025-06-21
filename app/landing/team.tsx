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
      className="flex flex-col items-center text-center p-6 rounded-xs shadow-sm hover:shadow-primary/60 transition-shadow btn-effect-shine"
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

export function Team() {
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
              "linear-gradient(to top left, rgba(255, 183, 11, 0.9) 0%, rgba(255, 183, 11, 0.9) 40%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)", // Gradient from orange to black
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)", // Triangle shape
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex justify-center pr-4 lg:pt-24 md:pr-8 pl-2">
            <h1 className="font-bold tracking-tighter text-5xl">Our Team</h1>
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
              name="Rob Gaskell"
              role="Operations & Project Management"
              image="/team/rob.jpg"
              link="https://x.com/rgaskell"
              description="Founder of Appold"
            />
          </div>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
