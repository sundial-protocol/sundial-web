"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

function PartnerCard({
  name,
  image,
  link,
}: {
  name: string;
  image: string;
  link: string;
}) {
  return (
    <Link href={link}>
      <Card className="h-16 flex flex-col justify-center shadow-sm hover:shadow-primary/60 transition-shadow">
        <CardHeader className="p-4 w-full h-full flex items-center justify-center btn-effect-shine bg-primary-foreground/20">
          <Image
            src={image}
            alt={name}
            width={160}
            height={100}
            className="object-contain filter grayscale brightness-50"
            priority
            loading="eager"
          />
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function Partners() {
  const partners = [
    {
      name: "Check Point",
      image: "/partners/checkpoint-logo.svg",
      link: "https://www.checkpoint.com/",
    },
    {
      name: "BitLayer",
      image: "/partners/FA_Bitlayer-Logo-horizontal.png",
      link: "https://www.bitlayer.org/",
    },
    {
      name: "Input Output",
      image: "/partners/iohk-logo.png",
      link: "https://iohk.io/",
    },
    {
      name: "BitcoinOS",
      image: "/partners/bitcoinOSlogo.png",
      link: "https://www.bitcoinos.build/",
    },
    // {
    //   name: "Cardano",
    //   image: "/partners/cardano-horizontal-black.svg",
    //   link: "https://cardano.org/",
    // },
    // {
    //   name: "Midgard",
    //   image: "/partners/midgard-icon-white-and-colour.png",
    //   link: "https://midgardprotocol.com/",
    // },
    {
      name: "Anastasia Labs",
      image: "/partners/al-icon-horizontal-white.png",
      link: "https://anastasialabs.com",
    },
  ];

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4 w-full text-center text-accent-foreground/70">
          Trusted by Leading Infrastructure Partners
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-center justify-center w-full h-full p-8 gap-4">
        {partners.map((partner) => (
          <PartnerCard
            name={partner.name}
            image={partner.image}
            link={partner.link}
            key={partner.name}
          />
        ))}
      </div>
    </>
  );
}
