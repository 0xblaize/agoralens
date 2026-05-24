"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import {
  ChevronDown,
  CircleDot,
  Copy,
  Database,
  LogOut,
  Network,
  Shield,
  Wallet,
} from "lucide-react";
import { clearAgentProfile, getAgentProfile, type AgentProfile } from "@/src/lib/agent-session";

type WalletStatus = {
  arcWallet: {
    address: string | null;
    balance: string;
    rpcStatus: "connected" | "error" | "not-configured";
  };
  circle: {
    configured: boolean;
    wallets: Array<{ address: string; state: string }>;
    error: string | null;
  };
  receiptRegistryAddress: string | null;
};

export function AgentAccountCard() {
  const [profile, setProfile] = useState<AgentProfile | null>(() => getAgentProfile());
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || walletStatus) return;
    let cancelled = false;
    fetch("/api/wallet/status", { cache: "no-store" })
      .then((response) => response.json() as Promise<WalletStatus>)
      .then((status) => {
        if (!cancelled) setWalletStatus(status);
      })
      .catch(() => {
        if (!cancelled) setWalletStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, walletStatus]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/agent/logout", { method: "POST" });
    } finally {
      clearAgentProfile();
      setProfile(null);
      window.location.href = "/";
    }
  }

  if (!profile) {
    return (
      <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <CircleDot size={16} className="text-violet-400" />
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  const arcAddress = walletStatus?.arcWallet.address ?? profile.walletAddress ?? null;
  const circleStatus = walletStatus?.circle.configured
    ? walletStatus.circle.wallets.length > 0
      ? "Connected"
      : "Configured"
    : profile.circleWallet === "configured"
      ? "Configured"
      : "Not configured";
  const receiptStatus = walletStatus?.receiptRegistryAddress ? "Configured" : "Not configured";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition hover:bg-white/[0.08]"
        aria-label="Agent wallet panel"
      >
        <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-[11px] font-bold text-white">
          {initials || "A"}
        </span>
        <span className="hidden max-w-[120px] truncate text-xs font-semibold text-zinc-200 sm:block">
          {profile.name}
        </span>
        <ChevronDown
          size={13}
          className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#18181f] shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="border-b border-white/[0.07] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
              Agent Wallet
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white">
                {initials || "A"}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{profile.name}</p>
                <p className="truncate font-mono text-[10px] text-zinc-500">{profile.agentId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 p-2">
            <StatusRow icon={Wallet} label="Circle Wallet" value={circleStatus} good={circleStatus !== "Not configured"} />
            <StatusRow
              icon={Network}
              label="Arc Testnet wallet"
              value={arcAddress ? shortValue(arcAddress) : "Not connected"}
              good={Boolean(arcAddress)}
              copyValue={arcAddress}
            />
            <StatusRow
              icon={CircleDot}
              label="Testnet USDC balance"
              value={walletStatus?.arcWallet.rpcStatus === "connected" ? `${formatBalance(walletStatus.arcWallet.balance)} USDC` : "Unavailable"}
              good={walletStatus?.arcWallet.rpcStatus === "connected"}
            />
            <StatusRow icon={Shield} label="USDC gasless mode" value="Testnet only" good />
            <StatusRow icon={Shield} label="Paymaster mode" value="Ready state" good={false} />
            <StatusRow icon={Database} label="Receipt registry" value={receiptStatus} good={receiptStatus === "Configured"} />
          </div>

          {/* <div className="mx-2 mb-2 rounded-xl border border-violet-400/15 bg-violet-500/[0.05] px-3 py-2.5 text-[10px] leading-4 text-zinc-400">
            The wallet panel supports Radar -> MarketCourt -> Execution -> Ledger. No mainnet funds or live orders are used.
          </div> */}

          <div className="border-t border-white/[0.07] p-2">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-400 transition hover:bg-rose-500/[0.08] disabled:opacity-60"
            >
              <LogOut size={14} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  good,
  copyValue,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  good: boolean;
  copyValue?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2 text-zinc-400">
        <Icon size={13} />
        <span className="truncate text-xs">{label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`truncate text-right text-[11px] font-bold ${good ? "text-emerald-400" : "text-amber-300"}`}>
          {value}
        </span>
        {copyValue && (
          <button
            onClick={() => navigator.clipboard.writeText(copyValue)}
            className="text-zinc-600 hover:text-zinc-300"
            aria-label={`Copy ${label}`}
          >
            <Copy size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

function shortValue(value: string): string {
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function formatBalance(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en", { maximumFractionDigits: 4 });
}
