import { NextRequest, NextResponse } from "next/server";
import {
  BTCLocker,
  TimeUtils,
  DawnStakingParams,
} from "@sundial-protocol/btc-locker";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";
import type { BtcStakingResponse } from "./types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BtcStakingResponse>> {
  try {
    const body = await request.json();
    const {
      sourceAddress,
      amount,
      userPublicKey,
      network = "bitcoin", // "bitcoin" or "testnet"
      locktime = TimeUtils.dateToTimestamp(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ), // 30 days from now
    } = body;

    // Validate required fields
    if (!sourceAddress || !amount || !userPublicKey) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: sourceAddress, amount, userPublicKey",
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

    console.log(`Creating staking transaction for ${amount} BTC`);

    // Create BTCLocker instance
    const locker = new BTCLocker(network);

    // Create timelock script
    const timelockScriptInfo = await locker.createTimelockScript(
      locktime,
      userPublicKey,
    );

    // Create escrow script
    const escrowScriptInfo = await locker.createEscrowScript(
      locktime,
      YIELD_PROVIDER_PUBKEY,
      userPublicKey,
    );

    const stakingParams: DawnStakingParams = {
      sourceAddress: sourceAddress,
      escrowAddress: escrowScriptInfo.address,
      escrowAmount: Math.trunc((Number(amount) * 1e8) / 4), // Convert to satoshis
      timelockAddress: timelockScriptInfo.address,
      timelockAmount: Math.trunc((Number(amount) * 3 * 1e8) / 4), // Convert to satoshis
      changeAddress: sourceAddress, // Send change back to source address
    };

    console.log(stakingParams);

    // Create dawn staking transaction using both scripts
    const psbtBase64 = await locker.createDawnStakingTransaction(stakingParams);

    console.log("Staking transaction created successfully");

    return NextResponse.json({
      success: true,
      psbt: psbtBase64,
      transactionType: "deposit",
      amount: amount,
      escrowScript: escrowScriptInfo,
      timelockScript: timelockScriptInfo,
      locktime: locktime,
    });
  } catch (error: any) {
    console.error("Error creating Bitcoin staking transaction:", error);

    return NextResponse.json(
      {
        error: "Failed to create staking transaction",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
