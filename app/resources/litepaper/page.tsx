"use client";

import { useRef } from "react";
import { Section } from "@/components/ui/section";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set the workerSrc to the correct path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Whitepaper() {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]); // Array of refs for each page

  const _scrollToPage = (pageNumber: number) => {
    const pageElement = pageRefs.current[pageNumber - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Section>
      {/* PDF Document */}
      <div className="flex flex-col items-center justify-center">
        <Document
          file="/Sundial Litepaper.pdf"
          loading="Loading document..."
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i + 1}
              ref={(el) => {
                pageRefs.current[i] = el; // Assign ref to each page container
              }}
              className="mb-8"
            >
              <Page pageNumber={i + 1} width={500} />
            </div>
          ))}
        </Document>
      </div>
    </Section>
  );
}
