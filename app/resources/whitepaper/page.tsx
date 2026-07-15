"use client";

import dynamic from "next/dynamic";

const WhitepaperViewer = dynamic(() => import("./whitepaper-viewer"), {
  ssr: false,
});

export default function Whitepaper() {
  return <WhitepaperViewer />;
}
