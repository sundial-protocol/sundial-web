import { NextRequest, NextResponse } from "next/server";
import { BroadcastResult, BTCLocker } from "@sundial-protocol/btc-locker";
import * as bitcoin from "bitcoinjs-lib";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      signedPsbt,
      network = "bitcoin", // "bitcoin" or "testnet"
    } = body;

    // Validate required fields
    if (!signedPsbt) {
      return NextResponse.json(
        {
          error: "Missing required field: signedPsbt",
        },
        { status: 400 },
      );
    }

    // Validate signed PSBT format (base64 string)
    let psbtBuffer;
    try {
      psbtBuffer = Buffer.from(signedPsbt, "base64");
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid signed PSBT format. Must be a valid base64 string." },
        { status: 400 },
      );
    }

    // Additional validation - check if PSBT has reasonable size
    if (psbtBuffer.length < 10) {
      return NextResponse.json(
        { error: "PSBT appears to be too small or empty" },
        { status: 400 },
      );
    }

    console.log("Broadcasting signed PSBT transaction");

    // Create BTCLocker instance
    const locker = new BTCLocker(network);

    // First, try to finalize the PSBT manually to extract the raw transaction
    let finalizedPsbt: string;
    try {
      console.log("Attempting to finalize PSBT...");

      const psbt = bitcoin.Psbt.fromBase64(signedPsbt);

      console.log("PSBT parsed, checking signatures...");
      console.log("Input count:", psbt.data.inputs.length);

      // Try to finalize each input individually with error handling
      for (let i = 0; i < psbt.data.inputs.length; i++) {
        try {
          const input = psbt.data.inputs[i];
          const hasPartialSig = input.partialSig && input.partialSig.length > 0;
          const hasFinalScript =
            input.finalScriptSig || input.finalScriptWitness;

          console.log(
            `Input ${i}: hasPartialSig=${hasPartialSig}, hasFinalScript=${!!hasFinalScript}`,
          );

          if (hasPartialSig && !hasFinalScript) {
            console.log(`Attempting to finalize input ${i}...`);
            // Try different finalization approaches for custom scripts
            if (input.witnessUtxo) {
              // For witness transactions, try witness script finalization
              psbt.finalizeInput(i);
            } else if (input.nonWitnessUtxo) {
              // For legacy transactions
              psbt.finalizeInput(i);
            } else {
              console.warn(
                `Input ${i} has no UTXO information for finalization`,
              );
            }
            console.log(`Input ${i} finalized successfully`);
          }
        } catch (inputError: any) {
          console.error(`Failed to finalize input ${i}:`, inputError.message);
          // For custom scripts, this might be expected - continue
        }
      }

      finalizedPsbt = psbt.toBase64();
      console.log("PSBT finalization completed");
    } catch (finalizeError: any) {
      console.error("Failed to finalize PSBT manually:", finalizeError);

      // If finalization fails, try to let BTCLocker handle it directly
      console.log("Attempting to let BTCLocker handle finalization...");
      try {
        const result = await locker.api.broadcastTransaction(signedPsbt);
        console.log(
          "BTCLocker handled finalization successfully:",
          result.txid,
        );

        return NextResponse.json({
          success: true,
          transactionHash: result.txid,
          message: "Transaction submitted successfully to the network",
          explorerUrl:
            network === "testnet"
              ? `https://blockstream.info/testnet/tx/${result.txid}`
              : `https://blockstream.info/tx/${result.txid}`,
        });
      } catch (btcLockerError: any) {
        console.error("BTCLocker also failed:", btcLockerError);
        return NextResponse.json(
          {
            error: "Failed to finalize PSBT",
            details: `Manual finalization: ${finalizeError.message}. BTCLocker: ${btcLockerError.message}`,
          },
          { status: 422 },
        );
      }
    }

    // Now broadcast the finalized PSBT
    let result: BroadcastResult;
    try {
      result = await locker.api.broadcastTransaction(finalizedPsbt);
      console.log("Transaction broadcasted successfully");
    } catch (broadcastError: any) {
      console.error("Failed to broadcast transaction:", broadcastError);
      return NextResponse.json(
        {
          error: "Failed to broadcast transaction",
          details: broadcastError.message || "Unknown error during broadcast",
        },
        { status: 422 },
      );
    }

    console.log("Transaction broadcasted successfully:", result.txid);

    return NextResponse.json({
      success: true,
      transactionHash: result.txid,
      message: "Transaction submitted successfully to the network",
      explorerUrl:
        network === "testnet"
          ? `https://blockstream.info/testnet/tx/${result.txid}`
          : `https://blockstream.info/tx/${result.txid}`,
    });
  } catch (error: any) {
    console.error("Error submitting transaction:", error);

    // Handle specific error cases
    let errorMessage = "Failed to submit transaction";
    let statusCode = 500;

    if (
      error.message?.includes("TX decode failed") ||
      error.message?.includes("at least one input")
    ) {
      errorMessage = "Invalid transaction: missing inputs or malformed PSBT";
      statusCode = 422;
    } else if (error.message?.includes("mempool")) {
      errorMessage = "Transaction rejected by mempool";
      statusCode = 422;
    } else if (error.message?.includes("insufficient")) {
      errorMessage = "Insufficient funds";
      statusCode = 422;
    } else if (error.message?.includes("double")) {
      errorMessage = "Double spend detected";
      statusCode = 422;
    } else if (error.message?.includes("fee")) {
      errorMessage = "Fee too low";
      statusCode = 422;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || "Unknown error occurred",
      },
      { status: statusCode },
    );
  }
}
