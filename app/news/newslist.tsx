import { NewsArticle } from "@/hooks/get-news";
import NewsCard from "./newscard";

interface NewsListProps {
  news: NewsArticle[];
}

const NewsList: React.FC<NewsListProps> = ({ news }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {news.map((item) => (
        <NewsCard
          key={item.id}
          title={item.title}
          description={item.description}
          date={item.date}
          image={item.image}
          link={`/news/${item.id}`}
        />
      ))}
    </div>
  );
};

export default NewsList;
