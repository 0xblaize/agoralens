import Link from "next/link";
import { Gavel, Landmark, Radar, Settings, Zap } from "lucide-react";
import { getArcMarkets } from "@/src/lib/arc/market-registry";
import { getArcReceipts } from "@/src/lib/arc/receipt-registry";
import { getSafeArcStatus } from "@/src/lib/arc/config";
import { getExternalMarkets } from "@/src/lib/markets";
import { getPublicSignals } from "@/src/lib/signals";
import { ExecutionView } from "@/src/features/execution/ExecutionView";
import { LedgerView } from "@/src/features/ledger/LedgerView";
import { MarketCourtView } from "@/src/features/marketcourt/MarketCourtView";
import { RadarView } from "@/src/features/radar/RadarView";
import { BrandLogo } from "./brand-logo";
import { AgentAccountPanel } from "./agent-account-panel";

const tabs = [
  { label: "Radar", href: "#radar", icon: Radar },
  { label: "Courtroom", href: "#marketcourt", icon: Gavel },
  { label: "Execution", href: "#execution", icon: Zap },
  { label: "Ledger", href: "#ledger", icon: Landmark },
];

export async function DashboardShell() {
  const [arcMarketsState, externalMarketsState, signalsState, receiptsState] = await Promise.all([
    getArcMarkets(),
    getExternalMarkets(),
    getPublicSignals(),
    getArcReceipts(),
  ]);
  const receiptCount = receiptsState.status === "configured" ? receiptsState.data.length : 0;
  const arcStatus = getSafeArcStatus();

  return (
    <main className="isolate min-h-screen overflow-x-hidden bg-[#15151d] pb-28 text-white md:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#161620] md:bg-[#161620]/90 md:backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-8">
            <BrandLogo />
            <nav className="hidden items-center gap-2 md:flex">
              {tabs.map((tab) => (
                <Link key={tab.href} href={tab.href} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 hover:text-violet-200">
                  <tab.icon size={16} />
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <AgentAccountPanel />
            <Settings className="text-zinc-300" />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1440px] space-y-10 overflow-x-hidden px-5 py-8 md:px-8 md:py-12">
        <RadarView
          arcMarketsState={arcMarketsState}
          externalMarketsState={externalMarketsState}
          signalsState={signalsState}
          receiptCount={receiptCount}
          arcStatus={arcStatus}
        />
        <MarketCourtView marketsState={arcMarketsState} signalsState={signalsState} />
        <ExecutionView />
        <LedgerView receiptsState={receiptsState} marketsState={arcMarketsState} />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-white/10 bg-[#15151d] px-3 py-3 md:hidden">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1 text-xs font-medium text-zinc-400">
            <tab.icon size={22} />
            {tab.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
