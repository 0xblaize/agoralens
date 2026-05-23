"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Gavel, Scale } from "lucide-react";
import type { ArcDataState, ArcMarket } from "@/src/lib/arc/types";
import type { SignalDataState, PublicSignal } from "@/src/lib/signals/types";

type AuditResult = {
  bullArgument: string;
  bearArgument: string;
  judgeSummary: string;
  integrityScore: number;
  agentProbability: number;
  marketProbability: number;
  edgeBps: number;
  riskFlags: string[];
  decision: string;
  reasoningHash: string;
  signalHash: string;
};

type Props = {
  marketsState: ArcDataState<ArcMarket[]>;
  signalsState: SignalDataState;
  preselectedMarketId?: string;
  preselectedSignalId?: string;
};

const AUDIT_STEPS = [
  { label: "Signal Feed" },
  { label: "Bull Analysis" },
  { label: "Bear Rebuttal" },
  { label: "Judge Synthesis" },
  { label: "Final Execution" },
];

export function MarketCourtView({ marketsState, signalsState, preselectedMarketId, preselectedSignalId }: Props) {
  const markets = marketsState.status === "configured" ? marketsState.data : [];
  const signals = signalsState.status === "configured" ? signalsState.signals : [];

  const [selectedMarketId, setSelectedMarketId] = useState(preselectedMarketId ?? markets[0]?.marketId ?? "");
  const [selectedSignalId, setSelectedSignalId] = useState(preselectedSignalId ?? signals[0]?.id ?? "");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const selectedMarket = markets.find((m) => m.marketId === selectedMarketId) ?? markets[0] ?? null;
  const selectedSignal: PublicSignal | undefined = signals.find((s) => s.id === selectedSignalId) ?? signals[0];

  // Animate steps while loading
  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= AUDIT_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [loading]);

  async function runAudit() {
    if (!selectedMarket) return;
    setLoading(true);
    setError(null);
    setAudit(null);
    try {
      const res = await fetch("/api/marketcourt/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: selectedMarket.marketId,
          agentId: "agoralens-agent-v1",
          signal: selectedSignal
            ? {
                id: selectedSignal.id,
                title: selectedSignal.title,
                summary: selectedSignal.summary,
                confidence: selectedSignal.confidence,
                source: selectedSignal.source,
              }
            : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Audit failed");
      }
      const result = await res.json() as AuditResult;
      setAudit(result);
      setStep(AUDIT_STEPS.length - 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const decisionColor =
    audit?.decision === "DEPLOY_TESTNET_ROUTE"
      ? "text-emerald-400"
      : audit?.decision === "WATCHLIST"
      ? "text-amber-400"
      : "text-rose-400";

  return (
    <section id="marketcourt" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[11px] font-bold text-violet-300">
              MarketCourt v4.2
            </span>
            {audit && (
              <span className={`rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold ${decisionColor}`}>
                {audit.decision}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">MarketCourt</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
            <Scale size={14} className="text-violet-400" />
            {selectedMarket
              ? `Auditing: "${selectedMarket.question.slice(0, 60)}${selectedMarket.question.length > 60 ? "…" : ""}"`
              : "Select a market to begin audit"}
          </p>
        </div>

        {audit && (
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Agent Prob.</p>
              <p className="mt-1 text-2xl font-bold text-violet-300">{audit.agentProbability}%</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Integrity</p>
              <p className="mt-1 text-2xl font-bold text-white">{audit.integrityScore}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Edge</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{(audit.edgeBps / 100).toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Market + Signal selectors */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select Market</p>
          {markets.length > 0 ? (
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#13131e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              {markets.map((m) => (
                <option key={m.marketId} value={m.marketId}>
                  {m.question.slice(0, 70)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-zinc-500">
              {marketsState.status === "not-configured"
                ? "Markets not configured — add Arc env vars."
                : "No markets found on Arc registry."}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select Signal</p>
          {signals.length > 0 ? (
            <select
              value={selectedSignalId}
              onChange={(e) => setSelectedSignalId(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#13131e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              {signals.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title.slice(0, 70)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-zinc-500">
              {signalsState.status === "not-configured"
                ? "Add NEWS_API_KEY to load signals."
                : "No signals found."}
            </p>
          )}
        </div>
      </div>

      {/* Three-column agent grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bull */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center gap-3">
            <img src="/agent-bull.png" alt="Bull Agent" className="size-10 rounded-full object-cover ring-2 ring-violet-400/30" />
            <div>
              <h3 className="font-bold text-white">Bull Agent</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Optimistic Outlook</p>
            </div>
          </div>
          <div className="mt-4 min-h-[80px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            {audit ? (
              <p className="text-sm italic leading-6 text-zinc-300">&ldquo;{audit.bullArgument}&rdquo;</p>
            ) : (
              <p className="text-xs text-zinc-600">Waiting for audit to run...</p>
            )}
          </div>
          {audit && (
            <>
              <div className="mt-4">
                <p className="mb-1.5 text-[10px] font-bold text-emerald-400">Conviction Level</p>
                <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${audit.agentProbability}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">{audit.agentProbability}% Match with Signal Source</p>
              </div>
            </>
          )}
        </div>

        {/* Judge */}
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.04] p-5">
          <div className="flex items-center gap-3">
            <img src="/agent-judge.png" alt="Judge Agent" className="size-10 rounded-full object-cover ring-2 ring-violet-400/30" />
            <div>
              <h3 className="font-bold text-white">Judge Agent</h3>
            </div>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold ${loading ? "bg-amber-500/20 text-amber-300" : audit ? "bg-emerald-500/20 text-emerald-300" : "bg-violet-500/20 text-violet-300"}`}>
              {loading ? "Synthesizing" : audit ? "Complete" : "Standby"}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-[#0a0a14] p-3 font-mono text-[11px] leading-6 min-h-[100px]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white">
              {loading ? "● Live Reasoning Log" : audit ? "● Verdict Summary" : "● Awaiting Input"}
            </p>
            {loading && (
              <div className="space-y-0.5 text-zinc-400">
                {AUDIT_STEPS.slice(0, step + 1).map((s, i) => (
                  <p key={s.label} className={i === step ? "text-violet-300" : "text-zinc-600"}>
                    &gt; {s.label}...
                  </p>
                ))}
              </div>
            )}
            {audit && !loading && (
              <p className="text-zinc-300">{audit.judgeSummary}</p>
            )}
            {!audit && !loading && (
              <p className="text-zinc-600">&gt; Select a market and signal, then run the audit.</p>
            )}
          </div>

          {audit && (
            <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-500/[0.08] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Final Verdict</p>
              <h3 className={`mt-2 text-lg font-bold ${decisionColor}`}>
                {audit.decision.replace(/_/g, " ")}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Edge: {(audit.edgeBps / 100).toFixed(2)}% · Integrity: {audit.integrityScore}/100
              </p>
            </div>
          )}

          <button
            onClick={runAudit}
            disabled={loading || !selectedMarket}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(124,58,237,0.35)] transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Gavel size={15} />
            {loading ? "Running Audit..." : audit ? "Re-run Audit" : "Run MarketCourt Audit"}
          </button>

          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </div>

        {/* Bear */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center gap-3">
            <img src="/agent-bear.png" alt="Bear Agent" className="size-10 rounded-full object-cover ring-2 ring-rose-400/30" />
            <div>
              <h3 className="font-bold text-white">Bear Agent</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Risk Scepticism</p>
            </div>
          </div>
          <div className="mt-4 min-h-[80px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            {audit ? (
              <p className="text-sm italic leading-6 text-zinc-300">&ldquo;{audit.bearArgument}&rdquo;</p>
            ) : (
              <p className="text-xs text-zinc-600">Waiting for audit to run...</p>
            )}
          </div>
          {audit && audit.riskFlags.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Risk Flags</p>
              <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                {audit.riskFlags.map((flag) => (
                  <div key={flag} className="border-b border-white/[0.05] px-3 py-2 text-xs text-rose-300 last:border-0">
                    ⚠ {flag}
                  </div>
                ))}
              </div>
            </div>
          )}
          {audit && audit.riskFlags.length === 0 && (
            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3">
              <p className="text-xs text-emerald-400">✓ No risk flags detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Audit progress + CTA */}
      {audit && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-zinc-400">Audit Progress</p>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Complete</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {AUDIT_STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex size-7 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-400">
                    <CheckCircle2 size={14} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-400">{s.label}</p>
                </div>
                {i < AUDIT_STEPS.length - 1 && <div className="mb-4 h-px w-8 bg-emerald-400/30" />}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-white/[0.08] font-mono">
              {audit.reasoningHash.slice(0, 18)}...
            </button>
            <Link
              href={`/execution?marketId=${selectedMarketId}&agentProb=${audit.agentProbability}&marketProb=${audit.marketProbability}&edgeBps=${audit.edgeBps}&integrity=${audit.integrityScore}&decision=${audit.decision}&reasoningHash=${audit.reasoningHash}&signalHash=${audit.signalHash}`}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-2.5 text-xs font-bold text-white shadow-[0_6px_20px_rgba(124,58,237,0.35)] transition hover:scale-[1.01]"
            >
              Finalize Verdict &amp; Proceed <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
