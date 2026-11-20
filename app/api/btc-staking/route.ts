import { NextRequest, NextResponse } from "next/server";
import {
  BTCLocker,
  TimeUtils,
  DepositParams,
} from "@sundial-protocol/btc-locker";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";
import {
  ESCROW_SHARE,
  MIN_STAKE_BTC,
  MIN_STAKE_SATS,
} from "@/lib/deposit-limits";
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

    // Below the minimum the escrow output is dust, and nodes won't relay the
    // transaction (lib/deposit-limits.ts).
    const amountSats = Math.round(Number(amount) * 1e8);
    if (!Number.isFinite(amountSats) || amountSats < MIN_STAKE_SATS) {
      return NextResponse.json(
        { error: `Amount must be at least ${MIN_STAKE_BTC} BTC.` },
        { status: 400 },
      );
    }

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

    const stakingParams: DepositParams = {
      sourceAddress: sourceAddress,
      escrowAddress: escrowScriptInfo.address,
      escrowAmount: Math.trunc(amountSats * ESCROW_SHARE), // satoshis
      timelockAddress: timelockScriptInfo.address,
      timelockAmount: Math.trunc(amountSats * (1 - ESCROW_SHARE)), // satoshis
      changeAddress: sourceAddress, // Send change back to source address
    };

    // Create dawn staking transaction using both scripts
    const psbtBase64 = await locker.createDepositTransaction(stakingParams);

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
