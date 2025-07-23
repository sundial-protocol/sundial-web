import Link from "next/link";
import styles from "./recent-news.module.css";
import { Section } from "@/components/ui/section";
import { getNews, NewsCard } from "@/hooks/get-news";
import React from "react";
import { NewsTimeline } from "./news-timeline";

type NewsWidgetProps = {
  date: string;
  title: string;
  description: string;
  link: string;
  image: string;
};

export function NewsWidget({ date, title, link, image }: NewsWidgetProps) {
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

export default async function RecentNews() {
  const newsItems: NewsCard[] = await getNews();

  return (
    <Section>
      {/* Pass newsItems to a Client Component if needed */}
      <NewsTimeline newsItems={newsItems} />
    </Section>
  );
}
