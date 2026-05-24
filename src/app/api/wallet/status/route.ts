import { NextResponse } from "next/server";
import { Wallet, formatEther } from "ethers";
import { getArcProvider } from "@/src/lib/arc/contracts";
import { getArcConfig } from "@/src/lib/arc/config";
import { getCircleConfigState } from "@/src/lib/circle/config";

/**
 * GET /api/wallet/status
 *
 * Returns live data only — no placeholders.
 *
 * Arc wallet:
 *   - Address derived from ARC_PRIVATE_KEY_TESTNET (safe — public key only)
 *   - Balance from RPC via eth_getBalance (Arc uses USDC as native gas token,
 *     18 decimals at EVM level, so formatEther is correct)
 *
 * Circle wallets:
 *   - Listed from Circle W3S API using correct sandbox/production base URL
 *   - No entity secret required for reads
 *
 * Never exposes: ARC_PRIVATE_KEY_TESTNET, CIRCLE_ENTITY_SECRET, or RPC URL.
 */

// Arc USDC system contract (native gas token on Arc)
const ARC_USDC_CONTRACT = "0x3600000000000000000000000000000000000000";

// Circle API base — sandbox or production based on env
function getCircleApiBase(): string {
  const env = process.env.NEXT_PUBLIC_CIRCLE_ENV ?? "sandbox";
  return env === "production"
    ? "https://api.circle.com"
    : "https://api-sandbox.circle.com";
}

export async function GET() {
  const arcConfig = getArcConfig();
  const circleConfig = getCircleConfigState();

  // ── Arc testnet wallet ──────────────────────────────────────────────────────
  type ArcWalletInfo = {
    address: string | null;
    balance: string;
    hasBalance: boolean;
    chainId: string | null;
    rpcStatus: "connected" | "error" | "not-configured";
    rpcError?: string;
  };

  const arcWallet: ArcWalletInfo = {
    address: null,
    balance: "0",
    hasBalance: false,
    chainId: arcConfig.chainId ?? null,
    rpcStatus: "not-configured",
  };

  if (process.env.ARC_PRIVATE_KEY_TESTNET) {
    try {
      // Derive address only (public key — safe to expose)
      const signer = new Wallet(process.env.ARC_PRIVATE_KEY_TESTNET);
      arcWallet.address = signer.address;

      const provider = getArcProvider();
      if (provider) {
        // Arc native gas token = USDC, EVM-level precision = 18 decimals
        // formatEther is correct here (18 dec at native level per Arc docs)
        const [balanceWei, network] = await Promise.all([
          provider.getBalance(signer.address),
          provider.getNetwork(),
        ]);
        arcWallet.balance = formatEther(balanceWei);
        arcWallet.hasBalance = balanceWei > 0n;
        arcWallet.chainId = network.chainId.toString();
        arcWallet.rpcStatus = "connected";
      }
    } catch (err) {
      arcWallet.rpcStatus = "error";
      arcWallet.rpcError =
        err instanceof Error ? err.message : String(err);
    }
  }

  // ── Circle developer wallets ────────────────────────────────────────────────
  type CircleWallet = {
    id: string;
    address: string;
    blockchain: string;
    state: string;
    walletSetId: string;
    custodyType: string;
    accountType?: string;
    updateDate?: string;
    createDate?: string;
  };

  let circleWallets: CircleWallet[] = [];
  let circleError: string | null = null;
  const circleApiBase = getCircleApiBase();

  if (circleConfig.status === "configured") {
    try {
      const apiKey = process.env.CIRCLE_API_KEY!;
      const walletSetId = process.env.CIRCLE_WALLET_SET_ID!;
      const endpoint = `${circleApiBase}/v1/w3s/wallets?walletSetId=${encodeURIComponent(walletSetId)}&pageSize=20`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          data?: { wallets?: CircleWallet[] };
        };
        circleWallets = data?.data?.wallets ?? [];
      } else {
        const errText = await res.text();
        circleError = `Circle API ${res.status}: ${errText.slice(0, 300)}`;
      }
    } catch (err) {
      circleError =
        err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    arcWallet,
    circle: {
      configured: circleConfig.status === "configured",
      missing: circleConfig.missing,
      walletSetId: process.env.CIRCLE_WALLET_SET_ID ?? null,
      env: process.env.NEXT_PUBLIC_CIRCLE_ENV ?? "sandbox",
      apiBase: circleApiBase,
      wallets: circleWallets,
      error: circleError,
    },
    // Real Arc infrastructure URLs (from Arc official docs)
    explorerBase:
      process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://testnet.arcscan.app",
    faucetUrl: "https://faucet.circle.com",
    arcUsdcContract: ARC_USDC_CONTRACT,
    marketRegistryAddress: arcConfig.marketRegistryAddress ?? null,
    receiptRegistryAddress: arcConfig.receiptRegistryAddress ?? null,
  });
}
