import "server-only";

import { BTCLocker, FeeUtils, TimeUtils } from "@sundial-protocol/btc-locker";

import type {
  TransferInitiateRequest,
  TransferInitiateSuccessResponse,
  TransferSubmitSignedSourceSuccessResponse,
} from "@/app/api/transfer/types";
import { isBitcoinChain } from "@/lib/multichain";
import * as mock from "./mock-service";

// Demo transfer service.
//
// Exists for one thing: a team demo needs to show a *real* Bitcoin testnet
// wallet signing and broadcasting a *real*, explorer-verifiable transaction,
// without depending on the parts of the real pipeline that are not built yet
// (the placeholder builder, the chain observer, a live L2 block producer —
// see app/dashboard/transfer/README.md). So this mode is honest about being a
// hybrid: the source leg is completely real, and everything after the
// broadcast runs on mock-service's existing timer, exactly as mock mode does.
//
// WHAT IS REAL HERE
//   - fetching the connected wallet's actual confirmed UTXOs on Bitcoin
//     testnet (mempool.space/testnet, via @sundial-protocol/btc-locker — the
//     same library and the same API the staking flow already uses).
//   - building a real, spendable PSBT that sends the quoted amount from the
//     connected wallet into a real CLTV timelock script derived from that
//     same wallet's own public key (@sundial-protocol/btc-locker's
//     createTimelockScript, the same call app/api/btc-staking/route.ts
//     already makes) — reclaimable by the same wallet once the lock expires.
//   - the wallet signature: transfer-progress.tsx's existing signWithWallet()
//     already calls the real connector's signPSBT() whenever the response
//     is not from mock or live mode — this file exists to make that branch
//     reachable with a real PSBT instead of never firing.
//   - the broadcast: the signed hex goes to mempool.space/testnet/api/tx for
//     real, and the txid the UI shows and links to an explorer is the one
//     that endpoint actually returned.
//
// WHAT IS NOT REAL, DELIBERATELY
//   - everything from "confirming" onward. There is no placeholder, no
//     proof, no Scrolls signature, no L2 submission — mock-service's own
//     step timer plays those out exactly as it does for a fully mocked
//     transfer. The real send has nothing downstream of it to actually
//     drive yet; see live-service.ts for what live mode refuses instead of
//     faking, which is the same gap this mode is choosing not to pretend
//     past.
//   - the destination and the mechanism. There is no charms app or vault to
//     receive into, and the real beam-send does not use a CLTV timelock at
//     all — it sends to a shared "always-succeeds" script address so the
//     beam-receive side can consume it without a second signature, an
//     address this codebase does not build anywhere. The timelock here is a
//     demo stand-in chosen for what it can show on screen (a script that
//     visibly cannot be spent yet, reclaimable by the same wallet once the
//     lock expires), not a reproduction of the real lock. transfer-progress.tsx
//     says as much in the signing panel so a demo audience is not left with
//     the wrong idea of how beaming actually works.

export class DemoUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoUnsupportedError";
  }
}

export class DemoBroadcastError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoBroadcastError";
  }
}

const PUBLIC_KEY_PATTERN = /^[0-9a-fA-F]{66}$/;

// How long the real broadcast is locked before the same wallet's key can
// reclaim it. Minutes, not the staking flow's 30 days — long enough that a
// demo visibly cannot spend it straight back, short enough that nobody is
// waiting on it. "Long enough" depends on how long a given demo runs, hence
// the env override.
const DEFAULT_TIMELOCK_MINUTES = 15;

const timelockMinutes = (): number => {
  const raw = Number(process.env.DEMO_TIMELOCK_MINUTES?.trim());
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMELOCK_MINUTES;
};

// A real BitcoinAPI call per demo request, exactly like the staking route's
// per-request BTCLocker. No caching: testnet UTXOs change request to request
// and a stale set produces a transaction the network rejects.
const testnetLocker = (): BTCLocker => new BTCLocker("testnet");

const timelockDestination = async (
  locker: BTCLocker,
  request: TransferInitiateRequest,
): Promise<string> => {
  const publicKey = request.sourcePublicKey?.trim();
  if (!publicKey) {
    throw new DemoUnsupportedError(
      "Your connected wallet did not provide a public key. Demo mode needs one to build a timelock script the same wallet can reclaim from later — try a different Bitcoin wallet connector.",
    );
  }
  if (!PUBLIC_KEY_PATTERN.test(publicKey)) {
    throw new DemoUnsupportedError(
      "The connected wallet's public key is not a valid compressed key (66 hex characters).",
    );
  }

  const locktime = TimeUtils.dateToTimestamp(
    new Date(Date.now() + timelockMinutes() * 60 * 1000),
  );

  try {
    const script = await locker.createTimelockScript(locktime, publicKey);
    return script.address;
  } catch (e) {
    throw new DemoUnsupportedError(
      `Could not build the timelock script: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
};

export const initiate = async (
  request: TransferInitiateRequest,
): Promise<TransferInitiateSuccessResponse> => {
  if (!isBitcoinChain(request.fromChain)) {
    throw new DemoUnsupportedError(
      "Demo mode only builds a real transaction for a Bitcoin testnet source.",
    );
  }

  const locker = testnetLocker();
  const destination = await timelockDestination(locker, request);

  const amountSats = Math.round(request.amount * 1e8);
  if (amountSats < FeeUtils.DUST_THRESHOLD) {
    throw new DemoUnsupportedError(
      `Amount is below the dust threshold (${FeeUtils.DUST_THRESHOLD} sats) once converted — enter a larger amount for a real broadcast.`,
    );
  }

  const utxos = (await locker.api.getAddressUtxos(request.fromAddress)).filter(
    (utxo) => utxo.status.confirmed,
  );
  if (utxos.length === 0) {
    throw new DemoUnsupportedError(
      `No confirmed testnet UTXOs at ${request.fromAddress}. Fund it from a testnet faucet first.`,
    );
  }

  const feeEstimates = await locker.api.getFeeEstimates();
  const feeRate =
    feeEstimates[6] ?? feeEstimates[3] ?? feeEstimates[1] ?? 2;

  // Greedy accumulate-until-covered. Fine for a demo wallet with a handful of
  // UTXOs; not a coin-selection strategy meant to minimize fees or preserve
  // privacy.
  const selected: typeof utxos = [];
  let total = 0;
  let fee = FeeUtils.estimateFee(1, 2, feeRate);
  for (const utxo of utxos) {
    selected.push(utxo);
    total += utxo.value;
    fee = FeeUtils.estimateFee(selected.length, 2, feeRate);
    if (total >= amountSats + fee) break;
  }
  if (total < amountSats + fee) {
    throw new DemoUnsupportedError(
      `Insufficient confirmed testnet balance: have ${total} sats, need ${amountSats + fee} (amount + estimated fee).`,
    );
  }

  const { changeAmount, isAboveDustThreshold } = FeeUtils.calculateChange(
    total,
    amountSats,
    fee,
  );

  const outputs = [{ address: destination, value: amountSats }];
  if (isAboveDustThreshold) {
    outputs.push({ address: request.fromAddress, value: changeAmount });
  }

  // bitcoinjs-lib throws bare, unhelpful errors here (e.g. "has no matching
  // Script" for an address it cannot derive a script from) — wrapped so a
  // malformed address or UTXO is a clean 400 naming the cause, not a 500 with
  // a stack trace pointing at this line.
  let psbtBase64: string;
  try {
    psbtBase64 = await locker.createFundingTransaction({
      inputs: selected,
      outputs,
      sourceAddress: request.fromAddress,
    });
  } catch (e) {
    throw new DemoUnsupportedError(
      `Could not build the real transaction: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  return mock.initiate(request, { realUnsignedTx: psbtBase64 });
};

export const submitSignedSource = async (
  transferId: string,
  signedSourceTx: string,
): Promise<TransferSubmitSignedSourceSuccessResponse> => {
  const locker = testnetLocker();

  let txid: string;
  try {
    const result = await locker.api.broadcastTransaction(signedSourceTx);
    txid = result.txid;
  } catch (e) {
    throw new DemoBroadcastError(
      e instanceof Error
        ? `Testnet rejected the broadcast: ${e.message}`
        : "Testnet rejected the broadcast.",
    );
  }

  return mock.submitSignedSource(transferId, signedSourceTx, {
    realTxid: txid,
  });
};

export const getStatus = mock.getStatus;
