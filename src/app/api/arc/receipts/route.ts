import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getArcReceipts } from "@/src/lib/arc/receipt-registry";

// Server-side read — ARC_RPC_URL stays on the server, never reaches browser.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId") ?? undefined;
  const state = await getArcReceipts(agentId);
  return NextResponse.json(state);
}
