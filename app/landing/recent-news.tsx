"use client";

import Link from "next/link";
import styles from "./recent-news.module.css";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { getNews, NewsCard } from "@/hooks/get-news";
import React, { useRef, useEffect } from "react";

type NewsWidgetProps = {
  date: string;
  title: string;
  description: string;
  link: string;
  image: string;
};

function NewsWidget({ date, title, link, image }: NewsWidgetProps) {
  return (
    <div
      className={styles.newsItem}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <span className="bg-black/80 p-4 rounded-lg flex flex-col space-y-2 text-white">
        <h2 className="text-2xl font-bold py-2 text-primary">{date}</h2>
        {title}
        <Link href={link} className="text-gray-500">
          Read more
        </Link>
      </span>
    </div>
  );
}

export default function RecentNews() {
  const newsItems: NewsCard[] = getNews();
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
            content: '""',
            position: "absolute",
            left: "0",
            top: "50px",
            width: "100%",
            height: "700px", // Match the height of the triangle
            background:
              "linear-gradient(to bottom right, hsl(var(--primary)) 0%, hsl(var(--primary)) 20%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 70%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(0% 100%, 0% 0%, 190% 50%)", // Triangle shape
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 pt-24">
          Highlights
        </h1>
        <div className={styles.timeline}>
          <ol
            ref={timelineRef}
            className="md:w-full -mx-24 md:mx-auto "
            style={{ display: "block", textAlign: "center" }}
          >
            {newsItems.map((item, index) => (
              <li key={index}>
                <NewsWidget
                  date={item.date}
                  title={item.title}
                  description={item.description}
                  link={"/news/" + item.id}
                  image={item.image}
                />
              </li>
            ))}
            <li></li>
          </ol>
        </div>
      </Section>
    </SunbeamBackground>
  );
}
