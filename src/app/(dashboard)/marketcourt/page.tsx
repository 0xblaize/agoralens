import { getArcMarkets } from "@/src/lib/arc/market-registry";
import { getPublicSignals } from "@/src/lib/signals";
import { MarketCourtView } from "@/src/features/marketcourt/MarketCourtView";

export default async function MarketCourtPage({
  searchParams,
}: {
  searchParams: Promise<{ marketId?: string; signalId?: string }>;
}) {
  const { marketId, signalId } = await searchParams;
  const [marketsState, signalsState] = await Promise.all([
    getArcMarkets(),
    getPublicSignals(),
  ]);

  return (
    <MarketCourtView
      marketsState={marketsState}
      signalsState={signalsState}
      preselectedMarketId={marketId}
      preselectedSignalId={signalId}
    />
  );
}
