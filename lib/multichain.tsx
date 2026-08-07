import { Bitcoin, Coins, Sun } from "lucide-react";
import { Flags } from "@/lib/flags";
import { CurrencyCode } from "@/hooks/dashboard/prices";

export type SupportedChain =
  | "btc"
  | "ada"
  | "btc_testnet"
  | "ada_testnet"
  // The Sundial L2. Bridged BTC on its own ledger — not a Bitcoin network, so
  // Bitcoin-specific paths (PSBT building, mempool.space lookups, wallet network
  // checks) must exclude it. `isSundialL2` below is the guard for that.
  | "sundial_l2";

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
  sundial_l2: {
    id: "sundial_l2",
    name: "Sundial L2",
    // Bridged BTC is redeemable 1:1, so it is denominated in BTC rather than
    // given its own ticker. DEFAULT_PRICES.BTC and .tBTC are equal anyway, so
    // this changes labelling only, not conversion.
    symbol: "BTC",
    icon: <Sun className="w-4 h-4" />,
    // L2 accounts are Cardano-style bech32, same prefix as Preprod.
    addressPrefix: "addr_test1",
    // One base unit at the ledger's 6dp.
    minDeposit: 0.000001,
    decimals: 6,
    // No block explorer exists for the L2 yet. Empty rather than a plausible
    // URL: callers must check for this and render no link, because a dead
    // explorer link is worse than none. See getExplorerUrl in tx-history.
    explorerBaseUrl: "",
    explorerTxSlug: "",
    features: [
      "Bridged BTC, redeemable 1:1 for native BTC",
      "Settles on the L2 ledger — no Bitcoin transaction fee",
      "6 decimal places",
    ],
    enabled: !Flags.DISABLE_TESTNET,
  },
};

// True for chains that settle on a Bitcoin network, i.e. everything the PSBT
// flow, mempool.space lookups and wallet network checks apply to. The Sundial L2
// holds BTC but is not one of them, so it must be excluded from all of those.
export const isBitcoinChain = (chain: SupportedChain): boolean =>
  chain === "btc" || chain === "btc_testnet";

export const isSundialL2 = (chain: SupportedChain): boolean =>
  chain === "sundial_l2";

// Which asset a chain's balance contributes to in the portfolio. The L2 holds
// bridged BTC, so it rolls up under BTC.
export const chainAsset = (chain: SupportedChain): "BTC" | "ADA" =>
  chain === "ada" || chain === "ada_testnet" ? "ADA" : "BTC";
