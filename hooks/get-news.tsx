"use server";

import { readFile, readdir } from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type NewsCard = {
  date: string;
  title: string;
  id: string;
  image: string;
};

export type NewsArticle = NewsCard & {
  content: string;
};

export async function getNews(): Promise<NewsArticle[]> {
  try {
    const contentDir = path.join(process.cwd(), "content", "news");
    const files = await readdir(contentDir);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));
    const newsItems = (
      await Promise.all(
        markdownFiles.map(async (file) => {
          const filePath = path.join(contentDir, file);
          const fileContent = await readFile(filePath, "utf-8");
          const { data: frontmatter, content } = matter(fileContent);
          if (!frontmatter.title || !content) return undefined;

          const id = path.basename(file, ".md");

          return {
            id,
            title: frontmatter.title || "Untitled",
            date: frontmatter.date || "Unknown",
            image: frontmatter.image || "/news/default.jpg",
            content,
          };
        })
      )
    ).filter((item) => item !== undefined);

    // console.log("Loaded news items:", newsItems);

    if (!newsItems || newsItems?.length <= 0) return [];

    // Sort by date (newest first)
    newsItems.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return newsItems;
  } catch (error) {
    console.error("Error loading news articles:", error);
    return [];
  }
}
