import NewsList from "./newslist";

const newsData = [
  {
    title: "Sundial Launches New Staking Feature",
    description:
      "Discover the latest staking feature that allows you to earn more rewards.",
    date: "October 1, 2023",
    link: "https://example.com/news1",
  },
  {
    title: "Bitcoin Staking Hits New Milestone",
    description: "Over 1 million BTC staked using Sundial's platform.",
    date: "September 25, 2023",
    link: "https://example.com/news2",
  },
  {
    title: "Security Update for Sundial Users",
    description:
      "Learn about the latest security improvements to protect your assets.",
    date: "September 15, 2023",
    link: "https://example.com/news3",
  },
];

const NewsPage = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Latest News</h1>
      <NewsList news={newsData} />
    </div>
  );
};

export default NewsPage;
