# AgoraLens

AgoraLens is an AI market integrity agent for prediction markets. It connects live signal sources to live market feeds, imports selected markets to Arc Testnet, runs MarketCourt AI audits, writes reasoning receipts, and tracks the receipt lifecycle in Ledger.

https://youtu.be/enopirenKdc

## What AgoraLens Does

- Loads live public signals from GDELT and Google News RSS.
- Loads a read-only Polymarket market feed.
- Imports selected markets as Arc Testnet audit targets.
- Runs MarketCourt with Bull, Bear, and Judge analysis using Gemini.
- Writes AI reasoning receipts to the Arc Testnet receipt registry.
- Shows receipt ID, lifecycle state, tx hash, explorer link, and receipt JSON in Ledger.

## Live Flow

1. Create or restore an Agent Wallet session.
2. Open Radar to review live signal feed and live market feed.
3. Import a selected market to Arc Testnet.
4. Run MarketCourt to produce a market integrity audit and verdict.
5. Write a reasoning receipt to Arc Testnet.
6. Open Ledger to review the receipt, transaction hash, explorer link, and lifecycle monitor.

## Arc Testnet Contracts

AgoraLens uses Arc Testnet contracts for audit targets and reasoning receipts:

- `MarketAuditRegistry` stores imported market metadata as audit targets.
- `ReasoningReceiptRegistry` stores MarketCourt receipt data.
- The subgraph indexes market and receipt events when configured.
- RPC fallback reads registry state directly when a subgraph is not available.

All contract writes are Arc Testnet only.

## Circle Wallet Usage

Circle Wallet configuration is optional for local development. When Circle credentials are present, AgoraLens can use wallet-backed onboarding. Without Circle credentials, the app uses a Local Agent Session for testnet flow access.

No mainnet funds are used. No real orders are placed.

## MarketCourt

MarketCourt uses Gemini to produce structured JSON audits with:

- Bull Agent argument
- Bear Agent risk analysis
- Judge Agent verdict
- Integrity score
- Agent probability
- Market probability
- Edge in basis points
- Risk flags
- Final MarketCourt verdict

The backend requests strict JSON and validates the response before the UI renders it.

## Signal and Market Sources

- GDELT and Google News RSS provide public signal inputs.
- Polymarket is used as a read-only market feed.
- AgoraLens does not place trades through Polymarket.
- Imported markets are recorded as Arc Testnet audit targets.

## Safety Scope

- Arc Testnet only.
- Testnet receipt writes only.
- No mainnet funds.
- No real orders.
- No live betting trades.
- USDC values are testnet receipt notionals for reasoning and audit records.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Build and lint:

```bash
npm run build
npm run lint
```

## Compile and Deploy Contracts

```bash
npm run contracts:compile
npm run contracts:deploy:arc
```

The deploy command prints the Arc Testnet registry addresses:

```text
NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS=...
NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS=...
```

Add those values to `.env.local`.

## Environment Variables

Create `.env.local` and configure only the values you need:

```text
ARC_RPC_URL=
ARC_PRIVATE_KEY_TESTNET=
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_EXPLORER_URL=https://testnet.arcscan.app
NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS=
NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS=
NEXT_PUBLIC_ARC_SUBGRAPH_URL=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

NEWS_API_KEY=

CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
CIRCLE_WALLET_SET_ID=
```

Never commit private keys, API keys, or entity secrets.

## Verification Checklist

- Radar shows provider status for signals, markets, Arc registry, and receipts.
- Import writes an Arc Testnet audit target.
- MarketCourt returns a validated Gemini verdict.
- Execution writes an Arc Testnet reasoning receipt.
- Ledger shows receipt ID, lifecycle state, tx hash when available, and explorer link.
