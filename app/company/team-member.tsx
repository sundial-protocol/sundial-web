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
    <div className="flex flex-col items-center text-center p-6 bg-primary-foreground/20 backdrop-blur-sm rounded-xs shadow-sm hover:shadow-primary/60 transition-shadow btn-effect-shine h-80 justify-between">
      <div className="flex flex-col items-center">
        <Image
          src={image}
          alt={name}
          height={100}
          width={100}
          className="w-36 h-36 rounded-full mb-4 object-cover"
        />
        <h2 className="text-2xl font-bold text-primary mb-2">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {name} <ExternalLink className="ml-1 h-4 w-4 flex-shrink-0" />
          </a>
        </h2>
      </div>

      <div className="flex flex-col items-center space-y-2 flex-grow justify-center">
        <p>{role}</p>
        {description && (
          <p className="text-gray-500 text-sm text-center line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default TeamMember;
