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
  // Whether focus moves into the tip on open and back to the icon on close.
  // Not for a hover open: the mouse passing over must not pull focus away from
  // whatever the user is typing in. Keyboard and click opens keep Radix's
  // default, so screen-reader users are taken to the text.
  const moveFocus = React.useRef(true);
  const contentRef = React.useRef<HTMLDivElement>(null);
  // A hover-opened tip stays open while the pointer is over the icon or the
  // text, with a short grace period to cross the gap between them.
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !hoverOpened.current) return;
    cancelClose();
    closeTimer.current = setTimeout(() => {
      hoverOpened.current = false;
      setOpen(false);
    }, 150);
  };
  React.useEffect(() => cancelClose, []);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        hoverOpened.current = false;
        if (next) moveFocus.current = true;
        setOpen(next);
      }}
    >
      <PopoverPrimitive.Trigger
        type="button"
        aria-label={label}
        // Mouse only: a tap fires pointer events too, and must act as a click.
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          cancelClose();
          if (open) return;
          hoverOpened.current = true;
          moveFocus.current = false;
          setOpen(true);
        }}
        onPointerLeave={scheduleClose}
        onClick={(e) => {
          if (!hoverOpened.current) return; // Radix toggles as usual
          e.preventDefault(); // Radix skips its toggle; keep it open, pinned
          hoverOpened.current = false;
          moveFocus.current = true; // the click put focus on the icon anyway
          // Enter or Space while the mouse rests on the icon: the hover open
          // skipped autofocus, so move focus in now for the keyboard user.
          if (e.detail === 0) contentRef.current?.focus();
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
          ref={contentRef}
          side="top"
          sideOffset={6}
          collisionPadding={16}
          onOpenAutoFocus={(e) => {
            if (!moveFocus.current) e.preventDefault();
          }}
          onCloseAutoFocus={(e) => {
            if (!moveFocus.current) e.preventDefault();
          }}
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          className="z-[100] max-w-xs rounded-md border bg-background px-3 py-2 text-xs font-normal leading-relaxed text-foreground shadow-md"
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
