import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import "katex/dist/katex.min.css";
import Mermaid from "./mermaid";

const WHITEPAPER_FILE = path.join(
  process.cwd(),
  "content/whitepaper/sundial-whitepaper-v1.md",
);

export const metadata: Metadata = {
  title: "Whitepaper | Sundial Protocol",
  description:
    "Sundial Protocol: Architecture, Ledger Rules, and Implementation. The specification of Sundial's optimistic rollup for UTXO-based networks.",
};

type TocEntry = { depth: number; text: string; id: string };

// Mirrors rehype-slug: every heading is slugged in document order (so duplicate
// counters line up), but only parts and chapters go in the sidebar.
function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const depth = match[1].length;
    const text = match[2];
    const id = slugger.slug(text);
    if (depth <= 2) toc.push({ depth, text, id });
  }
  // Drop the document title; the page renders it at the top.
  return toc.slice(1);
}

export default async function Whitepaper() {
  const markdown = await fs.readFile(WHITEPAPER_FILE, "utf8");
  const toc = extractToc(markdown);

  return (
    <div className="container py-12">
      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <nav className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 text-sm">
            <Link
              href="/resources"
              className="mb-4 inline-flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Resources
            </Link>
            <p className="mb-2 font-bold">Contents</p>
            <ol className="space-y-1">
              {toc.map((entry) => (
                <li
                  key={entry.id}
                  className={
                    entry.depth === 1 ? "pt-3 font-semibold" : "pl-3"
                  }
                >
                  <a
                    href={`#${entry.id}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {entry.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="prose max-w-4xl prose-headings:scroll-mt-32 [&_[id]]:scroll-mt-32 prose-table:text-sm prose-th:align-top prose-td:align-top [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
            components={{
              pre: ({ children, node, ...props }) => {
                const code = node?.children[0];
                const className =
                  code?.type === "element" ? code.properties.className : null;
                if (
                  Array.isArray(className) &&
                  className.includes("language-mermaid")
                ) {
                  return <>{children}</>;
                }
                return <pre {...props}>{children}</pre>;
              },
              code: ({ className, children, node: _node, ...props }) => {
                if (className?.includes("language-mermaid")) {
                  return <Mermaid chart={String(children).trim()} />;
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              table: ({ node: _node, ...props }) => (
                <div className="overflow-x-auto">
                  <table {...props} />
                </div>
              ),
              a: ({ node: _node, href, ...props }) => {
                const external = href?.startsWith("http");
                return (
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    {...props}
                  />
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>

          <hr />
          <p className="flex items-center text-sm text-muted-foreground">
            <FileText className="mr-2 h-4 w-4" />
            Looking for the earlier Midgard-based specification?&nbsp;
            <a href="/sundial.pdf" target="_blank" rel="noopener noreferrer">
              Download the previous whitepaper (PDF)
            </a>
          </p>
        </article>
      </div>
    </div>
  );
}
