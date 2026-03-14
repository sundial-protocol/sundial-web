import { NextRequest, NextResponse } from "next/server";
import { Psbt } from "bitcoinjs-lib";
import mempoolJS from "@mempool/mempool.js";
import type { BtcBroadcastResponse } from "./types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BtcBroadcastResponse>> {
  try {
    const { psbt, network = "bitcoin" } = await request.json();

    if (!psbt || typeof psbt !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing PSBT" },
        { status: 400 },
      );
    }

    // Validate network parameter
    if (network !== "bitcoin" && network !== "testnet") {
      return NextResponse.json(
        { error: 'Invalid network. Must be "bitcoin" or "testnet"' },
        { status: 400 },
      );
    }

    console.log(`Broadcasting transaction on ${network}`);

    let signedPsbt;
    let rawTransaction;
    let txHex;

    try {
      // Parse the PSBT
      signedPsbt = Psbt.fromBase64(psbt);
      console.log("PSBT parsed successfully");
    } catch (psbtError: any) {
      console.error("PSBT parsing error:", psbtError);
      return NextResponse.json(
        {
          error: "Invalid PSBT format",
          details: psbtError.message || "Unable to parse PSBT",
        },
        { status: 400 },
      );
    }

    try {
      // Check if inputs are already finalized
      let needsFinalization = false;
      for (let i = 0; i < signedPsbt.data.inputs.length; i++) {
        if (
          !signedPsbt.data.inputs[i].finalScriptSig &&
          !signedPsbt.data.inputs[i].finalScriptWitness
        ) {
          needsFinalization = true;
          break;
        }
      }

      // Only finalize if needed
      if (needsFinalization) {
        console.log("Finalizing PSBT inputs...");
        signedPsbt.finalizeAllInputs();
      } else {
        console.log("PSBT inputs already finalized");
      }

      // Extract the raw transaction
      rawTransaction = signedPsbt.extractTransaction();
      txHex = rawTransaction.toHex();
      console.log("Transaction extracted successfully");
    } catch (finalizeError: any) {
      console.error("PSBT finalization error:", finalizeError);

      // Try to extract without finalizing (in case it's already signed but not finalized properly)
      try {
        console.log(
          "Attempting to extract transaction without finalization...",
        );
        rawTransaction = signedPsbt.extractTransaction(true); // Allow incomplete
        txHex = rawTransaction.toHex();
        console.log("Transaction extracted without finalization");
      } catch (extractError: any) {
        console.error("Transaction extraction error:", extractError);
        return NextResponse.json(
          {
            error: "Unable to finalize PSBT or extract transaction",
            details: `Finalization error: ${finalizeError.message}. Extraction error: ${extractError.message}`,
          },
          { status: 400 },
        );
      }
    }

    console.log("Transaction hex:", txHex.slice(0, 100) + "...");

    // Initialize mempool.js client
    const mempool = mempoolJS({
      hostname: "mempool.space",
      network: network === "testnet" ? "testnet" : "main",
    });

    // Broadcast transaction using mempool.js
    const txid = await mempool.bitcoin.transactions.postTx({ txhex: txHex });

    // Ensure txid is a string
    const txidStr = typeof txid === "string" ? txid : String(txid);

    console.log("Transaction broadcast successfully:", txidStr);

    return NextResponse.json(
      {
        success: true,
        txid: txidStr,
        network: network,
        rawTransaction: txHex,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Broadcast error:", error);

    // Handle specific mempool API errors
    if (error.message && error.message.includes("mempool")) {
      return NextResponse.json(
        {
          error: "Failed to broadcast to Bitcoin network",
          details: error.message || "Network broadcast error",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to broadcast transaction",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
