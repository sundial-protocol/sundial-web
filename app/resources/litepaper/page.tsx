"use client";

import dynamic from "next/dynamic";

const LitepaperViewer = dynamic(() => import("./litepaper-viewer"), {
  ssr: false,
});

export default function Litepaper() {
  return <LitepaperViewer />;
}
