import { BtcStakingSuccessResponse } from "@/app/api/btc-staking/types";
import { bitcoinApi } from "@/lib/bitcoin-api";
import { BitcoinConnector } from "@reown/appkit-adapter-bitcoin";
import { TransactionUtils } from "@sundial-protocol/btc-locker";

export async function prepareStakeForSign(
  response: BtcStakingSuccessResponse,
  userAddress: string,
): Promise<BitcoinConnector.SignPSBTParams> {
  const { psbt, amount } = response;

  // get utxos at user address
  const utxos = await bitcoinApi.getAddressUtxos(userAddress);

  // use the utxos to determine which inputs to sign
  //const signInputs = TransactionUtils.selectUtxos(utxos, amount);

  return {
    psbt,
    signInputs: [],
  };
}
