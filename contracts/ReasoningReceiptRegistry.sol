// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReasoningReceiptRegistry {
    enum LifecycleState {
        ENTRY,
        MONITORING,
        RESOLUTION_CHECK,
        SETTLED,
        REJECTED
    }

    struct Receipt {
        uint256 receiptId;
        string agentId;
        uint256 marketId;
        bytes32 signalHash;
        bytes32 reasoningHash;
        uint16 integrityScore;
        uint16 agentProbability;
        uint16 marketProbability;
        int256 edgeBps;
        uint256 suggestedUsdcAmount;
        string decision;
        LifecycleState lifecycleState;
        uint256 timestamp;
        address writer;
    }

    uint256 private nextReceiptId = 1;
    mapping(uint256 => Receipt) private receipts;
    mapping(bytes32 => uint256[]) private receiptsByAgentHash;

    event ReceiptWritten(
        uint256 indexed receiptId,
        string agentId,
        uint256 indexed marketId,
        bytes32 indexed reasoningHash,
        uint16 integrityScore,
        string decision
    );

    event LifecycleUpdated(uint256 indexed receiptId, LifecycleState lifecycleState);

    function writeReceipt(
        string calldata agentId,
        uint256 marketId,
        bytes32 signalHash,
        bytes32 reasoningHash,
        uint16 integrityScore,
        uint16 agentProbability,
        uint16 marketProbability,
        int256 edgeBps,
        uint256 suggestedUsdcAmount,
        string calldata decision
    ) external returns (uint256 receiptId) {
        require(bytes(agentId).length > 0, "AGENT_REQUIRED");
        require(integrityScore <= 100, "BAD_INTEGRITY_SCORE");
        require(agentProbability <= 100, "BAD_AGENT_PROBABILITY");
        require(marketProbability <= 100, "BAD_MARKET_PROBABILITY");

        receiptId = nextReceiptId++;
        receipts[receiptId] = Receipt({
            receiptId: receiptId,
            agentId: agentId,
            marketId: marketId,
            signalHash: signalHash,
            reasoningHash: reasoningHash,
            integrityScore: integrityScore,
            agentProbability: agentProbability,
            marketProbability: marketProbability,
            edgeBps: edgeBps,
            suggestedUsdcAmount: suggestedUsdcAmount,
            decision: decision,
            lifecycleState: LifecycleState.ENTRY,
            timestamp: block.timestamp,
            writer: msg.sender
        });

        receiptsByAgentHash[keccak256(bytes(agentId))].push(receiptId);
        emit ReceiptWritten(receiptId, agentId, marketId, reasoningHash, integrityScore, decision);
    }

    function updateLifecycleState(uint256 receiptId, LifecycleState lifecycleState) external {
        require(receipts[receiptId].timestamp != 0, "RECEIPT_NOT_FOUND");
        receipts[receiptId].lifecycleState = lifecycleState;
        emit LifecycleUpdated(receiptId, lifecycleState);
    }

    function getReceipt(uint256 receiptId) external view returns (Receipt memory) {
        require(receipts[receiptId].timestamp != 0, "RECEIPT_NOT_FOUND");
        return receipts[receiptId];
    }

    function getReceiptsByAgent(string calldata agentId) external view returns (Receipt[] memory results) {
        uint256[] memory ids = receiptsByAgentHash[keccak256(bytes(agentId))];
        results = new Receipt[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            results[i] = receipts[ids[i]];
        }
    }
}
