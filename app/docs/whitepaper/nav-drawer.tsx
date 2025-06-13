"use client";

import { ArrowLeft, SidebarCloseIcon, TableOfContents } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Drawer } from "vaul";

export default function NavDrawer({
  scrollCallback,
}: {
  scrollCallback: (pageNumber: number) => void;
}) {
  const [open, setOpen] = useState(false);

  const ToCLink = ({
    pageNumber,
    text,
  }: {
    pageNumber: number;
    text: string;
  }) => {
    return (
      <li>
        <a
          onClick={() => scrollCallback(pageNumber)}
          className="underline cursor-pointer"
        >
          {text}
        </a>
      </li>
    );
  };

  return (
    <Drawer.Root open={open} direction="left">
      <Drawer.Trigger
        onClick={() => setOpen(!open)}
        className={`mt-48 z-10 ml-4 top-4 fixed rounded-full ${
          open ? "bg-primary/70" : "bg-primary"
        } p-4 text-sm font-medium text-black shadow-sm transition-all hover:bg-primary/70`}
      >
        <TableOfContents className="h-5 w-5" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Content
          className="left-2 top-2 bottom-2 py-48 fixed z-20 outline-none w-[310px] flex"
          // The gap between the edge of the screen and the drawer is 8px in this case.
          style={
            { "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties
          }
        >
          <div className="bg-background border-primary/50 border min-h-[400px] h-full w-full grow p-5 flex flex-col rounded-[16px]">
            <div className="max-w-md m-auto w-full">
              <Drawer.Title className="font-bold mb-2 text-foreground text-center">
                Table of Contents
              </Drawer.Title>
              <div className="text-foreground mb-2">
                <ol className="space-y-2 py-6">
                  <ToCLink pageNumber={6} text="Introduction" />
                  <ToCLink pageNumber={8} text="1. Ledger State" />
                  <ToCLink pageNumber={18} text="2. User Event Protocol" />
                  <ToCLink pageNumber={25} text="3. Consensus Protocol" />
                  <ToCLink pageNumber={50} text="4. Proof Protocol" />
                  <ToCLink
                    pageNumber={56}
                    text="5. Ledger Rules & Fraud Proofs"
                  />
                  <ToCLink
                    pageNumber={71}
                    text="6. Offchain Data Architecture"
                  />
                  <ToCLink pageNumber={75} text="7. Phase 2 Validation" />
                  <ToCLink
                    pageNumber={82}
                    text="A. General Onchain Data Structures"
                  />
                </ol>
                <Link
                  href="/docs"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Documentation
                </Link>
              </div>
            </div>
          </div>
          <Drawer.Close
            onClick={() => setOpen(false)}
            className="mt-48 top-4 right-2 fixed rounded-full z-10 bg-background/70 border-2 border-primary p-2 text-sm font-medium text-primary shadow-sm transition-all hover:bg-background"
          >
            <SidebarCloseIcon className="h-5 w-5" />
          </Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
