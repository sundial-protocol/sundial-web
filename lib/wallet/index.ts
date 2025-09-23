export { useWallet, type WalletContext } from "./context";
export { connect, disconnect, initWallet, loadLucid } from "./connect";
export {
  WalletError,
  WalletNotFoundError,
  WalletConnectionError,
  TransactionError,
  InsufficientFundsError,
  notifyError,
  handleWalletError,
} from "./errors";
export {
  getInstalledWallets,
  getWalletDisplayName,
  getWalletIcon,
  knownWalletExtensions,
} from "./support";

// Re-export types from @evolution-sdk/lucid
export type {
  Lucid,
  Network,
  WalletApi,
  UTxO,
  Assets,
} from "@evolution-sdk/lucid";
