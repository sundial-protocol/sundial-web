"use client";

import { useEffect, useRef } from "react";

export default function MaintenanceOverlay() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  function onMouseOverText() {
    let iteration = 0;
    const span = spanRef.current;
    if (!span) return;

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    const value = span.dataset.value ?? span.innerText;
    intervalRef.current = setInterval(() => {
      span.innerText = span.innerText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return value[index] ?? letter;
          }
          if (letter === " ") {
            return " ";
          }
          return letters[Math.floor(Math.random() * 26)];
        })
        .join("");

      if (iteration >= value.length) {
        clearInterval(intervalRef.current!);
      }
      iteration += 1;
    }, 30);
  }

  // Prevent scrolling when overlay is active
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md h-screen"
      style={{ pointerEvents: "auto", zIndex: 49 }}
    >
      <span
        ref={spanRef}
        onMouseOver={onMouseOverText}
        data-value="ON THE HORIZON"
        className="text-primary text-3xl md:text-5xl font-bold font-mono drop-shadow-lg mb-48"
      >
        ON THE HORIZON
      </span>
    </div>
  );
}
