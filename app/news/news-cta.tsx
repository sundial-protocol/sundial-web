import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

export default function NewsCTA({ classes }: { classes?: string }) {
  return (
    <div className={classes}>
      <div className="flex items-center justify-center sm:justify-end w-full h-full px-2 md:px-4 lg:px-16">
        <Link
          href="/news"
          className="inline-flex items-center justify-center rounded-full h-12 px-6 text-sm font-bold transition-colors bg-primary hover:bg-primary/70 text-black"
        >
          <Newspaper className="w-4 h-4 mr-2" />
          All News & Updates
          <ArrowRight className="ml-2 w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
