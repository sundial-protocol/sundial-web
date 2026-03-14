import { NextRequest, NextResponse } from "next/server";
import {
  BTCLocker,
  TimeUtils,
  DawnWithdrawalParams,
} from "@sundial-protocol/btc-locker";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";
import type { BtcWithdrawalResponse } from "./types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BtcWithdrawalResponse>> {
  try {
    const body = await request.json();
    const {
      withdrawAddress,
      amount,
      userPublicKey,
      network = "bitcoin", // "bitcoin" or "testnet"
      locktime,
    } = body;

    // Validate required fields
    if (!withdrawAddress || !amount || !userPublicKey || !locktime) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: withdrawAddress, amount, userPublicKey, locktime",
        },
        { status: 400 },
      );
    }

    // Validate public key format
    if (!/^[0-9a-fA-F]{66}$/.test(userPublicKey)) {
      return NextResponse.json(
        { error: "Invalid public key format. Must be 66 hex characters." },
        { status: 400 },
      );
    }

    // Validate locktime format and ensure it has passed
    if (!Number.isInteger(locktime) || locktime <= 0) {
      return NextResponse.json(
        { error: "Invalid locktime format. Must be a positive integer." },
        { status: 400 },
      );
    }

    // Check if locktime has passed
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // If locktime is a timestamp (>= 500000000), check against current time
    // If locktime is a block height (< 500000000), we assume it's valid for now
    if (locktime >= 500000000 && locktime > currentTimestamp) {
      return NextResponse.json(
        {
          error:
            "Locktime has not yet passed. Cannot withdraw funds before the lock period expires.",
          locktime: locktime,
          currentTime: currentTimestamp,
        },
        { status: 400 },
      );
    }

    console.log(`Creating withdrawal transaction for ${amount} BTC`);

    // Create BTCLocker instance
    const locker = new BTCLocker(network);

    // Create timelock script for withdrawal
    const timelockScriptInfo = await locker.createTimelockScript(
      locktime,
      userPublicKey,
    );

    // Create escrow script for withdrawal
    const escrowScriptInfo = await locker.createEscrowScript(
      locktime,
      userPublicKey,
      YIELD_PROVIDER_PUBKEY,
    );

    const withdrawalParams: DawnWithdrawalParams = {
      escrowAddress: escrowScriptInfo.address,
      escrowRedeemScript: escrowScriptInfo.redeemScript,
      timelockAddress: timelockScriptInfo.address,
      timelockRedeemScript: timelockScriptInfo.redeemScript,
      destination: withdrawAddress,
    };

    console.log("Withdrawal params:", withdrawalParams);

    // Create dawn withdrawal transaction
    const psbtBase64 =
      await locker.createDawnWithdrawalTransaction(withdrawalParams);

    console.log("Withdrawal transaction created successfully");

    return NextResponse.json({
      success: true,
      psbt: psbtBase64,
      transactionType: "withdraw",
      amount: amount,
      withdrawAddress: withdrawAddress,
      escrowAddress: escrowScriptInfo.address,
      timelockAddress: timelockScriptInfo.address,
      locktime: locktime,
    });
  } catch (error: any) {
    console.error("Error creating Bitcoin withdrawal transaction:", error);

    return NextResponse.json(
      {
        error: "Failed to create withdrawal transaction",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
