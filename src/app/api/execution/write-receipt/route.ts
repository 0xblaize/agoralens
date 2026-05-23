import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { RECEIPT_REGISTRY_ABI } from "@/src/lib/arc/abis";
import { getMissingArcWriteConfig } from "@/src/lib/arc/config";

type WriteReceiptRequest = {
  agentId?: string;
  marketId?: string;
  signalHash?: string;
  reasoningHash?: string;
  integrityScore?: number;
  agentProbability?: number;
  marketProbability?: number;
  edgeBps?: number;
  suggestedUsdcAmount?: string;
  decision?: string;
};

export async function POST(request: Request) {
  // Check all server-side secrets are present — never log their values
  const missing = getMissingArcWriteConfig();
  if (missing.length) {
    return NextResponse.json(
      {
        error: "Arc testnet receipt writing is not configured.",
        missing,
        mode: "testnet-only",
      },
      { status: 400 },
    );
  }

  const body = (await request.json()) as WriteReceiptRequest;
  const required: (keyof WriteReceiptRequest)[] = [
    "agentId",
    "marketId",
    "signalHash",
    "reasoningHash",
    "integrityScore",
    "agentProbability",
    "marketProbability",
    "edgeBps",
    "suggestedUsdcAmount",
    "decision",
  ];
  const missingFields = required.filter(
    (field) => body[field] === undefined || body[field] === "",
  );
  if (missingFields.length) {
    return NextResponse.json(
      { error: "Missing receipt fields", missingFields },
      { status: 400 },
    );
  }

  try {
    // ARC_RPC_URL is server-only and never sent to the client
    const provider = new JsonRpcProvider(process.env.ARC_RPC_URL!);
    const wallet = new Wallet(process.env.ARC_PRIVATE_KEY_TESTNET!, provider);
    const contract = new Contract(
      process.env.NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS!,
      RECEIPT_REGISTRY_ABI,
      wallet,
    );

    const tx = await contract.writeReceipt(
      body.agentId,
      BigInt(body.marketId as string),
      body.signalHash,
      body.reasoningHash,
      body.integrityScore,
      body.agentProbability,
      body.marketProbability,
      body.edgeBps,
      BigInt(body.suggestedUsdcAmount as string),
      body.decision,
    );
    const receipt = await tx.wait();

    return NextResponse.json({
      mode: "testnet-only",
      txHash: receipt?.hash ?? tx.hash,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Receipt write failed.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
