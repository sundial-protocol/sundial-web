"use client";

import Image from "next/image";
import Link from "next/link";

type AlchemyLogoStripProps = {
  className?: string;
};

export default function AlchemyLogoStrip({
  className = "",
}: AlchemyLogoStripProps) {
  const logos = [
    {
      name: "Sundial",
      src: "/sundial-text-logo.png",
      href: "/solutions",
      width: 136,
      height: 32,
      imageClassName: "max-h-8 hover:brightness-125 hover:saturate-150",
    },
    {
      name: "Charms",
      src: "/alchemy/Charms Glow Logo.png",
      href: "https://charms.dev",
      width: 176,
      height: 42,
      imageClassName: "max-h-10 sm:max-h-11 brightness-75 hover:brightness-125",
      external: true,
    },
  ];

  return (
    <div
      className={`rounded-xl border border-foreground/15 bg-background/85 backdrop-blur-sm px-5 py-4 ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 mb-3 text-center">
        Built By
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
        {logos.map((logo, idx) => (
          <div key={logo.name} className="flex items-center">
            <Link
              href={logo.href}
              target={logo.external ? "_blank" : undefined}
              rel={logo.external ? "noopener noreferrer" : undefined}
              className="inline-flex h-14 items-center rounded-lg px-1 sm:px-2 transition-all hover:scale-110"
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={logo.width}
                height={logo.height}
                className={`h-auto w-auto object-contain ${logo.imageClassName}`}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
