import { getArcConfig } from "./config";
import type { ArcMarket, ReasoningReceipt } from "./types";

type GraphMarket = Omit<ArcMarket, "source">;
type GraphReceipt = Omit<ReasoningReceipt, "source">;

async function graphRequest<T>(query: string, variables?: Record<string, unknown>) {
  const { subgraphUrl } = getArcConfig();
  if (!subgraphUrl) {
    return null;
  }

  const response = await fetch(subgraphUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Subgraph request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }
  return payload.data ?? null;
}

export async function fetchMarketsFromSubgraph() {
  const data = await graphRequest<{ markets: GraphMarket[] }>(`
    query AgoraLensMarkets {
      markets(orderBy: createdAt, orderDirection: desc, first: 50) {
        marketId
        externalMarketId
        platform
        question
        category
        resolutionSource
        deadline
        createdAt
        status
        creator
        liquidityHint
        impliedProbability
        marketType
        marketUrl
        metadataHash
      }
    }
  `);

  return data?.markets.map((market) => ({ ...market, source: "subgraph" as const })) ?? null;
}

export async function fetchReceiptsFromSubgraph(agentId?: string) {
  const data = await graphRequest<{ receipts: GraphReceipt[] }>(
    `
      query AgoraLensReceipts($agentId: String) {
        receipts(
          where: { agentId: $agentId }
          orderBy: timestamp
          orderDirection: desc
          first: 50
        ) {
          receiptId
          agentId
          marketId
          signalHash
          reasoningHash
          integrityScore
          agentProbability
          marketProbability
          edgeBps
          suggestedUsdcAmount
          decision
          lifecycleState
          timestamp
          writer
          txHash
        }
      }
    `,
    { agentId: agentId ?? null },
  );

  return data?.receipts.map((receipt) => ({ ...receipt, source: "subgraph" as const })) ?? null;
}
