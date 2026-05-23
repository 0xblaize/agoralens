import { NextResponse } from "next/server";
import { getArcMarkets } from "@/src/lib/arc/market-registry";

// Server-side read — ARC_RPC_URL stays on the server, never reaches browser.
export async function GET() {
  const state = await getArcMarkets();
  return NextResponse.json(state);
}
