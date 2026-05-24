import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  DashboardPreview,
  FinalCta,
  LandingMobileRadarTitle,
  LifecycleTransparency,
  MarketCourtPreview,
  MiniProofList,
  ProblemSection,
  SolutionSection,
  TrustBadges,
} from "@/src/components/landing-sections";
import { SiteFooter } from "@/src/components/site-footer";
import { SiteNavbar } from "@/src/components/site-navbar";

export default function Home() {
  return (
    <main className="isolate min-h-screen overflow-hidden bg-[#101018] text-white">
      <SiteNavbar />
      <section className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_72%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_86%_24%,rgba(124,58,237,0.26),transparent_38%),linear-gradient(180deg,#15151f_0%,#101018_88%)]" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-16 px-6 pt-20 sm:px-10 md:pt-24 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
          <div className="flex flex-col text-center md:text-left">
            <div className="mb-6 inline-flex w-fit rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-2 text-[11px] font-semibold text-violet-200 md:self-start self-center">
              Autonomous Market Integrity Agent
            </div>
            <h1 className="mx-auto max-w-3xl text-[2.6rem] font-semibold leading-[0.97] tracking-tight text-white sm:text-5xl md:mx-0 lg:text-6xl">
              Most agents chase alpha.
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                AgoraLens checks
              </span>
              <br />
              if the market deserves capital first.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-zinc-300 md:mx-0 md:text-base md:leading-7">
              Create an autonomous market integrity agent that audits testnet market contracts, stores reasoning
              receipts on Arc, routes USDC settlement logic, and monitors outcomes through the full lifecycle.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-start">
              <Link
                href="/create-agent"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(124,58,237,0.36)] transition hover:scale-[1.01] hover:shadow-[0_16px_42px_rgba(34,211,238,0.24)]"
              >
                Launch Agent
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/dashboard/marketcourt"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-zinc-100 transition hover:border-violet-300/40 hover:bg-white/[0.08]"
              >
                View MarketCourt
              </Link>
            </div>
            {/* mt-auto pushes trust badges to the bottom of the full-height column */}
            <div className="mt-auto pb-10 pt-6 border-t border-white/10 max-w-2xl">
              <TrustBadges />
            </div>
          </div>
          <div className="flex items-start pt-24 pb-10">
            <div className="w-full">
              <LandingMobileRadarTitle />
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>
      <ProblemSection />
      <SolutionSection />
      <MarketCourtPreview />
      <LifecycleTransparency />
      <MiniProofList />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
