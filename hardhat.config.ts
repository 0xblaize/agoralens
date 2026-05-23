// Load .env.local FIRST — before any other imports read process.env.
// Hardhat compiles this file via its own TypeScript pipeline,
// so dotenv.config() runs synchronously before network config is evaluated.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });

import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import { defineConfig } from "hardhat/config";

// Validate required env vars early for better error messages
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `\n\n❌  Missing required environment variable: ${name}\n` +
      `   Add it to .env.local (never commit .env.local)\n`,
    );
  }
  return value;
}

// Only validate when running against the real network
const isArcNetwork = process.argv.includes("arcTestnet");

export default defineConfig({
  plugins: [hardhatEthers],

  solidity: {
    profiles: {
      default: {
        version: "0.8.24",
        settings: {
          viaIR: true,
          optimizer: { enabled: true, runs: 200 },
        },
      },
      production: {
        version: "0.8.24",
        settings: {
          viaIR: true,
          optimizer: { enabled: true, runs: 200 },
        },
      },
    },
  },

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },

    arcTestnet: {
      type: "http",
      chainType: "l1",

      // ⚠️  ARC_RPC_URL is SERVER-ONLY.
      // It contains a personal API key — NEVER use NEXT_PUBLIC_ prefix.
      // NEVER log, print, or expose this value.
      url: isArcNetwork
        ? requireEnv("ARC_RPC_URL")
        : (process.env.ARC_RPC_URL ?? ""),

      // Chain ID for Arc Testnet — validated by Hardhat against the RPC
      chainId: 5042002,

      // ⚠️  ARC_PRIVATE_KEY_TESTNET is for testnet signing only.
      // NEVER use a mainnet key here. NEVER log this value.
      accounts: process.env.ARC_PRIVATE_KEY_TESTNET
        ? [process.env.ARC_PRIVATE_KEY_TESTNET]
        : [],
    },
  },
});
