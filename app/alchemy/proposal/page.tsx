"use client";

import dynamic from "next/dynamic";

const AlchemyProposalViewer = dynamic(() => import("./proposal-viewer"), {
  ssr: false,
});

export default function AlchemyProposal() {
  return <AlchemyProposalViewer />;
}
