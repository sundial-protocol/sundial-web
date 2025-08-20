import Link from "next/link";

interface NewsCardProps {
  title: string;
  description: string;
  date: string;
  link: string;
  image: string;
  content: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, date, link, image }) => {
  const imageClass = image.startsWith("/news/!")
    ? "object-contain"
    : "object-cover";

  return (
    <Link href={link} rel="noopener noreferrer">
      <div className="border rounded-lg shadow-md overflow-hidden bg-background flex flex-col h-full">
        <div className="h-48 w-full overflow-hidden bg-gray-700/60">
          <img
            src={image}
            alt={title}
            className={`${imageClass} w-full h-full transition-transform duration-300 hover:scale-[1.15]`}
          />
        </div>
        <div className="p-4 flex flex-col flex-1 justify-between">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <div className="text-sm text-foreground text-right">
            {new Date(date).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
