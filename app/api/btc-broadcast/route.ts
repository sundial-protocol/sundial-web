import { NextRequest, NextResponse } from "next/server";
import { Psbt } from "bitcoinjs-lib";
import type { BtcBroadcastResponse } from "./types";
import { finalizePsbtSafe } from "@/lib/psbt-finalize";
import { bitcoinApi } from "@/lib/bitcoin-api";
import { BitcoinAPI, NETWORKS } from "@sundial-protocol/btc-locker";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BtcBroadcastResponse>> {
  try {
    const body = await request.json();
    const { psbt, rawTx, network } = body;

    // Use a network-specific API so testnet PSBTs broadcast to testnet
    // and mainnet PSBTs broadcast to mainnet, regardless of deployment env.
    const api =
      network === "testnet"
        ? new BitcoinAPI(NETWORKS.testnet)
        : network === "bitcoin"
          ? new BitcoinAPI(NETWORKS.bitcoin)
          : bitcoinApi; // fallback to env-based default

    if (!psbt && !rawTx) {
      return NextResponse.json(
        { error: "Missing PSBT or rawTx" },
        { status: 400 },
      );
    }

    let txHex: string;

    // Path A: Raw transaction hex (already finalized & extracted client-side)
    if (rawTx && typeof rawTx === "string") {
      txHex = rawTx;
    }
    // Path B: PSBT — finalize & extract server-side
    else if (psbt && typeof psbt === "string") {
      let signedPsbt;
      try {
        signedPsbt = Psbt.fromBase64(psbt);
      } catch (psbtError: any) {
        return NextResponse.json(
          { error: "Invalid PSBT format", details: psbtError.message },
          { status: 400 },
        );
      }

      try {
        const finalized = finalizePsbtSafe(signedPsbt);
        if (!finalized) {
          return NextResponse.json(
            { error: "Unable to finalize PSBT" },
            { status: 400 },
          );
        }
        txHex = signedPsbt.extractTransaction().toHex();
      } catch (finalizeError: any) {
        return NextResponse.json(
          {
            error: "Unable to finalize or extract transaction",
            details: finalizeError.message,
          },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Broadcast using the shared BitcoinAPI client
    let txid: string;
    try {
      const result = await api.broadcastTransaction(txHex);
      txid = result.txid;
    } catch (broadcastError: any) {
      return NextResponse.json(
        {
          error: "Transaction rejected by Bitcoin network",
          details: broadcastError.message || String(broadcastError),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        txid,
        rawTransaction: txHex,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      {
        error: "Failed to broadcast transaction",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
