"use client";

import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";

type ScrambleTextProps = {
  text: string;
  className?: string;
  charset?: string;
  speed?: number; // Optional speed prop to control the scrambling speed
  preserveSpaces?: boolean; // Optional prop to control space handling.
  preserveCommas?: boolean; // Optional prop to control comma handling
};

export type ScrambleTextRef = {
  scramble: (text?: string) => void;
};

const ScrambleText = forwardRef<ScrambleTextRef, ScrambleTextProps>(
  (props, ref) => {
    const letters = props.charset ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const spanRef = useRef<HTMLSpanElement>(null);

    function scramble(text?: string) {
      const newText = String(text ?? props.text); // Ensure it's always a string

      let iteration = 0;
      const span = spanRef.current;
      if (!span) return;

      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }

      // Update the data-value to the new text
      span.dataset.value = newText;

      intervalRef.current = setInterval(() => {
        span.innerText = newText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return newText[index] ?? letter; // Use newText as target
            }
            if (letter === " " && props.preserveSpaces) {
              return " ";
            }
            if (letter === "," && props.preserveCommas) {
              return ",";
            }

            return letters[Math.floor(Math.random() * 26)];
          })
          .join("");

        if (iteration >= newText.length) {
          // Check against newText length
          clearInterval(intervalRef.current!);
        }
        iteration += 1;
      }, props.speed ?? 30);
    }

    useEffect(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      scramble,
    }));

    return (
      <span ref={spanRef} data-value={props.text} className={props.className}>
        {props.text}
      </span>
    );
  },
);

ScrambleText.displayName = "ScrambleText";

export default ScrambleText;
