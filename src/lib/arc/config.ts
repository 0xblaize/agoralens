// All values here are SERVER-SIDE ONLY.
// ARC_RPC_URL and ARC_SUBGRAPH_URL must NEVER use NEXT_PUBLIC_ prefix.
// Contract addresses are on-chain public values — safe as NEXT_PUBLIC_.

export type ArcConfig = {
  chainId?: string;
  rpcUrl?: string;
  marketRegistryAddress?: string;
  receiptRegistryAddress?: string;
  subgraphUrl?: string;
};

export function getArcConfig(): ArcConfig {
  return {
    chainId: process.env.NEXT_PUBLIC_ARC_CHAIN_ID,
    // ⚠ Server-only — contains a personal RPC key. NEVER use NEXT_PUBLIC_ here.
    rpcUrl: process.env.ARC_RPC_URL,
    marketRegistryAddress: process.env.NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS,
    receiptRegistryAddress: process.env.NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS,
    // ⚠ Server-only — may contain a subgraph API key.
    subgraphUrl: process.env.ARC_SUBGRAPH_URL,
  };
}

export function getMissingArcMarketConfig(config = getArcConfig()) {
  const required: Array<[string, string | undefined]> = [
    ["ARC_RPC_URL", config.rpcUrl],
    ["NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS", config.marketRegistryAddress],
  ];
  return required
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function getMissingArcReceiptConfig(config = getArcConfig()) {
  const required: Array<[string, string | undefined]> = [
    ["ARC_RPC_URL", config.rpcUrl],
    ["NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS", config.receiptRegistryAddress],
  ];
  return required
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function getMissingArcWriteConfig() {
  const missing: string[] = [];
  if (!process.env.ARC_RPC_URL) missing.push("ARC_RPC_URL");
  if (!process.env.NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS) missing.push("NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS");
  if (!process.env.ARC_PRIVATE_KEY_TESTNET) missing.push("ARC_PRIVATE_KEY_TESTNET");
  return missing;
}
