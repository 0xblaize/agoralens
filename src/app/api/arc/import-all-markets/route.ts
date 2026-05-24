import { NextResponse } from "next/server";
import { getExternalMarkets } from "@/src/lib/markets";
import type { ExternalMarket } from "@/src/lib/markets/types";

/**
 * POST /api/arc/import-all-markets
 *
 * Bulk imports all available external markets into Arc testnet.
 * Sequentially imports each market, returning results for each.
 */

export async function POST() {
  try {
    // Fetch all external markets
    const externalMarketsState = await getExternalMarkets();

    if (externalMarketsState.status !== "configured") {
      return NextResponse.json(
        { error: "External markets not available", state: externalMarketsState },
        { status: 400 },
      );
    }

    const markets = externalMarketsState.markets;
    if (!markets || markets.length === 0) {
      return NextResponse.json(
        { error: "No external markets to import", imported: [], failed: [] },
        { status: 400 },
      );
    }

    const results = {
      imported: [] as Array<{ market: ExternalMarket; marketId: string; txHash: string }>,
      failed: [] as Array<{ market: ExternalMarket; error: string }>,
    };

    // Import sequentially to avoid overloading the network
    for (const market of markets) {
      try {
        const importResponse = await fetch("http://localhost:3000/api/arc/import-market", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(market),
        });

        const importBody = (await importResponse.json()) as {
          marketId?: string | null;
          txHash?: string;
          error?: string;
          detail?: string;
        };

        if (!importResponse.ok || !importBody.marketId) {
          results.failed.push({
            market,
            error: importBody.error || `Import failed with status ${importResponse.status}`,
          });
          continue;
        }

        results.imported.push({
          market,
          marketId: importBody.marketId,
          txHash: importBody.txHash || "",
        });
      } catch (error) {
        results.failed.push({
          market,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Small delay between imports to avoid throttling
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json(results);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[import-all-markets] Error:", detail);

    return NextResponse.json(
      { error: "Bulk import failed", detail },
      { status: 500 },
    );
  }
}
