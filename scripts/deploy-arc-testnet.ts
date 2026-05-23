import { network } from "hardhat";

async function main() {
  if (!process.env.ARC_RPC_URL) {
    throw new Error(
      "ARC_RPC_URL is required for Arc testnet deployment.\n" +
      "Add it to .env.local (server-only — do NOT use NEXT_PUBLIC_ prefix).",
    );
  }
  if (!process.env.ARC_PRIVATE_KEY_TESTNET) {
    throw new Error(
      "ARC_PRIVATE_KEY_TESTNET is required for Arc testnet deployment.",
    );
  }

  const { ethers } = await network.connect("arcTestnet");
  const [deployer] = await ethers.getSigners();
  console.log(`\nDeploying AgoraLens contracts from: ${deployer.address}`);
  console.log(`Network: Arc Testnet (chain ${process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? "unknown"})\n`);

  const MarketRegistry = await ethers.getContractFactory("MarketRegistry");
  const marketRegistry = await MarketRegistry.deploy();
  await marketRegistry.waitForDeployment();
  const marketAddr = await marketRegistry.getAddress();

  const ReasoningReceiptRegistry = await ethers.getContractFactory("ReasoningReceiptRegistry");
  const receiptRegistry = await ReasoningReceiptRegistry.deploy();
  await receiptRegistry.waitForDeployment();
  const receiptAddr = await receiptRegistry.getAddress();

  console.log("✅ Contracts deployed. Add these to your .env.local:\n");
  console.log(`NEXT_PUBLIC_MARKET_REGISTRY_ADDRESS=${marketAddr}`);
  console.log(`NEXT_PUBLIC_RECEIPT_REGISTRY_ADDRESS=${receiptAddr}`);
  console.log(`\nVerify on: ${process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://testnet.arcscan.app"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

