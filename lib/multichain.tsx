import { Bitcoin, Coins } from "lucide-react";
import { isDev } from "@/lib/flags";
import { CurrencyCode } from "@/hooks/dashboard/prices";

export type SupportedChain = "btc" | "ada" | "btc_testnet" | "ada_testnet";

export interface ChainConfig {
  id: SupportedChain;
  name: string;
  symbol: CurrencyCode;
  icon: React.ReactNode;
  addressPrefix: string;
  minDeposit: number;
  decimals: number;
  explorerBaseUrl: string;
  explorerTxSlug: string;
  features: string[];
  enabled?: boolean;
}

export const chainConfigs: Record<SupportedChain, ChainConfig> = {
  btc: {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: <Bitcoin className="w-4 h-4" />,
    addressPrefix: "bc1q",
    minDeposit: 0.001,
    decimals: 8,
    explorerBaseUrl: "https://blockstream.info/",
    explorerTxSlug: "tx/",
    features: [
      "Native Bitcoin staking",
      "8.5% APY average",
      "Liquid staking available",
      "No lock-up period",
    ],
    enabled: true,
  },
  ada: {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    icon: <Coins className="w-4 h-4" />,
    addressPrefix: "addr1",
    minDeposit: 10,
    decimals: 6,
    explorerBaseUrl: "https://cardanoscan.io/",
    explorerTxSlug: "transaction/",
    features: [
      "Stake pool delegation",
      "4-6% APY rewards",
      "5-day epoch duration",
      "Liquid staking tokens",
    ],
    enabled: true,
  },
  btc_testnet: {
    id: "btc_testnet",
    name: "Bitcoin Testnet",
    symbol: "tBTC",
    icon: <Bitcoin className="w-4 h-4" />,
    addressPrefix: "tb1q",
    minDeposit: 0.000001,
    decimals: 8,
    explorerBaseUrl: "https://blockstream.info/testnet/",
    explorerTxSlug: "tx/",
    features: [
      "Testnet Bitcoin staking",
      "For development/testing only",
      "No real value",
    ],
    enabled: isDev,
  },
  ada_testnet: {
    id: "ada_testnet",
    name: "Cardano Preprod",
    symbol: "tADA",
    icon: <Coins className="w-4 h-4" />,
    addressPrefix: "addr_test1",
    minDeposit: 10,
    decimals: 6,
    explorerBaseUrl: "https://preprod.cardanoscan.io/",
    explorerTxSlug: "transaction/",
    features: [
      "Testnet Cardano staking",
      "For development/testing only",
      "No real value",
    ],
    enabled: isDev,
  },
};
