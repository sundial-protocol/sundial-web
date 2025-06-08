import Link from "next/link";
import styles from "./recent-news.module.css";
import { Section } from "@/components/ui/section";

type NewsWidgetProps = {
  date: string;
  title: string;
  description: string;
  link: string;
  image: string;
};

function NewsWidget({ date, title, link, image }: NewsWidgetProps) {
  return (
    <div
      className={styles.newsItem}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <span className="bg-black/80 p-4 rounded-lg flex flex-col space-y-2 text-white">
        <h2 className="text-2xl font-bold py-2 text-primary">{date}</h2>
        {title}
        <Link href={link} className="text-gray-500">
          Read more
        </Link>
      </span>
    </div>
  );
}

export default function RecentNews() {
  return (
    <Section>
      <div className={styles.timeline}>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 pt-24">
          Highlights
        </h1>
        <ol className="w-full scrollbar-hidden">
          <li>
            <NewsWidget
              date="5/20/25"
              title="Sundial announces partnership with DeltaDeFi"
              description="Sundial announces partnership with DeltaDeFi"
              link="/news"
              image="/news/52025delta.png"
            />
          </li>
          <li>
            <NewsWidget
              date="5/19/25"
              title="Sundial announces partnership with Bodega Market"
              description="Sundial announces partnership with Bodega Market"
              link="/news"
              image="/news/51925Bodega.jpg"
            />
          </li>
          <li>
            <NewsWidget
              date="5/12/25"
              title="Sundial announces partnership with Vespr Wallet"
              description="Sundial announces partnership with Vespr Wallet"
              link="/news"
              image="/news/51225vespr.png"
            />
          </li>
          <li>
            <NewsWidget
              date="5/8/25"
              title="Cardano Joins BTCFi Frontier: Bitlayer & Sundial Forge BitVM Bridge via Strategic Partnerships"
              description="Cardano Joins BTCFi Frontier: Bitlayer & Sundial Forge BitVM Bridge via Strategic Partnerships"
              link="/news"
              image="/news/5825BTCFI.png"
            />
          </li>
          <li>
            <NewsWidget
              date="5/5/25"
              title="Sundial Enables First Cross-Chain BTC Transfer Between Bitcoin and Cardano"
              description="Sundial Enables First Cross-Chain BTC Transfer Between Bitcoin and Cardano"
              link="/news"
              image="/news/5525crosschain.png"
            />
          </li>
          <li>
            <NewsWidget
              date="4/22/25"
              title="Sundial CEO Sheldon Hunt presents in Hong Kong"
              description="Sundial CEO Sheldon Hunt presents in Hong Kong"
              link="/news"
              image="/news/42225hongkong.jpeg"
            />
          </li>
          <li>
            <NewsWidget
              date="3/19/25"
              title="Sundial Protocol PTE. LTD. Incorporated"
              description="Sundial Protocol PTE. LTD. Incorporated"
              link="/news"
              image="/news/31925-incorporated.png"
            />
          </li>
          <li></li>
        </ol>
      </div>
    </Section>
  );
}
