import NewsList from "./newslist";
import { getNews } from "@/hooks/get-news";

export default async function NewsPage() {
  const newsData = await getNews();

  return (
    <div className="container mx-auto py-12 px-4 no-scroll-snap">
      <h1 className="text-3xl font-bold mb-8">Latest News</h1>
      <NewsList news={newsData} />
    </div>
  );
}
