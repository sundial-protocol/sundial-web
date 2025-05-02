import NewsCard from "./newscard";

interface NewsItem {
  title: string;
  description: string;
  date: string;
  link: string;
}

interface NewsListProps {
  news: NewsItem[];
}

const NewsList: React.FC<NewsListProps> = ({ news }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, index) => (
        <NewsCard
          key={index}
          title={item.title}
          description={item.description}
          date={item.date}
          link={item.link}
        />
      ))}
    </div>
  );
};

export default NewsList;
