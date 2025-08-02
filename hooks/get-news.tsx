"use server";

import { readFile } from "fs/promises";
import path from "path";

export type NewsCard = {
  date: string;
  title: string;
  description: string;
  id: string;
  image: string;
};

export type NewsArticle = NewsCard & {
  content: string;
};

async function getContentForArticle(id: string): Promise<string> {
  try {
    const contentPath = path.join(process.cwd(), "content", "news", `${id}.md`);
    const content = await readFile(contentPath, "utf-8");
    return content;
  } catch (error) {
    console.log(`No content file found for article ${id}`);
    return "";
  }
}

export async function getNews(): Promise<NewsArticle[]> {
  const newsItems: NewsCard[] = [
    {
      date: "6/25/25",
      title: "Sundial Expands Momentum with Key Encounters and Roadmap Release",
      description:
        "Sundial Expands Momentum with Key Encounters and Roadmap Release",
      id: "62525",
      image: "/news/62525Momentum.jpg",
    },
    {
      date: "6/2/25",
      title: "The Sundial Team Attended BTC Vegas",
      description: "The Sundial Team Attended BTC Vegas",
      id: "6225",
      image: "/news/6225Saylor.jpg",
    },
    {
      date: "5/20/25",
      title: "Sundial announces partnership with DeltaDeFi",
      description: "Sundial announces partnership with DeltaDeFi",
      id: "52025",
      image: "/news/52025delta.png",
    },
    {
      date: "5/19/25",
      title: "Sundial announces partnership with Bodega Market",
      description: "Sundial announces partnership with Bodega Market",
      id: "51925",
      image: "/news/51925Bodega.jpg",
    },
    {
      date: "5/12/25",
      title: "Sundial announces partnership with Vespr Wallet",
      description: "Sundial announces partnership with Vespr Wallet",
      id: "51225",
      image: "/news/51225vespr.png",
    },
    {
      date: "5/8/25",
      title:
        "Cardano Joins BTCFi Frontier: Bitlayer & Sundial Forge BitVM Bridge via Strategic Partnerships",
      description:
        "Cardano Joins BTCFi Frontier: Bitlayer & Sundial Forge BitVM Bridge via Strategic Partnerships",
      id: "50825",
      image: "/news/5825BTCFI.png",
    },
    {
      date: "5/5/25",
      title:
        "Sundial Enables First Cross-Chain BTC Transfer Between Bitcoin and Cardano",
      description:
        "Sundial Enables First Cross-Chain BTC Transfer Between Bitcoin and Cardano",
      id: "5525",
      image: "/news/5525crosschain.png",
    },
    {
      date: "4/22/25",
      title: "Sundial CEO Sheldon Hunt presents in Hong Kong",
      description: "Sundial CEO Sheldon Hunt presents in Hong Kong",
      id: "42225",
      image: "/news/42225hongkong.jpeg",
    },
    {
      date: "3/19/25",
      title: "Sundial Protocol PTE. LTD. Incorporated",
      description: "Sundial Protocol PTE. LTD. Incorporated",
      id: "31925",
      image: "/news/31925-incorporated.png",
    },
  ];

  // Load content for each article
  const newsWithContent = await Promise.all(
    newsItems.map(async (item) => ({
      ...item,
      content: await getContentForArticle(item.id),
    }))
  );

  return newsWithContent;
}
