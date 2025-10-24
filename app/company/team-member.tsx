import { ExternalLink, Link } from "lucide-react";
import Image from "next/image";

export type TeamMemberType = {
  name: string;
  role: string;
  image: string;
  link: string;
  description?: string;
  bio?: string;
};

export function TeamMember({
  name,
  role,
  image,
  link,
  description,
  bio,
}: TeamMemberType) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-primary-foreground/20 backdrop-blur-sm rounded-xs shadow-sm hover:shadow-primary/60 transition-shadow btn-effect-shine">
      <Image
        src={image}
        alt={name}
        height={100}
        width={100}
        className="w-36 h-36 rounded-full mb-4"
      />
      <h2 className="text-2xl font-bold text-primary">
        {
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex"
          >
            {name} <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        }
      </h2>
      <p>{role}</p>
      <p className="text-gray-500 text-sm">{description ?? ""}</p>
    </div>
  );
}

export default TeamMember;
