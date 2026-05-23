/**
 * AgoraLens — Arc Testnet Contract Deployment
 *
 * Deploys:
 *   1. MarketRegistry        — stores Arc testnet market metadata
 *   2. ReasoningReceiptRegistry — stores AI audit reasoning receipts
 *
 * ⚠️  TESTNET ONLY. No real funds. No real market orders. No mainnet.
 *
 * Run:
 *   npx hardhat run scripts/deploy.ts --network arcTestnet
 *
 * Requirements in .env.local:
 *   ARC_RPC_URL=<your keyed RPC URL>           ← server-only, never NEXT_PUBLIC_
 *   ARC_PRIVATE_KEY_TESTNET=<testnet wallet key>
 */

import { network } from "hardhat";

async function main() {
  // ── 0. Pre-flight checks ────────────────────────────────────────────────────

  if (!process.env.ARC_RPC_URL) {
    console.error("\n❌  ARC_RPC_URL is not set in .env.local");
    console.error("    This must be a server-only variable — do NOT use NEXT_PUBLIC_\n");
    process.exitCode = 1;
    return;
  }

  if (!process.env.ARC_PRIVATE_KEY_TESTNET) {
    console.error("\n❌  ARC_PRIVATE_KEY_TESTNET is not set in .env.local");
    console.error("    Use a testnet wallet only. Never use a mainnet private key.\n");
    process.exitCode = 1;
    return;
  }

  // ── 1. Connect to Arc Testnet ───────────────────────────────────────────────

  const { ethers } = await network.connect("arcTestnet");
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    console.error("\n❌  No deployer account found. Check ARC_PRIVATE_KEY_TESTNET.\n");
    process.exitCode = 1;
    return;
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceFormatted = ethers.formatEther(balance);

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  AgoraLens — Arc Testnet Deployment");
  console.log("  ⚠️  TESTNET ONLY — No real funds");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log(`  Deployer :  ${deployer.address}`);
  console.log(`  Balance  :  ${balanceFormatted} (native gas token)`);
  console.log(`  Chain ID :  5042002 (Arc Testnet)\n`);

  if (balance === 0n) {
    console.error("❌  Deployer wallet has zero balance.");
    console.error("    Fund this address with Arc Testnet gas before deploying:");
    console.error(`    ${deployer.address}`);
    console.error(`    Explorer: ${process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://testnet.arcscan.app"}\n`);
    process.exitCode = 1;
    return;
  }

  // ── 2. Deploy MarketRegistry ────────────────────────────────────────────────

  console.log("  [1/2] Deploying MarketRegistry...");
  const MarketRegistry = await ethers.getContractFactory("MarketRegistry");
  const marketRegistry = await MarketRegistry.deploy();
  await marketRegistry.waitForDeployment();
  const marketRegistryAddress = await marketRegistry.getAddress();
  console.log(`        ✅ MarketRegistry deployed\n`);

  // ── 3. Deploy ReasoningReceiptRegistry ─────────────────────────────────────

  console.log("  [2/2] Deploying ReasoningReceiptRegistry...");
  const ReasoningReceiptRegistry = await ethers.getContractFactory("ReasoningReceiptRegistry");
  const receiptRegistry = await ReasoningReceiptRegistry.deploy();
  await receiptRegistry.waitForDeployment();
  const receiptRegistryAddress = await receiptRegistry.getAddress();
  console.log(`        ✅ ReasoningReceiptRegistry deployed\n`);

  // ── 4. Output ───────────────────────────────────────────────────────────────

  const explorerBase = process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://testnet.arcscan.app";

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Deployment Complete");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("  MarketRegistry");
  console.log(`    Address : ${marketRegistryAddress}`);
  console.log(`    Explorer: ${explorerBase}/address/${marketRegistryAddress}\n`);
  console.log("  ReasoningReceiptRegistry");
  console.log(`    Address : ${receiptRegistryAddress}`);
  console.log(`    Explorer: ${explorerBase}/address/${receiptRegistryAddress}\n`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Add these lines to your .env.local:\n");
  console.log(`  NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS=${marketRegistryAddress}`);
  console.log(`  NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS=${receiptRegistryAddress}`);
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("  Next steps:");
  console.log("  1. Paste the two addresses above into .env.local");
  console.log("  2. Restart your Next.js dev server: npm run dev");
  console.log("  3. Go to /radar — markets will appear once you create some");
  console.log("  4. Go to /marketcourt and run an audit");
  console.log("  5. Go to /execution — deploy receipt to ReasoningReceiptRegistry");
  console.log("  6. Go to /ledger — your receipt will appear on-chain\n");
}

main().catch((error: unknown) => {
  console.error("\n❌  Deployment failed:");
  if (error instanceof Error) {
    console.error(`    ${error.message}\n`);
    // Never log stack traces that might contain private key fragments
  } else {
    console.error("    Unknown error\n");
  }
  process.exitCode = 1;
});
