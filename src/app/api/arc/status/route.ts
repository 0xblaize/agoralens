import { NextResponse } from "next/server";
import { Wallet, formatEther } from "ethers";
import { getArcConfig } from "@/src/lib/arc/config";
import { getArcProvider } from "@/src/lib/arc/contracts";

/**
 * GET /api/arc/status
 *
 * Returns Arc testnet connection status:
 * - RPC reachable?
 * - Wallet address and balance
 * - MarketRegistry address configured?
 *
 * Used to diagnose import failures.
 * Never exposes private key or RPC URL.
 */
export async function GET() {
  const config = getArcConfig();
  const provider = getArcProvider();

  if (!provider) {
    return NextResponse.json(
      {
        status: "error",
        error: "Arc RPC provider not configured. Set ARC_RPC_URL in .env.local.",
      },
      { status: 400 },
    );
  }

  if (!process.env.ARC_PRIVATE_KEY_TESTNET) {
    return NextResponse.json(
      {
        status: "error",
        error: "ARC_PRIVATE_KEY_TESTNET not set in .env.local.",
      },
      { status: 400 },
    );
  }

  try {
    const network = await provider.getNetwork();
    const signer = new Wallet(process.env.ARC_PRIVATE_KEY_TESTNET, provider);
    const balanceWei = await provider.getBalance(signer.address);
    const balanceEth = formatEther(balanceWei);
    const hasBalance = balanceWei > 0n;

    return NextResponse.json({
      status: "ok",
      rpc: "connected",
      chainId: network.chainId.toString(),
      chainName: network.name,
      walletAddress: signer.address,
      balance: balanceEth,
      balanceWei: balanceWei.toString(),
      hasBalance,
      marketRegistryAddress: config.marketRegistryAddress ?? null,
      receiptRegistryAddress: config.receiptRegistryAddress ?? null,
      warning: !hasBalance
        ? `Wallet ${signer.address} has zero balance. Fund it from the Arc testnet faucet before importing markets.`
        : null,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: "error",
        error: "Could not connect to Arc testnet RPC.",
        detail,
      },
      { status: 503 },
    );
  }
}
