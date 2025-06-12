"use client";

import { SidebarCloseIcon, TableOfContents } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";

export default function NavDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} direction="left">
      <Drawer.Trigger
        onClick={() => setOpen(!open)}
        className={`mt-36 z-10 ml-4 top-4 fixed rounded-full ${
          open ? "bg-primary/70" : "bg-primary"
        } p-4 text-sm font-medium text-black shadow-sm transition-all hover:bg-primary/70`}
      >
        <TableOfContents className="h-5 w-5" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Content
          className="left-2 top-2 bottom-2 py-36 fixed z-20 outline-none w-[310px] flex"
          // The gap between the edge of the screen and the drawer is 8px in this case.
          style={
            { "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties
          }
        >
          <div className="bg-background border-primary/50 border min-h-[200px] h-full w-full grow p-5 flex flex-col rounded-[16px]">
            <div className="max-w-md mx-auto">
              <Drawer.Title className="font-medium mb-2 text-foreground">
                It supports all directions.
              </Drawer.Title>
              <Drawer.Description className="text-foreground mb-2">
                This one specifically is not touching the edge of the screen,
                but that&apos;s not required for a side drawer.
              </Drawer.Description>
            </div>
          </div>
          <Drawer.Close
            onClick={() => setOpen(false)}
            className="mt-36 top-4 right-2 fixed rounded-full z-10 bg-background/70 border-2 border-primary p-2 text-sm font-medium text-primary shadow-sm transition-all hover:bg-background"
          >
            <SidebarCloseIcon className="h-5 w-5" />
          </Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
