import { BitcoinAPI, NETWORKS } from "@sundial-protocol/btc-locker";
import { isDev } from "./flags";

const network = isDev ? NETWORKS.testnet : NETWORKS.bitcoin;

export const bitcoinApi = new BitcoinAPI(network);
