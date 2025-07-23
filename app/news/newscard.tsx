interface NewsCardProps {
  title: string;
  description: string;
  date: string;
  link: string;
  image: string;
  content?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  date,
  link,
  image,
}) => {
  return (
    <div className="border rounded-lg shadow-md overflow-hidden bg-background flex flex-col h-full">
      <div className="h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-2 text-primary">{title}</h3>
        <div className="text-sm text-foreground mb-2">{date}</div>
        <p className="text-sm text-foreground/70 mb-2">{description}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto text-primary hover:underline text-sm font-medium"
          >
            Read More
          </a>
        )}
      </div>
    </div>
  );
};

export default NewsCard;
