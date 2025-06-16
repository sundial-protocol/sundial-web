import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="py-12 md:py-24">
      <div className={cn("container px-0 md:px-6", className)}>{children}</div>
    </section>
  );
}
