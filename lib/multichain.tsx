import { Bitcoin, Coins } from "lucide-react";
import { Flags } from "@/lib/flags";
import { CurrencyCode } from "@/hooks/dashboard/prices";

export type SupportedChain = "btc" | "ada" | "btc_testnet" | "ada_testnet";

export const BTC_CHAIN_ID_MAINNET = "000000000019d6689c085ae165831e93";
export const BTC_CHAIN_ID_TESTNET = "000000000933ea01ad0ee984209779ba";

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
    minDeposit: 0.00001,
    decimals: 8,
    explorerBaseUrl: "https://mempool.space/",
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
    minDeposit: 1,
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
    explorerBaseUrl: "https://mempool.space/testnet/",
    explorerTxSlug: "tx/",
    features: [
      "Testnet Bitcoin staking",
      "For development/testing only",
      "No real value",
    ],
    enabled: !Flags.DISABLE_TESTNET,
  },
  ada_testnet: {
    id: "ada_testnet",
    name: "Cardano Preprod",
    symbol: "tADA",
    icon: <Coins className="w-4 h-4" />,
    addressPrefix: "addr_test1",
    minDeposit: 1,
    decimals: 6,
    explorerBaseUrl: "https://preprod.cardanoscan.io/",
    explorerTxSlug: "transaction/",
    features: [
      "Testnet Cardano staking",
      "For development/testing only",
      "No real value",
    ],
    enabled: !Flags.DISABLE_TESTNET,
  },
};
