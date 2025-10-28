import { TeamMemberType } from "./team-member";

export type PeopleDirectory = {
  [key: string]: TeamMemberType[];
};

const CoreTeamMembers: TeamMemberType[] = [
  {
    name: "Sheldon Hunt",
    role: "CEO",
    image: "/team/sheldon.jpg",
    link: "https://x.com/_MrHunt_",
    description: "Ex-Head of Cardano Ecosystem",
    bio: `Sheldon Hunt is the Founder and CEO of Sundial Protocol, former Head of Ecosystem at Emurgo and Canadian diplomat. He brings years of experience in blockchain infrastructure and ecosystem growth, having worked across UTXO-based chains and led initiatives that combine decentralised finance with cross-chain innovation.`,
  },
  {
    name: "Michael Yagi",
    role: "Developer & Ecosystem",
    image: "/team/michael.jpg",
    link: "https://x.com/gubguub",
    description: "Founder of Ikigai Technologies",
    bio: `Michael Yagi is a technology entrepreneur and creative director focused on bridging
      advanced infrastructure with engaging user experiences. Drawing on his experience as one
      of Tableau's fastest-promoted engineers, he combines deep technical expertise with
      strategic product vision and team leadership.`,
  },
  {
    name: "Yoram Benzvi",
    role: "Business Development & Partnerships",
    image: "/team/yoram.png",
    link: "https://x.com/yorambenzvi",
    bio: `Yoram Ben Zvi is an entrepreneur with experience in product management and development, particularly in bridging traditional businesses with cutting-edge technologies like blockchain and AI. He is based in the Geneva Metropolitan Area.`,
  },
  {
    name: "Sam Delaney",
    role: "Core Tech Lead",
    image: "/team/sam.jpg",
    link: "https://x.com/sde_laney",
    description: "Founder of Grabbit",
    bio: `Sam is a design leader and blockchain engineer with years of experience at the forefront of
      UTxO protocol design and development. He has been integral to projects such as
      Hydra-Auction, Grabbit, & Ascent Rivals, and authored the CIP-102 standard and early ZK
      verifiers. Sam has degrees in Computer Science and Linguistics from Trinity Western
      University.`,
  },
  {
    name: "Vic Genin",
    role: "Protocol Lead",
    image: "/team/vic.jpeg",
    link: "https://x.com/DataScientistAI",
    bio: `Vic Genin is a blockchain architect and data technology expert with experience building scalable, secure systems. He has held senior technical roles at Binance, Cere Network, and GameStop, leading projects in cross-chain interoperability and decentralized infrastructure. Vic combines deep technical expertise with a track record of delivering complex blockchain and gaming projects.`,
  },
  {
    name: "Phil Disarro",
    role: "Senior Developer",
    image: "/team/phil.png",
    link: "https://x.com/phil_uplc",
    description: "Founder of Anastasia Labs",
    bio: `Phil Disarro is the Founder and CEO of Anastasia Labs, a research and development firm focused on secure and scalable blockchain infrastructure. He has deep expertise in compiler design, programming language theory, and smart contract security, and has contributed extensively to the Cardano ecosystem.`,
  },
  {
    name: "Lewis Harding",
    role: "Institutional Lead",
    image: "/team/lewis.jpg",
    link: "https://www.linkedin.com/in/lewis-harding/",
    bio: `Lewis Harding is a usiness development strategist with
      15+ years driving partner ecosystems
      and strategic alliances across ASEAN
      markets. He has led cross-functional teams
      to execute complex partnerships
      generating $5M+ revenue through
      strategic partner engagement with
      Global 2000 enterprises.`,
  },
];

const AppoldTeamMembers: TeamMemberType[] = [
  {
    name: "Appold Team",
    role: "Operations & Project Management",
    image: "/team/appold-logo.svg",
    link: "https://www.linkedin.com/company/appold/",
    bio: `Appold is a specialist technology and advisory company focused on the blockchain industry, which incorporates digital
      assets, blockchain technology, decentralised finance (DeFi), and asset tokenisation. Appold provides end-to-end
      advisory solutions on digital transformation, blockchain integration, audit, market screening, analysis, and risk
      management.`,
    needsInversion: true,
  },
  {
    name: "Rob Gaskell",
    role: "Project Manager",
    description: "Founder of Appold",
    image: "/team/rob.jpg",
    link: "https://www.linkedin.com/in/robgaskell/",
    bio: `Founder of Appold and Sundial Protocol. Rob is an advisor in blockchain and the emerging
      technology sector with over 30 years of experience running and expanding international financial
      organisations, including 2030, Pillar Project, Stonehage Fleming and Ermitage.`,
  },
  {
    name: "Pete Osbourne",
    role: "Advisor",
    image: "/team/pete.jpeg",
    description: "Founder of Appold",
    link: "https://www.linkedin.com/in/pete-osborne/",
    bio: `Founder of Appold, Pete is an advisor and investor in digital assets and, more recently, headed the
      European equities business for the Toronto Stock Exchange. Pete has over 20 years of experience
      in listed derivatives and securities within stock exchanges and investment banks, including
      Deutsche Bank, Singapore Exchange and ABN Amro.`,
  },
  {
    name: "Archie Stewart-Wilson",
    role: "Analyst",
    image: "/team/archie.png",
    link: "https://www.linkedin.com/in/archie-stewart-wilson/",
    bio: `Archie holds a first-class degree from Exeter University in Economics. His previous work
      experience includes Deloitte, the Gibraltar Association for New Technologies DeFi Working
      Group and idclear, a AML compliance checker specialising in DeFi. He is a proficient bagpiper
      and Scottish reeler, and an avid racket sports player.`,
  },
  {
    name: "Andy Price",
    role: "Advisor in Digital Assets",
    image: "/team/andy.jpeg",
    description: "Senior Associate at Appold",
    link: "https://www.linkedin.com/in/andy-price0/",
    bio: `Associate at Appold. Andy is an advisor in digital assets, having previously worked in the UK Houses
      of Parliament for the Minister of State for Food, Farming and Fisheries. Before beginning work, Andy
      completed his undergraduate degree at the London School of Economics and Political Science and
      his master’s degree at the University of Cambridge.`,
  },
];

const People: PeopleDirectory = {
  Core: CoreTeamMembers,
  Appold: AppoldTeamMembers,
};

export default People;
