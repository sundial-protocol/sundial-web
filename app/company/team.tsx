"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { TeamMember, TeamMemberType } from "./team-member";

const TeamMembers: TeamMemberType[] = [
  {
    name: "Sheldon Hunt",
    role: "CEO",
    image: "/team/sheldon.jpg",
    link: "https://x.com/_MrHunt_",
    description: "Ex-Head of Cardano Ecosystem",
    bio: `Sheldon Hunt is the Founder and CEO of Sundial Protocol, former Head of Ecosystem at Emurgo and Canadian diplomat. He brings years of experience in blockchain infrastructure and ecosystem growth, having worked across UTXO-based chains and led initiatives that combine decentralised finance with cross-chain innovation.`,
  },

  {
    name: "Michael Yagi",
    role: "Developer & Ecosystem",
    image: "/team/michael.jpg",
    link: "https://x.com/gubguub",
    description: "Founder of Ikigai Technologies",
    bio: `Michael Yagi is a technology entrepreneur and creative director focused on bridging
      advanced infrastructure with engaging user experiences. Drawing on his experience as one
      of Tableau’s fastest-promoted engineers, he combines deep technical expertise with
      strategic product vision and team leadership.`,
  },

  {
    name: "Yoram Benzvi",
    role: "Business Development & Partnerships",
    image: "/team/yoram.png",
    link: "https://x.com/yorambenzvi",
    bio: `Yoram Ben Zvi is an entrepreneur with experience in product management and development, particularly in bridging traditional businesses with cutting-edge technologies like blockchain and AI. He is based in the Geneva Metropolitan Area.`,
  },

  {
    name: "Sam Delaney",
    role: "Core Tech Lead",
    image: "/team/sam.jpg",
    link: "https://x.com/sde_laney",
    description: "Founder of Grabbit",
    bio: `Sam is a design leader and blockchain engineer with years of experience at the forefront of
      UTxO protocol design and development. He has been integral to projects such as
      Hydra-Auction, Grabbit, & Ascent Rivals, and authored the CIP-102 standard and early ZK
      verifiers. Sam has degrees in Computer Science and Linguistics from Trinity Western
      University.`,
  },

  {
    name: "Phil Disarro",
    role: "Senior Developer",
    image: "/team/phil.png",
    link: "https://x.com/phil_uplc",
    description: "Founder of Anastasia Labs",
    bio: `Phil Disarro is the Founder and CEO of Anastasia Labs, a research and development firm focused on secure and scalable blockchain infrastructure. He has deep expertise in compiler design, programming language theory, and smart contract security, and has contributed extensively to the Cardano ecosystem.`,
  },

  {
    name: "Vic Genin",
    role: "Protocol Lead",
    image: "/team/vic.jpeg",
    link: "https://x.com/DataScientistAI",
    bio: `Vic Genin is a blockchain architect and data technology expert with experience building scalable, secure systems. He has held senior technical roles at Binance, Cere Network, and GameStop, leading projects in cross-chain interoperability and decentralized infrastructure. Vic combines deep technical expertise with a track record of delivering complex blockchain and gaming projects.`,
  },

  {
    name: "Appold Team",
    role: "Operations & Project Management",
    image: "/team/appold-logo.svg",
    link: "https://www.linkedin.com/company/appold/",
    bio: `Appold is a specialist technology and advisory company focused on the blockchain industry, which incorporates digital
      assets, blockchain technology, decentralised finance (DeFi), and asset tokenisation. Appold provides end-to-end
      advisory solutions on digital transformation, blockchain integration, audit, market screening, analysis, and risk
      management.`,
  },
];

export default function Team() {
  const [members, setMembers] = useState<TeamMemberType[] | null>(TeamMembers);

  // this was supposed to swap the selected member with the clicked member.
  // not sure why it doesn't but it's kinda accidentally better - keeps things more or less sorted with minimal movement
  const handleMemberSelect = (member: TeamMemberType) => {
    const memberIndex = members
      ? members.findIndex((m) => m.name === member.name)
      : -1;

    setMembers((prevMembers) => {
      if (!prevMembers || memberIndex === -1 || memberIndex === 0) {
        return prevMembers;
      }

      let newMembers = [...prevMembers];
      newMembers[memberIndex] = newMembers[0];
      newMembers[0] = member;

      return newMembers;
    });
  };

  let selectedMember: TeamMemberType | null = members ? members[0] : null;

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
      <Section className="py-24 items-center text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Core Team
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col px-12 items-center text-center space-y-4">
            {selectedMember ? (
              <div className="flex flex-col items-center text-center p-8 bg-primary-foreground/30 backdrop-blur-sm rounded-lg shadow-lg border border-primary/20">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-48 h-48 rounded-full mb-6 border-4 border-primary/20"
                />
                <h2 className="text-3xl font-bold text-primary mb-2">
                  {selectedMember.name}
                </h2>
                <p className="text-xl text-muted-foreground mb-4">
                  {selectedMember.role}
                </p>
                {selectedMember.description && (
                  <p className="text-gray-500 text-base mb-4">
                    {selectedMember.description}
                  </p>
                )}
                {selectedMember.bio && (
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {selectedMember.bio}
                  </p>
                )}
                {selectedMember.link && (
                  <a
                    href={selectedMember.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-primary hover:text-primary/80 transition-colors"
                  >
                    View Profile →
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-primary-foreground/10 backdrop-blur-sm rounded-lg border-2 border-dashed border-primary/20 min-h-[400px]">
                <p className="text-muted-foreground text-lg">
                  Click on a team member to learn more about them
                </p>
              </div>
            )}
          </div>
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:col-span-2 gap-6 p-4 md:p-6">
            {TeamMembers.filter(
              (member) => member.name !== selectedMember?.name
            ).map((member) => (
              <div
                key={member.name}
                onClick={() => handleMemberSelect(member)}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedMember?.name === member.name
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:scale-105"
                }`}
              >
                <TeamMember {...member} />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
