"use client";

import { useEffect, useRef } from "react";
import ScrambleText, { ScrambleTextRef } from "./scramble-text";

export default function MaintenanceOverlay() {
  const scrambleRef = useRef<ScrambleTextRef>(null);

  function onMouseOverText() {
    const isLarsWatching = Math.random() < 0.05;
    const textToShow = isLarsWatching ? "LARS IS WATCHING" : "ON THE HORIZON";

    scrambleRef.current?.scramble(textToShow);
  }

  // Prevent scrolling when overlay is active
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md h-screen"
      style={{ pointerEvents: "auto", zIndex: 49 }}
    >
      <span onMouseOver={onMouseOverText}>
        <ScrambleText
          ref={scrambleRef}
          text="ON THE HORIZON"
          className="text-primary text-3xl md:text-5xl font-bold font-mono drop-shadow-lg mb-48"
          preserveSpaces
        />
      </span>
    </div>
  );
}
