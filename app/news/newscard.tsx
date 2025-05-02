interface NewsCardProps {
  title: string;
  description: string;
  date: string;
  link: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  date,
  link,
}) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="text-xs text-gray-400 mb-2">{date}</div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline text-sm font-medium"
      >
        Read More
      </a>
    </div>
  );
};

export default NewsCard;
