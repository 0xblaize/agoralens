"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { ExternalMarket, ExternalMarketState } from "@/src/lib/markets/types";
import type { SignalDataState } from "@/src/lib/signals/types";

type RadarViewProps = {
  arcMarketsState: ArcDataState<ArcMarket[]>;
  externalMarketsState: ExternalMarketState;
  signalsState: SignalDataState;
  receiptCount: number;
};

const FILTERS = ["All", "Macro", "Technology", "Crypto", "Politics"];

export function RadarView({
  arcMarketsState,
  externalMarketsState,
  signalsState,
  receiptCount,
}: RadarViewProps) {
  const router = useRouter();
  const signals = signalsState.status === "configured" ? signalsState.signals : [];
  const arcMarkets = arcMarketsState.status === "configured" ? arcMarketsState.data : [];
  const externalMarkets =
    externalMarketsState.status === "configured" ? externalMarketsState.markets : [];

  const [filter, setFilter] = useState("All");
  const [activeSignalId, setActiveSignalId] = useState<string | null>(signals[0]?.id ?? null);
  const [importingMarketId, setImportingMarketId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const filteredSignals =
    filter === "All"
      ? signals
      : signals.filter((signal) =>
          signal.category.toLowerCase().includes(filter.toLowerCase()),
        );

  const activeSignal = signals.find((signal) => signal.id === activeSignalId) ?? signals[0] ?? null;
  const featuredMarket = externalMarkets[0] ?? null;

  const statCards = [
    {
      icon: Activity,
      label: "Signals Loaded",
      value: signals.length > 0 ? String(signals.length) : "-",
      badge:
        signalsState.status === "configured"
          ? signalsState.provider
          : signalsState.status === "error"
            ? "Unavailable"
            : "No key needed",
      badgeCls:
        signalsState.status === "configured"
          ? signalsState.provider === "Cached"
            ? "text-amber-300 bg-amber-400/10"
            : "text-emerald-400 bg-emerald-400/10"
          : "text-rose-300 bg-rose-400/10",
    },
    {
      icon: RadioTower,
      label: "Live Markets",
      value: externalMarkets.length > 0 ? String(externalMarkets.length) : "-",
      badge: externalMarketsState.status === "configured" ? "Polymarket" : "Unavailable",
      badgeCls:
        externalMarketsState.status === "configured"
          ? "text-cyan-300 bg-cyan-400/10"
          : "text-amber-300 bg-amber-400/10",
    },
    {
      icon: ShieldCheck,
      label: "Imported to Arc",
      value: arcMarkets.length > 0 ? String(arcMarkets.length) : "-",
      badge: arcMarketsState.status === "configured" ? "Testnet" : "Config needed",
      badgeCls:
        arcMarketsState.status === "configured"
          ? "text-violet-300 bg-violet-400/10"
          : "text-amber-300 bg-amber-400/10",
    },
    {
      icon: BarChart2,
      label: "Receipts Written",
      value: receiptCount > 0 ? String(receiptCount) : "-",
      badge: "Arc",
      badgeCls: "text-zinc-300 bg-white/10",
    },
  ];

  async function importToArc(market: ExternalMarket) {
    setImportingMarketId(market.externalMarketId);
    setImportError(null);

    try {
      const response = await fetch("/api/arc/import-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(market),
      });
      const body = (await response.json()) as {
        marketId?: string | null;
        error?: string;
        detail?: string;
        missing?: string[];
      };

      if (!response.ok || !body.marketId) {
        // Show both the top-level error and the detail so the root cause is visible
        const detail = body.detail ? ` - ${body.detail}` : "";
        const missing = body.missing?.length ? ` (missing: ${body.missing.join(", ")})` : "";
        throw new Error(
          (body.error ?? "Could not import market to Arc testnet") + detail + missing,
        );
      }

      router.push(`/marketcourt?marketId=${body.marketId}${activeSignal ? `&signalId=${activeSignal.id}` : ""}`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not import market to Arc testnet");
    } finally {
      setImportingMarketId(null);
    }
  }

  return (
    <section id="radar" className="space-y-6">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/25">
          <RadioTower size={22} />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Radar Discovery
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Live market source &gt; Arc testnet import &gt; MarketCourt audit
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <SourceBadge
          label="Signals"
          value={
            signalsState.status === "configured"
              ? signalsState.provider === "Cached"
                ? "Last successful live signals"
                : `Live · ${signalsState.provider}`
              : signalsState.status === "error"
                ? "Providers unavailable"
                : "No key needed"
          }
          ok={signalsState.status === "configured"}
        />
        <SourceBadge
          label="Markets"
          value={
            externalMarketsState.status === "configured"
              ? "Polymarket"
              : externalMarketsState.status === "error"
                ? "Unavailable"
                : "Not configured"
          }
          ok={externalMarketsState.status === "configured"}
        />
        <SourceBadge
          label="Arc registry"
          value={arcMarketsState.status === "configured" ? `${arcMarkets.length} imported` : "Not configured"}
          ok={arcMarketsState.status === "configured"}
        />
      </div>

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
              <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                <p className="text-xl font-bold text-white">{card.value}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${card.badgeCls}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400">
          <Search size={15} className="shrink-0" />
          <span className="truncate">Search signals, sources, or markets...</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === item
                  ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
              <TrendingUp size={13} className="text-violet-400" />
              Live Signals Feed
            </div>
            {signalsState.status === "configured" && (
              <span className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-violet-400">
                {signalsState.provider === "Cached" ? "Cached" : "Live"}
              </span>
            )}
          </div>

          {signalsState.status === "configured" && filteredSignals.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
              {filteredSignals.map((signal) => {
                const isActive = activeSignalId === signal.id;
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
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-bold text-violet-300">
                          {signal.category}
                        </span>
                        <span className="truncate text-[11px] text-zinc-500">
                          {formatTimeAgo(signal.publishedAt)}
                        </span>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-zinc-400">
                        Confidence: <span className="text-violet-300">{signal.confidence}%</span>
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
              title={
                signalsState.status === "error"
                  ? "Live signal providers unavailable"
                  : "No signals loaded"
              }
              body={
                signalsState.status === "error"
                  ? "Live signal providers unavailable. Try again later."
                  : "No matching public signals were returned."
              }
            />
          )}
        </div>

        <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            <ShieldCheck size={12} className="text-violet-400" />
            Live Market Import
          </div>

          {featuredMarket ? (
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Polymarket read-only source
              </p>
              <h2 className="mt-2 text-lg font-bold leading-snug text-white">
                {featuredMarket.question}
              </h2>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  featuredMarket.category || "Prediction Market",
                  `Platform: ${featuredMarket.platform}`,
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
                <Metric label="Implied prob." value={featuredMarket.impliedProbability ? `${featuredMarket.impliedProbability}%` : "-"} />
                <Metric label="Liquidity" value={formatUsd(featuredMarket.liquidity)} accent="cyan" />
                <Metric label="Volume" value={formatUsd(featuredMarket.volume)} />
                <Metric label="External ID" value={shorten(featuredMarket.externalMarketId)} mono />
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-5 text-zinc-400">
                <p>Resolution source: {featuredMarket.resolutionSource}</p>
                <p>
                  Metadata hash:{" "}
                  <span className="font-mono text-zinc-300">{shorten(featuredMarket.metadataHash)}</span>
                </p>
                <Link
                  href={featuredMarket.marketUrl}
                  target="_blank"
                  className="inline-flex font-bold text-violet-300 hover:text-violet-200"
                >
                  View source market &gt;
                </Link>
              </div>

              <div className="mt-auto pt-5">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Status</span>
                  <span className="font-bold text-emerald-400">Ready to import to Arc testnet</span>
                </div>
                <button
                  type="button"
                  onClick={() => importToArc(featuredMarket)}
                  disabled={importingMarketId === featuredMarket.externalMarketId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {importingMarketId === featuredMarket.externalMarketId
                    ? "Importing to Arc..."
                    : "Import to Arc and Send to MarketCourt >"}
                </button>
                {importError && (
                  <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.07] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Import Failed</p>
                    <p className="mt-1.5 break-words text-[11px] leading-5 text-rose-300">{importError}</p>
                    <a
                      href="/api/arc/status"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-400/60 hover:text-rose-300"
                    >
                      Check Arc testnet status -&gt;
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<BarChart2 size={28} className="text-violet-400/50" />}
              title={
                externalMarketsState.status === "error"
                  ? "Could not load external markets"
                  : externalMarketsState.status === "not-configured"
                    ? "Live market source not configured"
                    : "No live external markets"
              }
              body={
                externalMarketsState.status === "error"
                  ? externalMarketsState.detail ?? externalMarketsState.message
                  : externalMarketsState.message
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: "cyan";
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p
        className={`mt-1 truncate text-xl font-bold ${accent === "cyan" ? "text-cyan-300" : "text-white"} ${
          mono ? "font-mono text-sm" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-10 text-center">
      {icon}
      <p className="font-semibold text-white">{title}</p>
      <p className="max-w-xs text-xs leading-5 text-zinc-500">{body}</p>
    </div>
  );
}

function SourceBadge({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
        ok
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-amber-400/20 bg-amber-400/10 text-amber-200"
      }`}
    >
      {label}: {value}
    </span>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDeadline(timestamp: string): string {
  const n = Number(timestamp);
  if (!n) return "TBD";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(n * 1000),
  );
}

function formatUsd(value: number): string {
  if (!value) return "-";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
  }).format(value);
}

function shorten(value: string): string {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}
