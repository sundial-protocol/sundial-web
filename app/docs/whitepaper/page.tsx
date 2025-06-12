"use client";

import { Section } from "@/components/ui/section";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import NavDrawer from "./nav-drawer";

// Set the workerSrc to the correct path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Whitepaper() {
  return (
    <Section>
      <NavDrawer />
      <div className="flex items-center justify-center -top-10">
        <Document
          file="/sundial.pdf"
          loading="Loading document..."
          className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-center justify-center z-0"
        >
          {Array.from({ length: 99 }, (_, i) => (
            <Page
              key={i + 1}
              pageNumber={i + 1}
              width={Math.min(500, document.body.clientWidth)}
              className="z-0"
            />
          ))}
        </Document>
      </div>
    </Section>
  );
}
