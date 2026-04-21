import Link from "next/link";
import styles from "./news-timeline.module.css";
import { Section } from "@/components/ui/section";
import { getNews, NewsCard } from "@/hooks/get-news";
import React from "react";
import { NewsTimeline } from "./news-timeline";
import NewsCTA from "./news-cta";

export function NewsWidget({ item }: { item: NewsCard }) {
  const link = "/news/" + item.id;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div
      className={styles.newsItem}
      style={{
        backgroundImage: `url(${item.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link
        href={link}
        className="bg-black/80 p-4 rounded flex flex-col space-y-2 text-primary text-lg"
      >
        {item.title}
        <span className="text-sm py-2 text-gray-100 italic">
          {formatDate(item.date)}
        </span>
      </Link>
    </div>
  );
}

export default async function NewsHighlights() {
  const newsItems: NewsCard[] = await getNews();

  const highlightArticles = [
    "sundial-incorporated",
    "checkpoint-partnership",
    "BitAngels-Pitch",
    "draper-university",
    "ascent-partnership",
    "appold-partnership",
    "btc-vegas-2025",
    "financial-dashboard",
    "Consensus-and-Liquidity",
  ];

  return (
    <Section>
      {/* Pass newsItems to a Client Component if needed */}
      <NewsTimeline
        newsItems={newsItems
          .filter((item) => highlightArticles.includes(item.id))
          .reverse()}
      />
      <NewsCTA />
    </Section>
  );
}
