/**
 * InteractiveGradientBackground
 *
 * Animated blob-gradient background with a mouse-tracking highlight.
 * Ported from the "Interactive Gradient & Glassmorphism with noise" CodePen
 * by Podgro — adapted as a drop-in React wrapper (same API as AlchemyBackground).
 *
 * Usage:
 *   <InteractiveGradientBackground>
 *     <YourContent />
 *   </InteractiveGradientBackground>
 *
 *   <InteractiveGradientBackground colors={{ color1: "255, 80, 30" }} opacity={0.6}>
 *     <YourContent />
 *   </InteractiveGradientBackground>
 */

"use client";

import React, { useEffect, useId, useMemo, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GradientBgColors = {
  /**
   * Base background color (any CSS color string).
   * Defaults to `hsl(var(--background))` so it tracks the current theme.
   */
  bg?: string;
  /** Blob 1 – "R, G, B" triplet string, e.g. "18, 113, 255" */
  color1?: string;
  /** Blob 2 */
  color2?: string;
  /** Blob 3 */
  color3?: string;
  /** Blob 4 */
  color4?: string;
  /** Blob 5 */
  color5?: string;
  /** Mouse-following highlight blob */
  interactive?: string;
};

// ---------------------------------------------------------------------------
// Defaults  (dark blue/purple palette matching the original CodePen)
// ---------------------------------------------------------------------------

const DEFAULT_COLORS: Required<GradientBgColors> = {
  bg: "hsl(var(--background))",
  color1: "220, 40, 0", // deep red
  color2: "255, 100, 0", // orange
  color3: "20, 80, 210", // deep blue
  color4: "0, 190, 220", // cyan
  color5: "255, 170, 0", // gold
  interactive: "255, 130, 20", // warm orange
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InteractiveGradientBackground({
  children,
  colors = {},
  opacity = 0.5,
  noInteractive = false,
}: {
  children: React.ReactNode;
  /** Override individual blob / background colors. */
  colors?: GradientBgColors;
  /** Global alpha for the whole background layer (0–1). */
  opacity?: number;
  /** Disable the mouse-tracking highlight blob. */
  noInteractive?: boolean;
}) {
  const rawId = useId();
  const uid = useMemo(() => `igb-${rawId.replace(/:/g, "")}`, [rawId]);
  const gooId = `${uid}-goo`;

  const interactiveRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const curX = useRef(0);
  const curY = useRef(0);
  const tgX = useRef(0);
  const tgY = useRef(0);

  const c = { ...DEFAULT_COLORS, ...colors };

  // Mouse-tracking animation loop
  useEffect(() => {
    if (noInteractive) return;

    const move = () => {
      curX.current += (tgX.current - curX.current) / 80;
      curY.current += (tgY.current - curY.current) / 80;
      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${Math.round(curX.current)}px, ${Math.round(curY.current)}px)`;
      }
      animFrameRef.current = requestAnimationFrame(move);
    };

    const handleMouseMove = (e: MouseEvent) => {
      tgX.current = e.clientX;
      tgY.current = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    animFrameRef.current = requestAnimationFrame(move);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [noInteractive]);

  // Shared blob style builder
  const blob = (
    color: string,
    extra: React.CSSProperties = {},
  ): React.CSSProperties => ({
    position: "absolute",
    background: `radial-gradient(circle at center, rgba(${color}, 0.8) 0, rgba(${color}, 0) 50%) no-repeat`,
    mixBlendMode: "hard-light",
    width: "80%",
    height: "80%",
    top: "calc(50% - 40%)",
    left: "calc(50% - 40%)",
    opacity: 1,
    ...extra,
  });

  return (
    <div style={{ position: "relative" }}>
      {/* ------------------------------------------------------------------ */}
      {/* Background layer — sits behind all children                        */}
      {/* ------------------------------------------------------------------ */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          background: c.bg,
          opacity,
        }}
      >
        {/* CSS keyframes injected once per mount */}
        <style>{`
          @keyframes ${uid}-circle {
            0%   { transform: rotate(0deg); }
            50%  { transform: rotate(180deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes ${uid}-vertical {
            0%   { transform: translateY(-50%); }
            50%  { transform: translateY(50%); }
            100% { transform: translateY(-50%); }
          }
          @keyframes ${uid}-horizontal {
            0%   { transform: translateX(-50%) translateY(-10%); }
            50%  { transform: translateX(50%)  translateY(10%); }
            100% { transform: translateX(-50%) translateY(-10%); }
          }
        `}</style>

        {/* Hidden SVG carrying the "goo" compositing filter */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "none" }}
          aria-hidden="true"
        >
          <defs>
            <filter id={gooId}>
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="10"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        {/* Animated gradient blobs */}
        <div
          style={{
            filter: `url(#${gooId}) blur(40px)`,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Blob 1 — vertical oscillation */}
          <div
            style={blob(c.color1, {
              transformOrigin: "center center",
              animation: `${uid}-vertical 30s ease infinite`,
            })}
          />

          {/* Blob 2 — circular orbit (reverse) */}
          <div
            style={blob(c.color2, {
              transformOrigin: "calc(50% - 400px)",
              animation: `${uid}-circle 20s reverse infinite`,
            })}
          />

          {/* Blob 3 — circular orbit (forward), offset position */}
          <div
            style={blob(c.color3, {
              top: "calc(50% - 40% + 200px)",
              left: "calc(50% - 40% - 500px)",
              transformOrigin: "calc(50% + 400px)",
              animation: `${uid}-circle 40s linear infinite`,
            })}
          />

          {/* Blob 4 — horizontal sway */}
          <div
            style={blob(c.color4, {
              transformOrigin: "calc(50% - 200px)",
              animation: `${uid}-horizontal 40s ease infinite`,
              opacity: 0.7,
            })}
          />

          {/* Blob 5 — large, slow circular orbit */}
          <div
            style={blob(c.color5, {
              width: "160%",
              height: "160%",
              top: "calc(50% - 80%)",
              left: "calc(50% - 80%)",
              transformOrigin: "calc(50% - 800px) calc(50% + 200px)",
              animation: `${uid}-circle 20s ease infinite`,
            })}
          />

          {/* Interactive mouse-following highlight */}
          {!noInteractive && (
            <div
              ref={interactiveRef}
              style={{
                position: "absolute",
                background: `radial-gradient(circle at center, rgba(${c.interactive}, 0.8) 0, rgba(${c.interactive}, 0) 50%) no-repeat`,
                mixBlendMode: "hard-light",
                width: "100%",
                height: "100%",
                top: "-50%",
                left: "-50%",
                opacity: 0.7,
              }}
            />
          )}
        </div>
      </div>

      {/* Children render in normal flow above the background */}
      {children}
    </div>
  );
}
