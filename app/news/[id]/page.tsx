import { Section } from "@/components/ui/section";
import { getNews, NewsCard } from "@/hooks/get-news";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews();
  const article = news.find((item: NewsCard) => item.id === id);

  return (
    <Section>
      {article ? (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <p className="text-sm text-gray-500 mb-2">{article.date}</p>
          <p className="mb-6">{article.description}</p>
          <div>
            <Image
              src={article.image}
              alt={article.title}
              className="w-full h-auto rounded-lg mb-6"
              width={1000}
              height={1000}
            />
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        </div>
      )}
    </Section>
  );
}
