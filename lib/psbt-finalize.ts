import { Psbt } from "bitcoinjs-lib";

/**
 * Encode a witness stack into the serialized format used by
 * PSBT_IN_FINAL_SCRIPTWITNESS (BIP-174 key 0x08).
 *
 * Format: <varint:num_items> [<varint:item_length> <item_data>]...
 */
function witnessStackToScriptWitness(witness: Buffer[]): Buffer {
  const parts: Buffer[] = [];

  // Number of witness stack items (compact size uint)
  parts.push(encodeVarInt(witness.length));

  for (const item of witness) {
    // Item length (compact size uint)
    parts.push(encodeVarInt(item.length));
    // Item data
    parts.push(item);
  }

  return Buffer.concat(parts);
}

function encodeVarInt(n: number): Buffer {
  if (n < 0xfd) {
    return Buffer.from([n]);
  } else if (n <= 0xffff) {
    const buf = Buffer.allocUnsafe(3);
    buf.writeUInt8(0xfd, 0);
    buf.writeUInt16LE(n, 1);
    return buf;
  } else {
    const buf = Buffer.allocUnsafe(5);
    buf.writeUInt8(0xfe, 0);
    buf.writeUInt32LE(n, 1);
    return buf;
  }
}

/**
 * Check whether a PSBT input is already finalized
 * (has non-empty finalScriptSig or finalScriptWitness).
 */
function isInputFinalized(
  input: (typeof Psbt.prototype.data.inputs)[0],
): boolean {
  return !!(
    (input.finalScriptSig && input.finalScriptSig.length > 0) ||
    (input.finalScriptWitness && input.finalScriptWitness.length > 0)
  );
}

/**
 * Safely finalize a signed PSBT, handling edge cases with various
 * Bitcoin wallet implementations (Unisat, Xverse, Leather, etc.).
 *
 * Handles:
 * - Already-finalized PSBTs (wallets that auto-finalize like Unisat with autoFinalized:true)
 * - Taproot key-path spends (manual finalization from tapKeySig)
 * - P2WPKH inputs (manual finalization from partialSig)
 * - Mixed input types
 *
 * Returns true if all inputs were successfully finalized.
 */
export function finalizePsbtSafe(psbt: Psbt): boolean {
  try {
    return _finalizePsbtSafe(psbt);
  } catch {
    return false;
  }
}

function _finalizePsbtSafe(psbt: Psbt): boolean {
  const inputs = psbt.data.inputs;

  // Already fully finalized
  if (inputs.every(isInputFinalized)) {
    return true;
  }

  // Try standard finalization
  try {
    psbt.finalizeAllInputs();
    return true;
  } catch {
    // Fall through to per-input finalization
  }

  // Per-input finalization with manual fallbacks
  let allFinalized = true;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];

    if (isInputFinalized(input)) {
      continue;
    }

    // Try standard finalization for this input
    try {
      psbt.finalizeInput(i);
      continue;
    } catch {
      // Fall through to manual finalization
    }

    // Taproot key-path: witness = [schnorr_signature]
    if (input.tapKeySig && input.tapKeySig.length > 0) {
      input.finalScriptWitness = witnessStackToScriptWitness([input.tapKeySig]);
      // Must use `delete` (not `= undefined`) — bip174 serializer
      // iterates object keys and crashes on undefined values.
      delete input.tapKeySig;
      delete input.tapInternalKey;
      delete input.tapMerkleRoot;
      delete input.tapBip32Derivation;
      delete input.sighashType;
      continue;
    }

    // P2SH-P2WPKH: witness = [sig, pubkey] + scriptSig = redeemScript push
    if (input.partialSig && input.partialSig.length > 0 && input.redeemScript) {
      const firstSig = input.partialSig[0];
      if (firstSig?.pubkey && firstSig?.signature) {
        input.finalScriptWitness = witnessStackToScriptWitness([
          firstSig.signature,
          firstSig.pubkey,
        ]);
        const redeemScriptLen = input.redeemScript.length;
        const scriptSig = Buffer.allocUnsafe(1 + redeemScriptLen);
        scriptSig.writeUInt8(redeemScriptLen, 0);
        input.redeemScript.copy(scriptSig, 1);
        input.finalScriptSig = scriptSig;
        delete input.partialSig;
        delete input.bip32Derivation;
        delete input.redeemScript;
        delete input.sighashType;
        continue;
      }
    }

    // P2WPKH: witness = [signature, publicKey]
    if (input.partialSig && input.partialSig.length > 0) {
      const firstSig = input.partialSig[0];
      if (firstSig?.pubkey && firstSig?.signature) {
        input.finalScriptWitness = witnessStackToScriptWitness([
          firstSig.signature,
          firstSig.pubkey,
        ]);
        delete input.partialSig;
        delete input.bip32Derivation;
        delete input.sighashType;
        continue;
      }
    }

    allFinalized = false;
  }

  return allFinalized;
}
