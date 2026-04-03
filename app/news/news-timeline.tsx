"use client";

import SunbeamBackground, {
  SUNBEAM_COLOR,
} from "@/components/ui/sunbeam/sunbeam-bg";
import { NewsCard } from "@/hooks/get-news";
import { Section } from "@/components/ui/section";
import { useEffect, useRef } from "react";
import styles from "./news-timeline.module.css";
import { NewsWidget } from "./highlights";

export function NewsTimeline({ newsItems }: { newsItems: NewsCard[] }) {
  const timelineRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      const atStart = timeline.scrollLeft === 0;
      const atEnd =
        Math.ceil(timeline.scrollLeft + timeline.clientWidth) >=
        timeline.scrollWidth;
      // Scrolling left but already at start
      if (e.deltaY < 0 && atStart) return;
      // Scrolling right but already at end
      if (e.deltaY > 0 && atEnd) return;
      e.preventDefault();
      timeline.scrollLeft += e.deltaY;
    };
    timeline.addEventListener("wheel", onWheel, { passive: false });
    return () => timeline.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            top: "150px",
            height: "700px",
            background: `linear-gradient(to bottom left, ${SUNBEAM_COLOR} 0%, ${SUNBEAM_COLOR} 20%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 70%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)`,
            clipPath: "polygon(100% 100%, 100% 0%, -90% 50%)",
          },
        },
      ]}
    >
      <Section className="-mt-24">
        <div className="w-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl text-center mb-8 pt-24">
            Highlights
          </h1>
          <p className="max-w-[700px] text-foreground/90 md:text-xl">
            Our brightest moments and fondest memories.
          </p>
        </div>
        <div className={styles.timeline}>
          <ol
            ref={timelineRef}
            className="md:w-full -mx-24 md:mx-auto "
            style={{ display: "block", textAlign: "center" }}
          >
            {newsItems.map((item, index) => (
              <li key={index}>
                <NewsWidget item={item} />
              </li>
            ))}
            <li></li>
          </ol>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
