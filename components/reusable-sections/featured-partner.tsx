"use client";

import Image from "next/image";

interface FeaturedPartnerProps {
  classes?: string;
}

export default function FeaturedPartner({ classes }: FeaturedPartnerProps) {
  return (
    <div className={classes}>
      <div className="text-center p-4 flex flex-col items-center space-y-2">
        <div className="flex space-x-4">
          <p className="text-muted-foreground text-sm">Powered by</p>
          <a
            href="https://www.checkpoint.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity group"
          >
            <Image
              src="/partners/checkpoint-logo.svg"
              alt="Check Point"
              width={120}
              height={40}
              className="object-contain filter invert dark:invert-0 brightness-75"
            />
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Global leader in cybersecurity solutions
        </p>
      </div>
    </div>
  );
}
