"use client";

import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="h-24 flex flex-col justify-center">
      <CardContent className="p-4 w-full h-full flex items-center justify-center">
        <Link href={link}>
          <Image
            src={image}
            alt={name}
            width={200}
            height={100}
            className="object-contain filter grayscale brightness-50"
            priority
            loading="eager"
          />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Partners() {
  const partners = [
    {
      name: "BitLayer",
      image: "/partners/FA_Bitlayer-Logo-horizontal.png",
      link: "https://www.bitlayer.org/",
    },
    {
      name: "BitcoinOS",
      image: "/partners/bitcoinOSlogo.png",
      link: "https://www.bitcoinos.build/",
    },
    {
      name: "Cardano",
      image: "/partners/cardano-horizontal-white.svg",
      link: "https://cardano.org/",
    },
    {
      name: "Midgard",
      image: "/partners/midgard-icon-white-and-colour.png",
      link: "https://midgardprotocol.com/",
    },
    {
      name: "Anastasia Labs",
      image: "/partners/al-icon-horizontal-white.png",
      link: "https://anastasialabs.com",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-center justify-center w-full h-full p-4 gap-4">
      {partners.map((partner) => (
        <PartnerCard
          name={partner.name}
          image={partner.image}
          link={partner.link}
          key={partner.name}
        />
      ))}
    </div>
  );
}
