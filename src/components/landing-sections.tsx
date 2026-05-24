import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CircleDot,
  FileWarning,
  Gavel,
  RadioTower,
  Search,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { flowSteps, problemCards, trustBadges } from "@/src/data/marketing";

export function TrustBadges() {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-row flex-nowrap items-center gap-0 overflow-x-auto scrollbar-none">
        {trustBadges.map((badge, index) => (
          <span key={badge} className="inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold text-zinc-400 whitespace-nowrap">
            {index > 0 && (
              <span className="mx-4 h-3 w-px bg-white/15" />
            )}
            <span className="size-1.5 rounded-full bg-cyan-300" />
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-[460px] lg:max-w-[520px]">
      <div className="mb-4 hidden text-center text-sm font-semibold text-zinc-200 md:block lg:hidden">
        Protocol Radar
      </div>
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(80,70,229,0.26)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-300" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="rounded-full border border-violet-400/30 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300">
            Live Audit Fragment #2035
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.06] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Integrity Score</p>
            <p className="mt-2 text-2xl font-semibold text-violet-300">84.2</p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Price Delta</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">-1.4%</p>
          </div>
        </div>
        {/* Line chart */}
        <div className="mt-4 h-44 rounded-2xl bg-[#10101a] px-4 pt-4 pb-2">
          <svg viewBox="0 0 300 110" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(124,58,237)" />
                <stop offset="100%" stopColor="rgb(34,211,238)" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(124,58,237)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Subtle horizontal grid lines */}
            {[20, 50, 80].map((y) => (
              <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {/* Filled area under the line */}
            <polygon
              points="0,80 50,62 100,68 150,42 200,52 250,32 300,38 300,110 0,110"
              fill="url(#areaGradient)"
            />
            {/* Main line */}
            <polyline
              points="0,80 50,62 100,68 150,42 200,52 250,32 300,38"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Data dots */}
            {[[0,80],[50,62],[100,68],[150,42],[200,52],[250,32],[300,38]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" fill="#10101a" stroke="url(#lineGradient)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="text-violet-300">Monitoring settlement routes...</span>
          <Link href="/dashboard" className="font-semibold text-zinc-300">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProblemSection() {
  const icons = [FileWarning, Search, ShieldAlert, Bot];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-[90px] sm:px-10 md:py-28 lg:px-16 lg:py-[134px]">
      <div className="max-w-xl">
        <h2 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
          Markets need <span className="text-cyan-300">integrity</span>
          <br />
          before capital moves.
        </h2>
        <p className="mt-4 text-sm leading-6 text-zinc-400 md:text-base">
          Traditional prediction markets suffer from opacity and manipulation risk. Most agents ignore the
          structural health of the trade.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {problemCards.map((card, index) => {
          const Icon = icons[index] ?? AlertTriangle;
          return (
            <article
              key={card.title}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              <span className="mb-6 flex size-11 items-center justify-center rounded-xl bg-rose-500/[0.14] text-rose-400 ring-1 ring-rose-500/[0.22]">
                <Icon size={20} />
              </span>
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-[1.75] text-zinc-400">{card.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function SolutionSection() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-[90px] sm:px-10 md:py-[134px] lg:px-16 lg:py-[157px]">
      {/* Centered heading */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          AgoraLens{" "}
          <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            audits before action
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
          A seamless four-stage process that ensures every dollar deployed is backed by verifiable market integrity.
        </p>
      </div>

      {/* Steps */}
      <div className="relative mt-20 grid grid-cols-2 gap-y-14 md:grid-cols-4 md:gap-y-0">
        {/* Horizontal connector line — sits behind icons at their vertical center (top-8 = half of size-16) */}
        <div className="absolute inset-x-[12.5%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />

        {flowSteps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center px-4 text-center">
            {/* Icon block */}
            <div className="relative z-10 mb-7 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e1a3c] to-[#141c38] shadow-[0_0_0_1px_rgba(124,58,237,0.28),0_8px_32px_rgba(80,50,200,0.28)]">
              <step.icon className="text-violet-400" size={26} />
            </div>
            {/* Phase label */}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-400">
              Phase 0{index + 1}
            </p>
            <h3 className="text-base font-bold text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


export function MarketCourtPreview() {
  const agents = [
    {
      name: "Argus v4",
      role: "Bull Agent",
      bias: "Bull Bias",
      biasCls: "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30",
      roleCls: "text-violet-400",
      avatar: "/agent-bull.png",
      log: "Scanned Polymarket Contract #482. Rule clarity: 92%. Volume verification shows no organic wash trading signatures found. Recommendation: write Arc Testnet receipt.",
    },
    {
      name: "Skeptic.ai",
      role: "Bear Agent",
      bias: "Bear Bias",
      biasCls: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30",
      roleCls: "text-rose-400",
      avatar: "/agent-bear.png",
      log: "Oracle source 'Reuters News' is undefined in primary resolution clause. Possible ambiguity during settlement. Risk Score elevated to 65%.",
    },
    {
      name: "Magistrate",
      role: "Judge Agent",
      bias: "Judge Bias",
      biasCls: "bg-zinc-700/50 text-zinc-300 ring-1 ring-white/10",
      roleCls: "text-cyan-400",
      avatar: "/agent-judge.png",
      log: "Consolidated inputs from Argus and Skeptic. Adjusted integrity score to 78.4. Arc Testnet receipt route confirmed with no real orders.",
    },
  ];

  return (
    <section className="relative z-10 mx-auto w-full max-w-[1440px] overflow-x-hidden px-6 py-[90px] sm:px-10 md:py-28 lg:px-16 lg:py-[134px]">
      {/* Header row */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">The Jury Is In</p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Meet the MarketCourt Agents</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
            Each audit is a cross-examination between specialized AI personas to uncover hidden discrepancies.
          </p>
        </div>
        <Link
          href="/dashboard#marketcourt"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-zinc-100 transition hover:border-violet-300/40 hover:bg-white/[0.08]"
        >
          View Recent Court Sessions
        </Link>
      </div>

      {/* Agent cards */}
      <div className="relative z-10 mt-12 grid max-w-full gap-5 lg:grid-cols-3">
        {agents.map((agent) => (
          <article
            key={agent.name}
            className="relative z-10 flex max-w-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors md:hover:border-white/[0.1] md:hover:bg-white/[0.04]"
          >
            {/* Avatar row */}
            <div className="flex min-w-0 items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {/* Agent avatar with online dot */}
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="size-12 rounded-full object-cover ring-2 ring-white/10"
                  />
                  <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#101018] bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words font-bold text-white">{agent.name}</h3>
                  <p className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${agent.roleCls}`}>
                    <Gavel size={11} />
                    {agent.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Bias pill + engine badge */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${agent.biasCls}`}>
                {agent.bias}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-zinc-400">
                v2.4 Engine
              </span>
            </div>

            {/* Audit log panel */}
            <div className="mt-5 max-w-full flex-1 break-words rounded-xl bg-white/[0.03] p-4">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-400">
                <Zap size={10} />
                Latest_Audit_Log
              </p>
              <p className="break-words text-sm leading-[1.7] text-zinc-300">{agent.log}</p>
            </div>

            {/* View Agent Logic */}
            <Link
              href="/dashboard#marketcourt"
              className="mt-5 inline-flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs font-semibold text-zinc-400 transition hover:text-white"
            >
              View Agent Logic
              <ArrowRight size={14} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LifecycleTransparency() {
  const steps = ["Entry", "Active Monitoring", "Resolution Check", "Final Settlement"];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 md:py-20 lg:px-16 lg:py-24">
      <div className="grid gap-8 rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-6 md:grid-cols-[0.8fr_1.2fr] md:p-10">
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-white">Lifecycle Transparency</h2>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            From market entry to the final settlement receipt, <br />
            AgoraLens provides a verifiable proof-of-integrity trail.
          </p>
          <Link
            href="/dashboard#ledger"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 md:w-fit"
          >
            View Ledger
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4 md:items-center">
          {steps.map((step, index) => (
            <div key={step} className="relative">
              <div className="hidden h-1 bg-gradient-to-r from-cyan-400 to-violet-500 md:block" />
              <div className="flex items-start gap-3 md:mt-5 md:block">
                <CircleDot className="mt-0.5 text-cyan-300 md:hidden" size={18} />
                <div>
                  <p className="text-sm font-semibold text-white">{step}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {index === 0 && "Testnet route confirmed"}
                    {index === 1 && "Price sync active"}
                    {index === 2 && "Oracle verification"}
                    {index === 3 && "Receipt generated"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 md:py-20 lg:px-16 lg:py-24">
      {/* Card */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#13131e] px-4 py-4 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.5)] md:px-6 md:py-5 lg:px-8 lg:py-6">
        {/* Subtle inner glow top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

        <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-white md:text-4xl">
          Market intelligence with
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            proof of integrity
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-zinc-400">
          Stop guessing. Start auditing. Join the next generation of autonomous market participants.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href="/create-agent"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(124,58,237,0.4)] transition hover:scale-[1.02] hover:shadow-[0_14px_38px_rgba(34,211,238,0.3)]"
          >
            Launch Dashboard Now
          </Link>
          <Link
            href="/dashboard#ledger"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            Read Documentation
          </Link>
        </div>

        {/* Cyan gradient accent line at bottom */}
        <div className="pointer-events-none absolute inset-x-[20%] bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>
    </section>
  );
}


export function LandingMobileRadarTitle() {
  return (
    <div className="mx-auto mb-4 mt-10 w-fit md:hidden">
      <span className="mb-4 mx-auto block h-1 w-12 rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
      <p className="text-center text-lg font-semibold text-white">Protocol Radar</p>
    </div>
  );
}

export function MiniProofList() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 md:hidden lg:px-16">
      <h2 className="text-xl font-semibold text-white">Full Position Ledger</h2>
      <div className="mt-5 space-y-5">
        {["Position Entry", "Active Monitoring", "Resolution Check", "Final Settlement"].map((item) => (
          <div key={item} className="flex gap-3">
            <Check className="mt-1 text-cyan-300" size={16} />
            <div>
              <p className="text-sm font-semibold text-white">{item}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Verified integrity proof recorded.</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { RadioTower, Zap };
