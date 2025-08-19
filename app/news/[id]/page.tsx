import { Section } from "@/components/ui/section";
import { getNews } from "@/hooks/get-news";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews();
  const article = news.find((item) => item.id === id);
  const currentIndex = news.findIndex((item) => item.id === id);

  // Get previous and next articles
  const previousArticle = currentIndex > 0 ? news[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < news.length - 1 ? news[currentIndex + 1] : null;

  return (
    <Section>
      {article ? (
        <div className="max-w-2xl mx-auto py-6">
          <h1 className="text-6xl font-bold m-4">{article.title}</h1>
          <p className="text-sm text-gray-500 m-4">
            {new Date(article.date).toLocaleDateString()}
          </p>
          <div>
            <div className="prose prose-lg max-w-none">
              <Image
                src={article.image}
                alt={article.title}
                className="w-full h-auto rounded-lg mb-6"
                width={1000}
                height={1000}
              />
              {article.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: (props) => {
                      const { src = "", alt = "" } = props as {
                        src?: string;
                        alt?: string;
                      };
                      return (
                        <Image
                          src={src}
                          alt={alt}
                          width={600}
                          height={400}
                          className="rounded-lg my-4 w-full h-auto"
                        />
                      );
                    },
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-500 italic">
                  Detailed content coming soon...
                </p>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            {previousArticle ? (
              <Link
                href={`/news/${previousArticle.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className="text-sm font-medium truncate max-w-48">
                    {previousArticle.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div /> // Empty div to maintain flex layout
            )}

            {nextArticle ? (
              <Link
                href={`/news/${nextArticle.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
              >
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Next</p>
                  <p className="text-sm font-medium truncate max-w-48">
                    {nextArticle.title}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div /> // Empty div to maintain flex layout
            )}
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
