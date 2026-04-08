"use client";

import { useTheme } from "next-themes";

interface SocialIconProps {
  href: string;
  alt: string;
  src: string;
}

export function SocialIcon({ href, alt, src }: SocialIconProps) {
  const isDark = useTheme().theme === "dark";
  const hoverFilter = isDark ? "hover:invert" : "hover:invert-0";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`transition-colors invert-[30%] ${hoverFilter}`}
    >
      <img src={src} alt={alt} className="w-5 h-5" />
    </a>
  );
}
