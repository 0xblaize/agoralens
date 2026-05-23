# AgoraLens

Autonomous AI market integrity agent for Arc testnet market contracts and USDC reasoning receipts.

## Problem

Prediction markets can be vague, manipulated, illiquid, or poorly resolved. Agents that only chase alpha can route capital into markets that should fail a basic integrity audit.

## Solution

AgoraLens audits before capital moves. It scans public signals, matches them to Arc testnet market contracts, runs a MarketCourt audit, calculates probability discrepancy, sizes a testnet USDC route, writes reasoning receipts on Arc testnet, and monitors the lifecycle until settlement.

## Agora Agents Fit

- Agents interface with markets through Radar and Arc testnet market contracts.
- MarketCourt makes agentic decisions with Bull, Bear, and Judge logic.
- Receipts are recorded on Arc testnet.
- Amounts, sizing, and fees are denominated in testnet USDC.
- Lifecycle monitoring continues until settlement.

## RFB Mapping

- RFB 02 Prediction Market Trader Intelligence
- RFB 05 Cross Platform Arbitrage Agent
- RFB 06 Social Trading Intelligence

## Circle and Arc Usage

- Arc testnet contract registry for markets.
- Arc testnet receipt registry for AI reasoning receipts.
- USDC-denominated execution logic.
- Circle Wallets onboarding when configured.
- Paymaster-ready module when Circle/Arc config is available.
- Gateway-ready module when credentials are available.
- The Graph indexing for market and receipt events.

## What Is Live

- Arc testnet contract source code.
- Hardhat deployment script for Arc testnet.
- Receipt write API that only runs when Arc testnet config and a testnet private key are present.
- Subgraph schema and mappings for market/receipt events.
- Radar adapters for configured public signals and Arc testnet markets.
- MarketCourt audit API using real registry market metadata when configured.

## What Is Not Live

- No mainnet trading.
- No real funds moved.
- No real market orders.
- No unknown Arc/Agora market API is connected.
- Circle Wallets is shown as not configured until credentials are provided.

## Environment Variables

Copy `.env.example` to `.env.local` and fill only the values you have. Do not commit `.env.local`.

```bash
NEXT_PUBLIC_ARC_CHAIN_ID=
NEXT_PUBLIC_ARC_RPC_URL=
ARC_PRIVATE_KEY_TESTNET=
NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS=
NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS=
NEXT_PUBLIC_SUBGRAPH_URL=

CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
CIRCLE_WALLET_SET_ID=
NEXT_PUBLIC_CIRCLE_ENV=

NEWS_API_KEY=
```

## Run Locally

```bash
npm install
npm run dev
npm run build
```

## Install ARC CLI

```bash
uv tool install git+https://github.com/the-canteen-dev/ARC-cli
arc --help
arc-cli --help
ARC-cli --help
```

## Compile and Deploy Contracts

```bash
npm run contracts:compile
npm run contracts:deploy:arc
```

The deploy command prints:

```bash
NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS=...
NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS=...
```

Add those addresses to `.env.local`.

## Test Flow

1. Open `/create-agent`.
2. Configure Circle Wallets or use the honest local profile state.
3. Open `/dashboard#radar`.
4. Configure `NEWS_API_KEY` and Arc testnet market registry values to load real Radar inputs.
5. Send a configured Arc market to MarketCourt.
6. Call `/api/marketcourt/audit` with `marketId`, `signal`, and `agentId`.
7. Use `/api/execution/write-receipt` only with Arc testnet credentials.
8. Open `/dashboard#ledger` to read receipts through the subgraph or RPC fallback.
