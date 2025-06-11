"use client";

import { Section } from "@/components/ui/section";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set the workerSrc to the correct path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Whitepaper() {
  return (
    <Section>
      <div className="flex items-center justify-center">
        <Document
          file="/midgard.pdf"
          loading="Loading document..."
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center"
        >
          {Array.from({ length: 92 }, (_, i) => (
            <Page key={i + 1} pageNumber={i + 1} width={500} />
          ))}
        </Document>
      </div>
    </Section>
  );
}
