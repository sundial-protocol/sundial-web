"use client";

import { useRef } from "react";
import { Section } from "@/components/ui/section";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function LitepaperViewer() {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const _scrollToPage = (pageNumber: number) => {
    const pageElement = pageRefs.current[pageNumber - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Section>
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
                pageRefs.current[i] = el;
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
