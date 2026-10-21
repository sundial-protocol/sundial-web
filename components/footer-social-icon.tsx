interface SocialIconProps {
  href: string;
  alt: string;
  src: string;
}

export function SocialIcon({ href, alt, src }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors invert-[30%] hover:invert-0 dark:hover:invert"
    >
      <img src={src} alt={alt} className="w-5 h-5" />
    </a>
  );
}
