import { NextResponse } from "next/server";
import { Contract, Wallet, getAddress } from "ethers";
import { MARKET_REGISTRY_ABI } from "@/src/lib/arc/abis";
import { getArcConfig, getMissingArcMarketConfig } from "@/src/lib/arc/config";
import { getArcProvider } from "@/src/lib/arc/contracts";

/**
 * POST /api/arc/import-market
 *
 * Imports an external prediction market into the on-chain MarketRegistry.
 * Testnet only. No real funds. No trades. No orders.
 */

type ImportMarketRequest = {
  externalMarketId?: string;
  platform?: string;
  question?: string;
  category?: string;
  resolutionSource?: string;
  deadline?: string;
  impliedProbability?: number;
  liquidity?: number;
  marketUrl?: string;
  metadataHash?: string;
};

type ReceiptLog = {
  topics: readonly string[];
  data: string;
};

const TX_WAIT_TIMEOUT_MS = 60_000; // 60-second max for tx confirmation

export async function POST(request: Request) {
  // ── 1. Validate request body ──────────────────────────────────────────────
  let body: ImportMarketRequest;
  try {
    body = (await request.json()) as ImportMarketRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const missingFields = [
    "externalMarketId",
    "platform",
    "question",
    "category",
    "resolutionSource",
    "deadline",
    "marketUrl",
    "metadataHash",
  ].filter((field) => !body[field as keyof ImportMarketRequest]);

  if (missingFields.length) {
    return NextResponse.json(
      { error: `Missing market metadata: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  // ── 2. Validate Arc testnet config ────────────────────────────────────────
  const missingConfig = getMissingArcMarketConfig();
  if (missingConfig.length || !process.env.ARC_PRIVATE_KEY_TESTNET) {
    return NextResponse.json(
      {
        error: "Arc testnet import is not configured.",
        missing: [
          ...missingConfig,
          ...(process.env.ARC_PRIVATE_KEY_TESTNET ? [] : ["ARC_PRIVATE_KEY_TESTNET"]),
        ],
      },
      { status: 400 },
    );
  }

  const { marketRegistryAddress } = getArcConfig();
  const provider = getArcProvider();
  if (!provider || !marketRegistryAddress) {
    return NextResponse.json(
      { error: "Arc testnet provider or MarketRegistry address is unavailable." },
      { status: 400 },
    );
  }

  // ── 3. Pre-flight: check wallet balance ───────────────────────────────────
  let walletAddress = "(unknown)";
  try {
    const signer = new Wallet(process.env.ARC_PRIVATE_KEY_TESTNET, provider);
    walletAddress = signer.address;
    const balance = await provider.getBalance(signer.address);

    if (balance === 0n) {
      return NextResponse.json(
        {
          error: "Arc testnet wallet has zero balance — cannot submit transaction.",
          detail: `Wallet ${signer.address} needs testnet funds. Visit the Arc testnet faucet to fund it.`,
          walletAddress: signer.address,
        },
        { status: 402 },
      );
    }
  } catch (balanceError) {
    // Non-fatal: log and continue — balance check is best-effort
    console.warn("[import-market] Balance check failed:", balanceError);
  }

  // ── 4. Submit transaction ─────────────────────────────────────────────────
  try {
    const signer = new Wallet(process.env.ARC_PRIVATE_KEY_TESTNET, provider);
    const contract = new Contract(
      getAddress(marketRegistryAddress),
      MARKET_REGISTRY_ABI,
      signer,
    );

    // Encode metadataHash: keccak256 output is already a 0x-prefixed 32-byte hex
    const metadataHash = body.metadataHash as string;

    const tx = await contract.importExternalMarket(
      body.externalMarketId,
      body.platform,
      body.question,
      body.category,
      body.resolutionSource,
      BigInt(body.deadline ?? "0"),
      BigInt(Math.max(0, Math.round(body.liquidity ?? 0))),
      Math.max(0, Math.min(100, Math.round(body.impliedProbability ?? 0))),
      "External Prediction Market",
      body.marketUrl,
      metadataHash,
      // Override gasLimit to bypass Arc testnet's broken eth_estimateGas
      // (the node returns null revert data which makes estimateGas throw before the tx is sent)
      { gasLimit: 500_000 },
    );

    // Wait with timeout so the route doesn't hang indefinitely
    const receipt = await Promise.race([
      tx.wait(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Transaction confirmation timed out after 60s")), TX_WAIT_TIMEOUT_MS),
      ),
    ]);

    const logs = (receipt as { logs?: ReceiptLog[] } | null)?.logs ?? [];
    const parsedEvent = logs
      .map((log: ReceiptLog) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((event) => event?.name === "ExternalMarketImported");

    const marketId = parsedEvent?.args?.marketId?.toString() ?? null;
    const txHash = (receipt as { hash?: string } | null)?.hash ?? tx.hash;

    if (!marketId) {
      // Tx succeeded but event not found — return txHash so user can verify manually
      return NextResponse.json({
        marketId: null,
        txHash,
        status: "submitted",
        warning: "Transaction submitted but ExternalMarketImported event not found in receipt. Check the explorer.",
      });
    }

    return NextResponse.json({
      marketId,
      txHash,
      status: "imported",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    // Try to extract revert reason from raw data field
    const revertData = (error as { data?: string })?.data ?? "";
    const isDeadline = /DEADLINE_IN_PAST/i.test(detail) || /DEADLINE_IN_PAST/i.test(revertData);
    const isGas = /insufficient funds|out of gas|gas required/i.test(detail);
    const isRpc = /network|fetch|ECONNREFUSED|timeout|could not detect/i.test(detail);
    const isRevert = /revert|execution reverted|CALL_EXCEPTION/i.test(detail);

    const userMessage = isDeadline
      ? "Market deadline is in the past according to Arc testnet block time. Choose a market that expires further in the future."
      : isGas
        ? `Arc testnet wallet (${walletAddress}) has insufficient funds for gas.`
        : isRpc
          ? "Could not connect to Arc testnet RPC. Check ARC_RPC_URL or try again."
          : isRevert
            ? "Transaction reverted on Arc testnet. The contract rejected this market — likely DEADLINE_IN_PAST. Try a market expiring 7+ days from now."
            : "Could not import external market to Arc testnet.";

    console.error("[import-market] Error:", detail);

    return NextResponse.json(
      { error: userMessage, detail },
      { status: 500 },
    );
  }
}
