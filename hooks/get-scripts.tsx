import { SupportedChain } from "@/lib/multichain";

// TODO: Bring in actual addresses
export const depositAddress = (selectedChain: SupportedChain) => {
  switch (selectedChain) {
    case "btc":
      // TODO: replace with your actual address
      return "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    case "btc_testnet":
      // TODO: replace with your actual address
      return "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";
    case "ada":
      // TODO: replace with your actual address
      return "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlhfx7r6ydpetdqmmgjqfnw83ee3k2urpwqcxwq34fxs2o34twt0koq";
    default:
      throw new Error(`Unsupported chain: ${selectedChain}`);
  }
};
