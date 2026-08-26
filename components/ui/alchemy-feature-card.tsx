import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

export type AlchemyFeatureCardProps = {
  title: string;
  body: ReactNode;
  /**
   * Space-separated Tailwind border + bg classes.
   * e.g. "border-orange-500/30 bg-orange-500/25"
   */
  colorClasses: string;
  /** Text-color class for the badge. e.g. "text-orange-400" */
  accentClass: string;
  /** Icon component (lucide-react). Renders in a square badge. */
  icon?: ComponentType<{ className?: string }>;
  /**
   * Step label rendered inside a circular badge instead of an icon.
   * e.g. "1", "01". Implies layout="horizontal" by default.
   */
  step?: string;
  /**
   * Small mono label shown inline before the title.
   * e.g. "01" on pillar cards.
   */
  label?: string;
  /**
   * "vertical"   - badge stacked above title (default when icon only)
   * "horizontal" - badge on left, title + body on right (default when step)
   */
  layout?: "horizontal" | "vertical";
  className?: string;
};

export function AlchemyFeatureCard({
  title,
  body,
  colorClasses,
  accentClass,
  icon: Icon,
  step,
  label,
  layout,
  className,
}: AlchemyFeatureCardProps) {
  const resolvedLayout = layout ?? (step ? "horizontal" : "vertical");

  if (resolvedLayout === "horizontal") {
    return (
      <div
        className={cn(
          "rounded-xl border backdrop-blur-lg p-5 md:p-6 flex items-start gap-4 bg-background/80",
          colorClasses,
          className,
        )}
      >
        {/* Badge */}
        {step ? (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-foreground/5 font-bold text-sm",
              accentClass,
            )}
          >
            {step}
          </div>
        ) : Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-foreground/15 bg-foreground/5",
              accentClass,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}

        {/* Content */}
        <div>
          <div
            className={cn("flex items-center gap-3", label ? "mb-2" : "mb-1.5")}
          >
            {label && (
              <span className="text-xs font-mono text-foreground/50">
                {label}
              </span>
            )}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <div className="text-sm text-foreground/80 leading-relaxed">
            {body}
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div
      className={cn(
        "rounded-xl border backdrop-blur-sm p-5",
        colorClasses,
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border border-foreground/15 bg-foreground/5 mb-3",
            accentClass,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      <div className="text-sm text-foreground/80 leading-relaxed">{body}</div>
    </div>
  );
}
