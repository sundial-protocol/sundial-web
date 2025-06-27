import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="pt-24 snap-always snap-center">
      <div className={cn("px-0", className)}>{children}</div>
    </section>
  );
}
