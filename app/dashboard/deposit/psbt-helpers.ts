import {
  Psbt,
  address as btcAddressUtils,
  networks as btcNetworks,
} from "bitcoinjs-lib";
import { DepositIntentSuccessResponse } from "@/app/api/deposit-intent/types";
import { BtcWithdrawalSuccessResponse } from "@/app/api/btc-withdrawal/types";

/** Returns the PSBT base64 string regardless of which route produced the data. */
export const getPsbtBase64 = (
  data: DepositIntentSuccessResponse | BtcWithdrawalSuccessResponse,
): string => ("psbt_base64" in data ? data.psbt_base64 : data.psbt);

/**
 * Logs each output script type to verify P2WPKH/P2WSH after server fix.
 * Check the browser console for ✅ P2WPKH / ✅ P2WSH / ⚠️ NOT native segwit.
 */
export const verifyOutputScripts = (
  psbtB64: string,
  network: typeof btcNetworks.bitcoin,
): void => {
  try {
    const psbt = Psbt.fromBase64(psbtB64);
    psbt.txOutputs.forEach((output, i) => {
      const s = Buffer.from(output.script);
      const isOpReturn = s[0] === 0x6a;
      const isP2wpkh = s.length === 22 && s[0] === 0x00 && s[1] === 0x14;
      const isP2wsh = s.length === 34 && s[0] === 0x00 && s[1] === 0x20;
      if (isOpReturn) {
        console.log(`PSBT output ${i}: OP_RETURN (metadata)`);
      } else if (isP2wpkh) {
        console.log(`PSBT output ${i} ✅ P2WPKH: ${s.toString("hex")}`);
      } else if (isP2wsh) {
        console.log(`PSBT output ${i} ✅ P2WSH: ${s.toString("hex")}`);
      } else {
        console.warn(
          `PSBT output ${i} ⚠️ NOT native segwit: ${s.toString("hex")}`,
        );
      }
    });
  } catch (e) {
    console.warn("Could not verify PSBT output scripts:", e);
  }
};

/**
 * Finds the first non-change, non-OP_RETURN output address to watch for
 * mempool confirmation. Pass the user's own address as `excludeAddress`.
 */
export const extractFirstOutputAddress = (
  psbtB64: string,
  excludeAddress: string,
  network: typeof btcNetworks.bitcoin,
): string => {
  try {
    const psbt = Psbt.fromBase64(psbtB64);
    for (const output of psbt.txOutputs) {
      const s = Buffer.from(output.script);
      if (s[0] === 0x6a) continue; // skip OP_RETURN
      try {
        const addr = btcAddressUtils.fromOutputScript(s, network);
        if (addr !== excludeAddress) return addr;
      } catch {}
    }
  } catch {}
  return "";
};
