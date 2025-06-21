import { cn } from "@/lib/utils";

export function HeroSection({
  children,
  classes,
}: {
  children: React.ReactNode;
  classes?: string;
}) {
  return (
    <section
      className={cn("py-48 bg-secondary snap-start snap-always", classes)}
    >
      <div className="container px-4 md:px-6">{children}</div>
    </section>
  );
}
