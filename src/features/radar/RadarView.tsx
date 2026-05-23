"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  BarChart2,
  Globe,
  RadioTower,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { ArcDataState, ArcMarket } from "@/src/lib/arc/types";
import type { PublicSignal, SignalDataState } from "@/src/lib/signals/types";

type RadarViewProps = {
  marketsState: ArcDataState<ArcMarket[]>;
  signalsState: SignalDataState;
  receiptCount: number;
};

const FILTERS = ["All", "Macro", "Technology", "Crypto", "Politics"];

export function RadarView({ marketsState, signalsState, receiptCount }: RadarViewProps) {
  const signals = signalsState.status === "configured" ? signalsState.signals : [];
  const markets = marketsState.status === "configured" ? marketsState.data : [];
  const openMarkets = markets.filter((m) => m.status === "OPEN");

  const [filter, setFilter] = useState("All");
  const [activeSignalId, setActiveSignalId] = useState<string | null>(signals[0]?.id ?? null);

  const filtered =
    filter === "All"
      ? signals
      : signals.filter((s) =>
          s.category.toLowerCase().includes(filter.toLowerCase()),
        );

  const activeSignal = signals.find((s) => s.id === activeSignalId) ?? signals[0] ?? null;
  // Pick the best matching market for the selected signal
  const featuredMarket = openMarkets[0] ?? null;

  const statCards = [
    {
      icon: Activity,
      label: "Global Pulse",
      value: signalsState.status === "configured" ? "Live" : "—",
      badge: signalsState.status === "configured" ? `${signals.length} signals` : null,
      badgeCls: "text-emerald-400 bg-emerald-400/10",
    },
    {
      icon: RadioTower,
      label: "Active Signals",
      value: signals.length > 0 ? String(signals.length) : "—",
      badge: null,
      badgeCls: "",
    },
    {
      icon: ShieldCheck,
      label: "AI Reliability",
      value: signals.length > 0
        ? `${Math.round(signals.reduce((a, s) => a + s.confidence, 0) / signals.length)}%`
        : "—",
      badge: signals.length > 0 ? "Live" : null,
      badgeCls: "text-violet-300 bg-violet-400/10",
    },
    {
      icon: BarChart2,
      label: "Open Markets",
      value: openMarkets.length > 0 ? String(openMarkets.length) : "—",
      badge: null,
      badgeCls: "",
    },
  ];

  return (
    <section id="radar" className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/25">
          <RadioTower size={22} />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Radar Discovery
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Real-world signals → matched markets
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <card.icon size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                {card.label}
              </p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <p className="text-xl font-bold text-white">{card.value}</p>
                {card.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${card.badgeCls}`}>
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 sm:w-72">
          <Search size={15} className="shrink-0" />
          <span>Search signals, sources, or markets...</span>
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === f
                  ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Live Signals Feed */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
              <TrendingUp size={13} className="text-violet-400" />
              Live Signals Feed
            </div>
            {signalsState.status === "configured" && (
              <span className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-violet-400">
                ● Updating
              </span>
            )}
          </div>

          {signalsState.status === "configured" && filtered.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
              {filtered.map((signal) => {
                const isActive = activeSignalId === signal.id;
                const timeAgo = formatTimeAgo(signal.timestamp);
                return (
                  <button
                    key={signal.id}
                    onClick={() => setActiveSignalId(signal.id)}
                    className={`w-full px-5 py-4 text-left transition ${
                      isActive
                        ? "border-l-2 border-violet-400 bg-violet-500/[0.06]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-bold text-violet-300">
                          {signal.category}
                        </span>
                        <span className="text-[11px] text-zinc-500">{timeAgo}</span>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-400">
                        CONFIDENCE{" "}
                        <span className={signal.confidence >= 80 ? "text-violet-300" : "text-zinc-300"}>
                          {signal.confidence}%
                        </span>
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-snug text-white">
                      {signal.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <Globe size={11} />
                      {signal.source}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<RadioTower size={28} className="text-violet-400/50" />}
              title={signalsState.status === "not-configured" ? "Signal source not configured" : "No signals yet"}
              body={
                signalsState.status === "not-configured"
                  ? `Add ${(signalsState as { missing: string[] }).missing?.join(", ")} to your environment to load live signals.`
                  : "No matching signals found."
              }
            />
          )}
        </div>

        {/* Right: Intelligence Report */}
        <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            <ShieldCheck size={12} className="text-violet-400" />
            Intelligence Report
          </div>

          {featuredMarket ? (
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Matched Market Opportunity
              </p>
              <h2 className="mt-2 text-lg font-bold leading-snug text-white">
                {featuredMarket.question}
              </h2>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  featuredMarket.category || "Market",
                  `Liquidity: ${Number(featuredMarket.liquidityHint) > 0 ? "Available" : "Unknown"}`,
                  `Deadline: ${formatDeadline(featuredMarket.deadline)}`,
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Signal Confidence
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {activeSignal ? `${activeSignal.confidence}%` : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Market Status
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">
                    {featuredMarket.status}
                  </p>
                </div>
              </div>

              {activeSignal && (
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-5 text-zinc-400">
                  {activeSignal.summary}
                </div>
              )}

              <div className="mt-auto pt-5">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Status</span>
                  <span className="font-bold text-emerald-400">Ready for MarketCourt Audit</span>
                </div>
                <Link
                  href={`/marketcourt?marketId=${featuredMarket.marketId}${activeSignal ? `&signalId=${activeSignal.id}` : ""}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35)] transition hover:scale-[1.01]"
                >
                  Send to MarketCourt →
                </Link>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Search size={12} />
                  <span>{openMarkets.length} open market{openMarkets.length !== 1 ? "s" : ""} available</span>
                </div>
                <Link href="/marketcourt" className="font-bold text-violet-400 hover:text-violet-300">
                  View All →
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<BarChart2 size={28} className="text-violet-400/50" />}
              title={marketsState.status === "not-configured" ? "Markets not configured" : "No open markets"}
              body={
                marketsState.status === "not-configured"
                  ? "Configure your Arc subgraph or RPC to load live markets."
                  : "No open markets found on the Arc registry."
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      {icon}
      <p className="font-semibold text-white">{title}</p>
      <p className="max-w-xs text-xs leading-5 text-zinc-500">{body}</p>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDeadline(timestamp: string): string {
  const n = Number(timestamp);
  if (!n) return "TBD";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
    new Date(n * 1000),
  );
}
