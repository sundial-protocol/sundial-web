import { NextRequest, NextResponse } from "next/server";
import { BTCLocker } from "@sundial-protocol/btc-locker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      network = "bitcoin", // "bitcoin" or "testnet"
    } = body;

    // Validate required fields
    if (!address) {
      return NextResponse.json(
        { error: "Missing required field: address" },
        { status: 400 },
      );
    }

    console.log(
      `Fetching UTXOs for address: ${address} on network: ${network}`,
    );

    // Create BTCLocker instance
    const locker = new BTCLocker(network);

    // Fetch UTXOs for the address
    const utxos = await locker.api.getAddressUtxos(address);

    console.log(`Found ${utxos.length} UTXOs for address ${address}`);

    // Calculate total balance
    const totalBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0);

    return NextResponse.json({
      success: true,
      address: address,
      utxos: utxos,
      totalBalance: totalBalance,
      totalBalanceBTC: totalBalance / 1e8,
      count: utxos.length,
    });
  } catch (error: any) {
    console.error("Error fetching UTXOs:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch UTXOs",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
