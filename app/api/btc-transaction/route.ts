import { NextRequest, NextResponse } from "next/server";
import {
  BTCLocker,
  TimeUtils,
  DawnStakingParams,
  DawnWithdrawalParams,
} from "@sundial-protocol/btc-locker";
import { YIELD_PROVIDER_PUBKEY } from "@/lib/yield-provider";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceAddress,
      withdrawAddress,
      amount,
      userPublicKey,
      transactionType, // "deposit" or "withdraw"
      network = "bitcoin", // "bitcoin" or "testnet"
    } = body;

    // Validate required fields
    if (!sourceAddress || !amount || !userPublicKey || !transactionType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: sourceAddress, amount, userPublicKey, transactionType",
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

    // Validate transaction type
    if (!["deposit", "withdraw"].includes(transactionType)) {
      return NextResponse.json(
        { error: "Invalid transaction type. Must be 'deposit' or 'withdraw'" },
        { status: 400 },
      );
    }

    // For withdrawals, withdrawAddress is required
    if (transactionType === "withdraw" && !withdrawAddress) {
      return NextResponse.json(
        { error: "withdrawAddress is required for withdraw transactions" },
        { status: 400 },
      );
    }

    console.log(`Creating ${transactionType} transaction for ${amount} BTC`);

    // Create BTCLocker instance
    const locker = new BTCLocker(network);

    let psbtBase64: string;

    if (transactionType === "deposit") {
      // Create deposit transaction
      const locktime: number = TimeUtils.dateToTimestamp(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      );

      // Create timelock script
      const timelockScriptInfo = await locker.createTimelockScript(
        locktime,
        userPublicKey,
      );

      // Create escrow script
      const escrowScriptInfo = await locker.createEscrowScript(
        locktime,
        userPublicKey,
        YIELD_PROVIDER_PUBKEY,
      );

      const stakingParams: DawnStakingParams = {
        sourceAddress: sourceAddress,
        escrowAddress: escrowScriptInfo.address,
        escrowAmount: Math.trunc((Number(amount) * 1e8) / 4), // Convert to satoshis
        timelockAddress: timelockScriptInfo.address,
        timelockAmount: Math.trunc((Number(amount) * 3 * 1e8) / 4), // Convert to satoshis
      };

      console.log(stakingParams);

      // Create dawn staking transaction using both scripts
      psbtBase64 = await locker.createDawnStakingTransaction(stakingParams);

      console.log("Deposit transaction created successfully");

      return NextResponse.json({
        success: true,
        psbt: psbtBase64,
        transactionType: "deposit",
        amount: amount,
        escrowAddress: escrowScriptInfo.address,
        timelockAddress: timelockScriptInfo.address,
        locktime: locktime,
      });
    } else {
      //const withdrawalParams: DawnWithdrawalParams = {

      //}

      //// Create withdraw transaction
      psbtBase64 = ""; // Placeholder for actual PSBT creation
      // await locker.createDawnWithdrawalTransaction({
      //  sourceAddress: sourceAddress,
      //  withdrawAddress: withdrawAddress!,
      //  amount: Number(amount) * 1e8, // Convert to satoshis
      //});

      return NextResponse.json({
        success: true,
        psbt: psbtBase64,
        transactionType: "withdraw",
        amount: amount,
        withdrawAddress: withdrawAddress,
      });
    }
  } catch (error: any) {
    console.error("Error creating Bitcoin transaction:", error);

    return NextResponse.json(
      {
        error: "Failed to create transaction",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
