import { SupportedChain } from "@/lib/multichain";

// Valid Bitcoin addresses for each network
export const depositAddress = (chain: SupportedChain): string => {
  switch (chain) {
    case "btc":
      // Replace with your actual mainnet Bitcoin address
      return "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"; // Example mainnet address
    case "btc_testnet":
      // Replace with your actual testnet Bitcoin address
      return "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"; // Example testnet address
    case "ada":
      // Replace with your actual Cardano address
      return "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlhfx7r6ydpetdqmmgjqfnw83ee3k2urpwqcxwq34fxs2o34twt0koq"; // Example Cardano address
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

// Alternative: Generate addresses programmatically (more advanced)
export const generateDepositAddress = (
  chain: SupportedChain,
  index: number = 0
): string => {
  // This would use your HD wallet or key derivation
  // For now, return the static addresses above
  return depositAddress(chain);
};
