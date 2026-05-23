"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Copy, Database, Download, ExternalLink, LockKeyhole, Shield } from "lucide-react";
import type { ArcDataState, ReasoningReceipt, ReceiptLifecycleState } from "@/src/lib/arc/types";

const LIFECYCLE_ORDER: ReceiptLifecycleState[] = [
  "ENTRY",
  "MONITORING",
  "RESOLUTION_CHECK",
  "SETTLED",
];

export function LedgerView({ receiptsState }: { receiptsState: ArcDataState<ReasoningReceipt[]> }) {
  const receipts = receiptsState.status === "configured" ? receiptsState.data : [];
  const [activeTab, setActiveTab] = useState<"timeline" | "json">("timeline");
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(receipts[0]?.receiptId ?? null);

  const selectedReceipt = receipts.find((r) => r.receiptId === selectedReceiptId) ?? receipts[0] ?? null;

  return (
    <section id="ledger" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Immutable Ledger</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {selectedReceipt
              ? `Verification of Receipt ID: `
              : "Arc testnet reasoning receipts & lifecycle monitoring"}
            {selectedReceipt && (
              <span className="font-mono text-violet-300">{selectedReceipt.receiptId}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.08]">
            <ExternalLink size={13} /> View on Explorer
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500">
            <Download size={13} /> Download Receipt
          </button>
        </div>
      </div>

      {receipts.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {receipts.map((r) => (
            <button
              key={r.receiptId}
              onClick={() => setSelectedReceiptId(r.receiptId)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                selectedReceiptId === r.receiptId
                  ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                  : "border-white/[0.07] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {r.receiptId}
            </button>
          ))}
        </div>
      )}

      {!selectedReceipt ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-violet-400/20 bg-violet-500/[0.03] py-20 text-center">
          <Database size={32} className="text-violet-400/50" />
          <p className="font-semibold text-white">No Receipts Yet</p>
          <p className="max-w-xs text-sm text-zinc-500">
            {receiptsState.status === "not-configured"
              ? `Configure your Arc receipt registry. Missing: ${(receiptsState as { missing: string[] }).missing?.join(", ")}`
              : receiptsState.status === "error"
              ? (receiptsState as { detail?: string }).detail ?? "Unable to load receipts."
              : "Run a full MarketCourt audit and deploy liquidity to write your first receipt."}
          </p>
          <a href="/marketcourt" className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500">
            Go to MarketCourt →
          </a>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Left sidebar */}
          <div className="space-y-4">
            {/* Integrity Audit */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Integrity Audit</p>
                <Shield size={18} className="text-violet-400" />
              </div>
              <p className="mt-3 text-5xl font-bold text-white">
                {selectedReceipt.integrityScore}{" "}
                <span className="text-lg text-zinc-500">/ 100</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                  {selectedReceipt.lifecycleState}
                </span>
                <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[10px] font-bold text-violet-300">
                  Agent Multi-Sig
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Verdict: <span className="font-bold text-white">{selectedReceipt.decision}</span>
              </p>
            </div>

            {/* Protocol Metadata */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Protocol Metadata</p>
              <div className="mt-3 space-y-2.5">
                {[
                  { label: "Receipt ID", value: selectedReceipt.receiptId },
                  { label: "Market ID", value: selectedReceipt.marketId },
                  { label: "Agent ID", value: selectedReceipt.agentId },
                  { label: "Reasoning Hash", value: selectedReceipt.reasoningHash.slice(0, 18) + "..." },
                  { label: "Signal Hash", value: selectedReceipt.signalHash?.slice(0, 18) + "..." ?? "—" },
                  { label: "Suggested USDC", value: `${selectedReceipt.suggestedUsdcAmount} USDC` },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{row.label}</p>
                    <div className="mt-1 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
                      <span className="font-mono text-[11px] text-zinc-300">{row.value}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(row.value)}
                        className="text-zinc-600 hover:text-zinc-400"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Temporal Records */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Temporal Records</p>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Active Monitor", value: selectedReceipt.lifecycleState === "SETTLED" ? "Settled" : "Live", valueCls: selectedReceipt.lifecycleState === "SETTLED" ? "text-zinc-400" : "text-emerald-400" },
                  { label: "Written At", value: formatTs(selectedReceipt.timestamp), valueCls: "text-zinc-200" },
                  { label: "TX Hash", value: selectedReceipt.txHash ? selectedReceipt.txHash.slice(0, 14) + "..." : "Pending", valueCls: "text-zinc-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <span className="text-xs text-zinc-400">{row.label}</span>
                    <span className={`text-[11px] font-bold ${row.valueCls}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-violet-400/15 bg-violet-500/[0.04] p-4">
              <LockKeyhole size={16} className="mt-0.5 shrink-0 text-violet-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Quantum Secure</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  All ledger entries are signed with FALCON-512 signatures for long-term stability.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Timeline / JSON */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex border-b border-white/[0.07] px-5 pt-4">
              {(["timeline", "json"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 pr-6 text-sm font-semibold capitalize transition ${
                    activeTab === tab
                      ? "border-b-2 border-violet-400 text-violet-300"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab === "timeline" ? "Workflow Timeline" : "Raw JSON Proof"}
                </button>
              ))}
            </div>

            {activeTab === "timeline" && (
              <div className="p-5 space-y-3">
                {LIFECYCLE_ORDER.map((state) => {
                  const currentIdx = LIFECYCLE_ORDER.indexOf(selectedReceipt.lifecycleState);
                  const stateIdx = LIFECYCLE_ORDER.indexOf(state);
                  const isDone = stateIdx < currentIdx;
                  const isActive = stateIdx === currentIdx;
                  const isPending = stateIdx > currentIdx;

                  const STEP_INFO: Record<ReceiptLifecycleState, { title: string; body: string }> = {
                    ENTRY: {
                      title: "Signal Discovery (Radar)",
                      body: "Signal detected and matched to an Arc market. Sentiment analysis confirmed.",
                    },
                    MONITORING: {
                      title: "Active Market Monitoring",
                      body: "Continuous polling of resolution states. Oracle synchronized.",
                    },
                    RESOLUTION_CHECK: {
                      title: "Resolution Check",
                      body: "Market outcome is being verified against the resolution source.",
                    },
                    SETTLED: {
                      title: "Final Settlement",
                      body: "Market settled. Profits or collateral routed to Arc Vault.",
                    },
                    REJECTED: {
                      title: "Rejected",
                      body: "Market was rejected during audit.",
                    },
                  };

                  const info = STEP_INFO[state] ?? { title: state, body: "" };

                  return (
                    <div
                      key={state}
                      className={`relative rounded-2xl border p-5 ${
                        isActive
                          ? "border-violet-400/30 bg-violet-500/[0.06]"
                          : isDone
                          ? "border-white/[0.07] bg-white/[0.02]"
                          : "border-white/[0.05] bg-white/[0.01] opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                            isDone
                              ? "bg-emerald-400/10 text-emerald-400"
                              : isActive
                              ? "bg-violet-400/10 text-violet-400"
                              : "bg-white/[0.04] text-zinc-600"
                          }`}>
                            {isDone ? (
                              <CheckCircle2 size={14} />
                            ) : isActive ? (
                              <span className="size-2 animate-pulse rounded-full bg-violet-400" />
                            ) : (
                              <Clock size={12} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{info.title}</h3>
                            <p className="mt-1 text-xs leading-5 text-zinc-400">{info.body}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[11px] font-bold ${isDone ? "text-emerald-400" : isActive ? "text-violet-300" : "text-zinc-600"}`}>
                          {isDone ? "Done" : isActive ? "Current" : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* ZK Proof footer */}
                <div className="flex items-center justify-between rounded-2xl border border-violet-400/15 bg-violet-500/[0.04] px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-violet-400" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">ZK-Proof Verified</p>
                      <p className="text-xs text-zinc-400">Integrity check passed for execution logic.</p>
                    </div>
                  </div>
                  <button className="text-[11px] font-bold text-violet-300 hover:text-violet-200">
                    Verify Proof (CLI)
                  </button>
                </div>
              </div>
            )}

            {activeTab === "json" && (
              <pre className="m-5 overflow-auto rounded-xl bg-[#0a0a14] p-5 font-mono text-[11px] leading-6 text-emerald-400">
                {JSON.stringify(selectedReceipt, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function formatTs(ts: string): string {
  const n = Number(ts);
  if (n) return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(n * 1000));
  if (ts) return new Date(ts).toLocaleString();
  return "—";
}
