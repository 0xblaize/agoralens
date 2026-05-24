import { getMissingArcReceiptConfig } from "./config";
import { getReceiptRegistryContract } from "./contracts";
import { fetchReceiptsFromSubgraph } from "./subgraph";
import type { ArcDataState, ReasoningReceipt, ReceiptLifecycleState } from "./types";

const LIFECYCLE_STATES: ReceiptLifecycleState[] = [
  "ENTRY",
  "MONITORING",
  "RESOLUTION_CHECK",
  "SETTLED",
  "REJECTED",
];

function normalizeReceipt(raw: Record<string, unknown>): ReasoningReceipt {
  return {
    receiptId: String(raw.receiptId ?? ""),
    agentId: String(raw.agentId ?? ""),
    marketId: String(raw.marketId ?? ""),
    signalHash: String(raw.signalHash ?? ""),
    reasoningHash: String(raw.reasoningHash ?? ""),
    integrityScore: Number(raw.integrityScore ?? 0),
    agentProbability: Number(raw.agentProbability ?? 0),
    marketProbability: Number(raw.marketProbability ?? 0),
    edgeBps: String(raw.edgeBps ?? "0"),
    suggestedUsdcAmount: String(raw.suggestedUsdcAmount ?? "0"),
    decision: String(raw.decision ?? ""),
    lifecycleState: LIFECYCLE_STATES[Number(raw.lifecycleState ?? 0)] ?? "ENTRY",
    timestamp: String(raw.timestamp ?? ""),
    writer: String(raw.writer ?? ""),
    source: "rpc",
  };
}

export async function getArcReceipts(agentId?: string): Promise<ArcDataState<ReasoningReceipt[]>> {
  try {
    const subgraphReceipts = await fetchReceiptsFromSubgraph(agentId);
    if (subgraphReceipts) {
      if (subgraphReceipts.length === 0) {
        return {
          status: "empty",
          source: "subgraph",
          message: "No Arc testnet receipts yet. Run MarketCourt and write a receipt.",
        };
      }
      return { status: "configured", data: subgraphReceipts, source: "subgraph" };
    }

    const missing = getMissingArcReceiptConfig();
    if (missing.length) {
      return {
        status: "not-configured",
        missing,
        message: "Arc testnet receipt registry is not configured.",
      };
    }

    const contract = getReceiptRegistryContract();
    if (!contract || !agentId) {
      return {
        status: "not-configured",
        missing: !agentId ? ["agentId"] : missing,
        message: !agentId
          ? "Select or create an agent to read testnet receipts."
          : "Arc testnet receipt registry is not configured.",
      };
    }

    const rawReceipts = (await contract.getReceiptsByAgent(agentId)) as Record<string, unknown>[];
    const receipts = rawReceipts.map(normalizeReceipt);
    if (receipts.length === 0) {
      return {
        status: "empty",
        source: "rpc",
        message: "No Arc testnet receipts yet. Run MarketCourt and write a receipt.",
      };
    }

    return { status: "configured", data: receipts, source: "rpc" };
  } catch (error) {
    return {
      status: "error",
      message: "Unable to load Arc testnet receipts.",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
