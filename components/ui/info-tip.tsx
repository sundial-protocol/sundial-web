"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// A small "i" next to a figure or term that explains it in a sentence or two.
//
// Built on a popover rather than a tooltip so it also opens on tap: testers
// reach the dashboard on phones, and a hover-only tooltip never opens there.
// On a pointer device it still opens on hover, like a tooltip.
export function InfoTip({
  children,
  label = "More information",
  className,
}: {
  children: React.ReactNode;
  // Read by screen readers in place of the icon.
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  // Opened by the mouse passing over it, rather than by a click or tap. Such
  // an open closes when the mouse leaves; a click instead pins it open, so the
  // click that follows the hover doesn't toggle it straight back shut.
  const hoverOpened = React.useRef(false);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        hoverOpened.current = false;
        setOpen(next);
      }}
    >
      <PopoverPrimitive.Trigger
        type="button"
        aria-label={label}
        // Mouse only: a tap fires pointer events too, and must act as a click.
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse" || open) return;
          hoverOpened.current = true;
          setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse" || !hoverOpened.current) return;
          hoverOpened.current = false;
          setOpen(false);
        }}
        onClick={(e) => {
          if (!hoverOpened.current) return; // Radix toggles as usual
          e.preventDefault(); // Radix skips its toggle; keep it open, pinned
          hoverOpened.current = false;
        }}
        className={cn(
          "inline-flex items-center align-middle text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full",
          className,
        )}
      >
        <Info className="h-3.5 w-3.5" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          sideOffset={6}
          collisionPadding={16}
          // Hover-opened: don't steal focus from whatever the user was doing.
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-[100] max-w-xs rounded-md border bg-background px-3 py-2 text-xs font-normal leading-relaxed text-foreground shadow-md"
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
