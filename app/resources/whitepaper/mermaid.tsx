"use client";

import { useEffect, useId, useState } from "react";

export default function Mermaid({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/:/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [minWidth, setMinWidth] = useState<number>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
        const { svg } = await mermaid.render(id, chart);
        if (cancelled) return;
        // Wide diagrams would otherwise shrink until their labels are unreadable;
        // hold them at no less than 65% of natural size and scroll instead.
        const viewBoxWidth = Number(
          /viewBox="[-\d.]+ [-\d.]+ ([\d.]+)/.exec(svg)?.[1],
        );
        if (viewBoxWidth) setMinWidth(Math.round(viewBoxWidth * 0.65));
        setSvg(svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, chart]);

  if (failed) {
    return (
      <pre>
        <code>{chart}</code>
      </pre>
    );
  }

  // The diagrams set their own light theme, so they sit on a white card in both modes.
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border bg-white p-4">
      {svg ? (
        <div
          className="flex justify-center [&_svg]:h-auto"
          style={{ minWidth }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <p className="text-center text-sm text-gray-500">Loading diagram…</p>
      )}
    </div>
  );
}
