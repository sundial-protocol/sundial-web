import { SupportedChain } from "@/lib/multichain";

// TODO: Bring in actual addresses
export const depositAddress = (selectedChain: SupportedChain) => {
  return selectedChain === "btc" || selectedChain === "btc_testnet"
    ? "bc1qyourportfolioaddresshere"
    : "addr1qyourportfolioaddresshere";
};
