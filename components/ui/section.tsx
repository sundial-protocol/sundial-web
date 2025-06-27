import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className=" pt-24 snap-always snap-center">
      <div className={cn("container px-0 md:px-6", className)}>{children}</div>
    </section>
  );
}
