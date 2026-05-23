import { NextResponse } from "next/server";
import { getArcConfig } from "@/src/lib/arc/config";

// Returns what is/isn't configured — never leaks values, only presence.
export async function GET() {
  const config = getArcConfig();

  const status = {
    rpc: {
      configured: !!config.rpcUrl,
      label: "ARC_RPC_URL",
    },
    marketRegistry: {
      configured: !!config.marketRegistryAddress,
      label: "NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS",
      address: config.marketRegistryAddress ?? null, // address is on-chain public
    },
    receiptRegistry: {
      configured: !!config.receiptRegistryAddress,
      label: "NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS",
      address: config.receiptRegistryAddress ?? null,
    },
    subgraph: {
      configured: !!config.subgraphUrl,
      label: "ARC_SUBGRAPH_URL",
    },
    privateKey: {
      configured: !!process.env.ARC_PRIVATE_KEY_TESTNET,
      label: "ARC_PRIVATE_KEY_TESTNET",
    },
    newsApi: {
      configured: !!process.env.NEWS_API_KEY,
      label: "NEWS_API_KEY",
    },
    network: {
      chainId: process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? null,
      explorerUrl: process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? null,
      currency: process.env.NEXT_PUBLIC_ARC_CURRENCY ?? null,
    },
  };

  const readyForAudit =
    status.rpc.configured && status.marketRegistry.configured;
  const readyToWrite =
    readyForAudit &&
    status.receiptRegistry.configured &&
    status.privateKey.configured;

  return NextResponse.json({
    status,
    readyForAudit,
    readyToWrite,
    mode: "testnet-only",
  });
}
