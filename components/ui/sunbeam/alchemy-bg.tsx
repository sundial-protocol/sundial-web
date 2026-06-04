/**
 * AlchemyBackground
 *
 * Drop-in counterpart to SunbeamBackground.  Same `BeamProps` / `beams` API,
 * but instead of a plain gradient each beam is filled with the triangular
 * facet / stained-glass pattern from the Alchemy logo.
 *
 * The gradient flows left→right across each beam (warm orange on the left,
 * cool blue on the right).  The beam fades to transparent toward its far end
 * via an SVG mask – just like sunbeams fade at the tip.
 *
 * Usage (identical to SunbeamBackground):
 *   <AlchemyBackground beams={[{ styles: { ... } }]}>
 *     <YourContent />
 *   </AlchemyBackground>
 */

"use client";

import React, { useMemo } from "react";

// ---------------------------------------------------------------------------
// Public types – mirror sunbeam-bg so this is a drop-in swap
// ---------------------------------------------------------------------------

export type BeamProps = {
  styles: React.CSSProperties;
};

export type AlchemyStop = {
  /** 0–1 position along the gradient spine */
  offset: number;
  /** Any valid CSS color string */
  color: string;
};

// ---------------------------------------------------------------------------
// Default palette  (matches the logo: red-orange left → blue right)
// ---------------------------------------------------------------------------

export const DEFAULT_ALCHEMY_STOPS: AlchemyStop[] = [
  { offset: 0.0, color: "#e63200" },
  { offset: 0.18, color: "#ff6a00" },
  { offset: 0.35, color: "#ffb300" },
  { offset: 0.52, color: "#ffe066" },
  { offset: 0.68, color: "#66e0d8" },
  { offset: 0.83, color: "#2196f3" },
  { offset: 1.0, color: "#1a3fb5" },
];

// ---------------------------------------------------------------------------
// Triangle-grid path builder
//
// Generates an SVG <path d="..."> for an equilateral triangle tessellation
// that covers the rectangle [0,0]→[w,h] (with a margin so all edges fill).
//
// From each grid vertex (x, y) we emit three stroke-only segments:
//   • horizontal right    → (x + s,   y)
//   • diagonal down-right → (x + s/2, y + rh)
//   • diagonal down-left  → (x − s/2, y + rh)
//
// Duplicates are harmless for stroke-only rendering.
// ---------------------------------------------------------------------------

function buildFacetPath(s: number, w: number, h: number): string {
  const rh = (s * Math.sqrt(3)) / 2; // row height
  const mg = s; // margin outside view bounds
  const parts: string[] = [];

  const rows = Math.ceil((h + 2 * mg) / rh) + 2;
  const cols = Math.ceil((w + 2 * mg) / s) + 2;

  for (let r = 0; r <= rows; r++) {
    const y = -mg + r * rh;
    const xOffset = (r % 2) * (s / 2);

    for (let c = -1; c <= cols; c++) {
      const x = -mg + c * s + xOffset;

      // Horizontal right
      parts.push(`M${x.toFixed(2)},${y.toFixed(2)}h${s}`);

      if (r < rows) {
        const dy = rh.toFixed(2);
        const dx = (s / 2).toFixed(2);
        // Down-right
        parts.push(`M${x.toFixed(2)},${y.toFixed(2)}l${dx},${dy}`);
        // Down-left
        parts.push(`M${x.toFixed(2)},${y.toFixed(2)}l-${dx},${dy}`);
      }
    }
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// SVG coordinate space for each beam
// ---------------------------------------------------------------------------

const VIEW_W = 100;
const VIEW_H = 800;
const TRIANGLE_SIDE = 16; // ~6 facets across a beam's width

let _uid = 0;

// ---------------------------------------------------------------------------
// Single beam element
// ---------------------------------------------------------------------------

function FacetBeam({
  beam,
  stops,
  opacity,
}: {
  beam: BeamProps;
  stops: AlchemyStop[];
  opacity: number;
}) {
  const uid = useMemo(() => `ab-${_uid++}`, []);
  const facetPath = useMemo(
    () => buildFacetPath(TRIANGLE_SIDE, VIEW_W, VIEW_H),
    [],
  );

  // Strip `background` so the caller's sunbeamGradient() value doesn't fight the SVG
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { background: _bg, ...restStyles } = beam.styles;

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "100%",
    zIndex: -1,
    opacity,
    overflow: "hidden",
    pointerEvents: "none",
    ...restStyles,
  };

  const colorGradId = `${uid}-color`;
  const maskGradId = `${uid}-mask`;
  const maskId = `${uid}-fade`;

  return (
    <div style={wrapperStyle}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Horizontal colour gradient (alchemy palette) */}
          <linearGradient
            id={colorGradId}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
            gradientUnits="objectBoundingBox"
          >
            {stops.map((s, i) => (
              <stop
                key={i}
                offset={`${(s.offset * 100).toFixed(1)}%`}
                stopColor={s.color}
              />
            ))}
          </linearGradient>

          {/* Vertical fade: opaque at start → transparent at tip */}
          <linearGradient
            id={maskGradId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="50%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <mask id={maskId}>
            <rect width={VIEW_W} height={VIEW_H} fill={`url(#${maskGradId})`} />
          </mask>
        </defs>

        {/* Gradient fill behind the facets, faded at the tip */}
        <rect
          width={VIEW_W}
          height={VIEW_H}
          fill={`url(#${colorGradId})`}
          mask={`url(#${maskId})`}
        />

        {/* Triangular facet lines */}
        <path
          d={facetPath}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth={0.45}
          fill="none"
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AlchemyBackground – main export
// ---------------------------------------------------------------------------

export default function AlchemyBackground({
  children,
  beams,
  stops = DEFAULT_ALCHEMY_STOPS,
  opacity = 0.3,
}: {
  children: React.ReactNode;
  beams?: BeamProps[] | null;
  stops?: AlchemyStop[];
  opacity?: number;
}) {
  return (
    <div>
      <div
        className="relative top-0 left-0 w-full overflow-visible"
        style={{ zIndex: -50 }}
      >
        {beams?.map((beam, i) => (
          <FacetBeam key={i} beam={beam} stops={stops} opacity={opacity} />
        ))}
      </div>
      {children}
    </div>
  );
}
