import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="pb-12 pt-40 snap-always snap-start">
      <div className={cn("container px-0 md:px-6", className)}>{children}</div>
    </section>
  );
}
