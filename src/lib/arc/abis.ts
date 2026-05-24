export const MARKET_REGISTRY_ABI = [
  "function getMarkets() view returns ((uint256 marketId,string externalMarketId,string platform,string question,string category,string resolutionSource,uint256 deadline,uint256 createdAt,uint8 status,address creator,uint256 liquidityHint,uint16 impliedProbability,string marketType,string marketUrl,bytes32 metadataHash)[])",
  "function getMarket(uint256 marketId) view returns (uint256 marketId,string externalMarketId,string platform,string question,string category,string resolutionSource,uint256 deadline,uint256 createdAt,uint8 status,address creator,uint256 liquidityHint,uint16 impliedProbability,string marketType,string marketUrl,bytes32 metadataHash)",
  "function importExternalMarket(string externalMarketId,string platform,string question,string category,string resolutionSource,uint256 deadline,uint256 liquidityHint,uint16 impliedProbability,string marketType,string marketUrl,bytes32 metadataHash) returns (uint256 marketId)",
  "event MarketCreated(uint256 indexed marketId,string question,string category,string resolutionSource,uint256 deadline,uint256 liquidityHint,string marketType,address indexed creator)",
  "event ExternalMarketImported(uint256 indexed marketId,string externalMarketId,string platform,string question,string category,string resolutionSource,uint256 deadline,uint256 liquidityHint,uint16 impliedProbability,string marketType,string marketUrl,bytes32 indexed metadataHash,address indexed creator)",
  "event MarketStatusUpdated(uint256 indexed marketId,uint8 status)",
] as const;

export const RECEIPT_REGISTRY_ABI = [
  "function getReceipt(uint256 receiptId) view returns (uint256 receiptId,string agentId,uint256 marketId,bytes32 signalHash,bytes32 reasoningHash,uint16 integrityScore,uint16 agentProbability,uint16 marketProbability,int256 edgeBps,uint256 suggestedUsdcAmount,string decision,uint8 lifecycleState,uint256 timestamp,address writer)",
  "function getReceiptsByAgent(string agentId) view returns ((uint256 receiptId,string agentId,uint256 marketId,bytes32 signalHash,bytes32 reasoningHash,uint16 integrityScore,uint16 agentProbability,uint16 marketProbability,int256 edgeBps,uint256 suggestedUsdcAmount,string decision,uint8 lifecycleState,uint256 timestamp,address writer)[])",
  "function writeReceipt(string agentId,uint256 marketId,bytes32 signalHash,bytes32 reasoningHash,uint16 integrityScore,uint16 agentProbability,uint16 marketProbability,int256 edgeBps,uint256 suggestedUsdcAmount,string decision) returns (uint256 receiptId)",
  "function updateLifecycleState(uint256 receiptId,uint8 lifecycleState)",
  "event ReceiptWritten(uint256 indexed receiptId,string agentId,uint256 indexed marketId,bytes32 indexed reasoningHash,uint16 integrityScore,string decision,address writer)",
  "event LifecycleUpdated(uint256 indexed receiptId,uint8 lifecycleState)",
] as const;
