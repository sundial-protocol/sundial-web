import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function generateSitemaps() {
  // Return array of sitemap IDs
  return [{ id: "main" }, { id: "news" }];
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sundial-protocol.com";

  if (id === "main") {
    // Static pages sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/company`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/roadmap`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/docs`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];
  }

  if (id === "news") {
    // Dynamic news articles sitemap
    const newsDirectory = path.join(process.cwd(), "content/news");
    let newsPages: MetadataRoute.Sitemap = [];

    try {
      const filenames = fs.readdirSync(newsDirectory);
      newsPages = filenames
        .filter((name) => name.endsWith(".md"))
        .map((name) => {
          const filePath = path.join(newsDirectory, name);
          const fileContents = fs.readFileSync(filePath, "utf8");
          const { data } = matter(fileContents);
          const slug = name.replace(/\.md$/, "");

          return {
            url: `${baseUrl}/news/${slug}`,
            lastModified: new Date(data.date || new Date()),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          };
        });
    } catch (error) {
      console.warn(
        "Could not read news directory for sitemap generation:",
        error
      );
    }

    return newsPages;
  }

  // Fallback for unknown sitemap IDs
  return [];
}
