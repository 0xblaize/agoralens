"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BarChart3, Layers, Shield, Zap } from "lucide-react";

export function ExecutionView() {
  const params = useSearchParams();

  // Read real audit data passed from MarketCourt via URL params
  const marketId = params.get("marketId") ?? "";
  const agentProb = Number(params.get("agentProb") ?? 0);
  const marketProb = Number(params.get("marketProb") ?? 0);
  const edgeBps = Number(params.get("edgeBps") ?? 0);
  const integrity = Number(params.get("integrity") ?? 0);
  const decision = params.get("decision") ?? "";
  const reasoningHash = params.get("reasoningHash") ?? "";
  const signalHash = params.get("signalHash") ?? "";

  const hasAuditData = !!decision;
  const edgePct = (edgeBps / 100).toFixed(2);
  const suggestedUsdc = edgeBps > 0 ? (edgeBps / 100).toFixed(2) : "0.00";

  const [deploying, setDeploying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  async function deployLiquidity() {
    setDeploying(true);
    setDeployError(null);
    try {
      const res = await fetch("/api/execution/write-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "agoralens-agent-v1",
          marketId,
          signalHash,
          reasoningHash,
          integrityScore: integrity,
          agentProbability: agentProb,
          marketProbability: marketProb,
          edgeBps,
          suggestedUsdcAmount: suggestedUsdc,
          decision,
        }),
      });
      const body = await res.json() as { txHash?: string; error?: string; missing?: string[] };
      if (!res.ok) throw new Error(body.error ?? "Receipt write failed");
      setTxHash(body.txHash ?? "submitted");
    } catch (e) {
      setDeployError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeploying(false);
    }
  }

  return (
    <section id="execution" className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Execution</h1>
        <p className="mt-1 text-sm text-zinc-400">Deploy liquidity via Arc gasless route</p>
      </div>

      {!hasAuditData ? (
        /* ── No audit data — point user back to MarketCourt ── */
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-violet-400/20 bg-violet-500/[0.03] py-20 text-center">
          <Shield size={32} className="text-violet-400/50" />
          <p className="font-semibold text-white">No Audit Data</p>
          <p className="max-w-xs text-sm text-zinc-500">
            Run a MarketCourt audit first. The verdict will be passed here automatically.
          </p>
          <a
            href="/marketcourt"
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
          >
            Go to MarketCourt →
          </a>
        </div>
      ) : (
        <>
          {/* Market Probabilities */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-400" />
                <h2 className="font-bold text-white">Market Probabilities</h2>
              </div>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                From Audit
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Agent Audit Prediction</span>
                  <span className="text-2xl font-bold text-violet-300">{agentProb}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
                    style={{ width: `${agentProb}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Market Implied Odds</span>
                  <span className="text-2xl font-bold text-cyan-300">{marketProb}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-700"
                    style={{ width: `${marketProb}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Delta Confidence</p>
                  <p className="mt-0.5 font-bold text-white">
                    {edgeBps > 0 ? `Strong Signal (+${edgePct}%)` : `Weak Signal (${edgePct}%)`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edge + Suggested */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-violet-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">The Edge</p>
              </div>
              <p className="mt-3 text-4xl font-bold text-white">{edgePct}%</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">Alpha detected vs. market probability</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-violet-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Suggested</p>
              </div>
              <p className="mt-3 text-4xl font-bold text-white">{suggestedUsdc}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">USDC Risk-Adjusted Allocation</p>
            </div>
          </div>

          {/* Execution Routing */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-violet-400" />
              <h2 className="font-bold text-white">Execution Routing</h2>
              <span className="ml-auto font-mono text-[10px] text-zinc-600">Market #{marketId.slice(0, 12)}...</span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                  <Layers size={20} className="text-zinc-300" />
                </div>
                <p className="text-[10px] font-semibold text-zinc-400">Portfolio</p>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
                <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-0.5 text-[11px] font-bold text-violet-300">
                  Arc Protocol
                </span>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10">
                  <BarChart3 size={20} className="text-violet-400" />
                </div>
                <p className="text-[10px] font-semibold text-violet-400">Market</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">Account Abstraction</span>
              </div>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">L2 Gasless Enabled</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Slippage", value: "~0.05%" },
                { label: "Liquidity", value: "Testnet" },
                { label: "Speed", value: "~2.4s" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</p>
                  <p className="mt-1 text-sm font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-zinc-400">Total Deployment Value</p>
              <p className="text-xl font-bold text-white">
                {suggestedUsdc} <span className="text-sm text-zinc-400">USDC</span>
              </p>
            </div>
          </div>

          {/* Deploy CTA */}
          {txHash ? (
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-5 text-center">
              <p className="font-bold text-emerald-400">✓ Receipt Written to Arc Testnet</p>
              <p className="mt-1 font-mono text-xs text-zinc-400">TX: {txHash}</p>
              <a href="/ledger" className="mt-4 inline-block rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/[0.08]">
                View in Ledger →
              </a>
            </div>
          ) : (
            <button
              onClick={deployLiquidity}
              disabled={deploying}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 py-4 text-base font-bold text-white shadow-[0_10px_30px_rgba(124,58,237,0.4)] transition hover:scale-[1.01] disabled:opacity-60"
            >
              {deploying ? "Writing Receipt..." : "Deploy Liquidity"} <Zap size={18} />
            </button>
          )}

          {deployError && (
            <p className="rounded-xl border border-rose-400/25 bg-rose-500/[0.06] px-4 py-3 text-xs text-rose-400">
              {deployError}
            </p>
          )}
        </>
      )}
    </section>
  );
}
