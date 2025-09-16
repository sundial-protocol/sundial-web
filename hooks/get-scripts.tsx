import { Chain } from "@/app/dashboard/deposit/types";

// TODO: Bring in actual addresses
export const depositAddress = (selectedChain: Chain) => {
  return selectedChain === "btc" || selectedChain === "btc_testnet"
    ? "bc1qyourportfolioaddresshere"
    : "addr1qyourportfolioaddresshere";
};
