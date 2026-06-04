"use client";

import { useRef, useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import NavDrawer from "./nav-drawer";
import InteractiveGradientBackground from "@/components/ui/interactive-gradient-bg";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function AlchemyProposal() {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(500);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setPageWidth(Math.min(containerRef.current.clientWidth, 500));
      }
    };
    update();
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToPage = (pageNumber: number) => {
    const pageElement = pageRefs.current[pageNumber - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <InteractiveGradientBackground>
      <Section>
        <NavDrawer scrollCallback={scrollToPage} />
        <div
          ref={containerRef}
          className="flex flex-col items-center justify-center w-full"
        >
          <Document
            file="/alchemy-proposal-v3.pdf"
            loading="Loading document..."
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center"
          >
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i + 1}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                className="mb-8"
              >
                <Page pageNumber={i + 1} width={pageWidth} />
              </div>
            ))}
          </Document>
        </div>
      </Section>
    </InteractiveGradientBackground>
  );
}
