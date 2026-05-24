export type ArcMarketStatus = "OPEN" | "PAUSED" | "RESOLVED" | "CANCELLED";

export type ArcMarket = {
  marketId: string;
  externalMarketId: string;
  platform: string;
  question: string;
  category: string;
  resolutionSource: string;
  deadline: string;
  createdAt: string;
  status: ArcMarketStatus;
  creator: string;
  liquidityHint: string;
  impliedProbability: number;
  marketType: string;
  marketUrl: string;
  metadataHash: string;
  source: "subgraph" | "rpc";
};

export type ReceiptLifecycleState = "ENTRY" | "MONITORING" | "RESOLUTION_CHECK" | "SETTLED" | "REJECTED";

export type ReasoningReceipt = {
  receiptId: string;
  agentId: string;
  marketId: string;
  signalHash: string;
  reasoningHash: string;
  integrityScore: number;
  agentProbability: number;
  marketProbability: number;
  edgeBps: string;
  suggestedUsdcAmount: string;
  decision: string;
  lifecycleState: ReceiptLifecycleState;
  timestamp: string;
  writer?: string;
  txHash?: string;
  source: "subgraph" | "rpc";
};

export type ArcDataState<T> =
  | { status: "configured"; data: T; source: "subgraph" | "rpc" }
  | { status: "empty"; message: string; source: "subgraph" | "rpc" }
  | { status: "not-configured"; message: string; missing: string[] }
  | { status: "error"; message: string; detail?: string };
