/**
 * src/lib/markets/polymarket.ts
 *
 * Polymarket Gamma API client.
 * Public API — no key required.
 * Read-only. No trades. No orders. No fund movement.
 *
 * Strategy:
 *  1. Try /events endpoint (groups related outcomes, gives cleaner questions)
 *  2. Fall back to /markets endpoint if events fail or return empty
 *  Both sorted by startDate DESC to show the freshest, most current markets.
 */

import { keccak256, toUtf8Bytes } from "ethers";
import type { ExternalMarket, ExternalMarketState } from "./types";

const GAMMA_BASE = "https://gamma-api.polymarket.com";

// ── Raw types ─────────────────────────────────────────────────────────────────

type PolymarketEvent = {
  id?: string | number;
  title?: string;
  slug?: string;
  category?: string;
  resolutionSource?: string;
  startDate?: string;
  endDate?: string;
  liquidity?: string | number;
  volume?: string | number;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  markets?: PolymarketRawMarket[];
};

type PolymarketRawMarket = {
  id?: string | number;
  conditionId?: string;
  question?: string;
  title?: string;
  slug?: string;
  category?: string;
  resolutionSource?: string;
  endDate?: string;
  endDateIso?: string;
  startDate?: string;
  closed?: boolean;
  active?: boolean;
  archived?: boolean;
  liquidity?: string | number;
  liquidityNum?: string | number;
  volume?: string | number;
  volumeNum?: string | number;
  outcomes?: unknown;
  outcomePrices?: unknown;
};

// ── Main export ───────────────────────────────────────────────────────────────

export async function getPolymarketMarkets(): Promise<ExternalMarketState> {
  // Try events endpoint first (better UX — groups outcomes, cleaner questions)
  const eventsResult = await tryGetFromEvents();
  if (eventsResult !== null) return eventsResult;

  // Fall back to individual markets endpoint
  return tryGetFromMarkets();
}

// ── Events endpoint ───────────────────────────────────────────────────────────

async function tryGetFromEvents(): Promise<ExternalMarketState | null> {
  try {
    const url = new URL(`${GAMMA_BASE}/events`);
    url.searchParams.set("active", "true");
    url.searchParams.set("closed", "false");
    url.searchParams.set("archived", "false");
    url.searchParams.set("limit", "50"); // fetch more to guarantee minimum 10 after filtering
    url.searchParams.set("order", "startDate");
    url.searchParams.set("ascending", "false"); // newest first

    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null; // fall through to markets

    const payload = (await res.json()) as unknown;
    const rawEvents = Array.isArray(payload) ? (payload as PolymarketEvent[]) : [];

    const now = Math.floor(Date.now() / 1000);
    const markets: ExternalMarket[] = [];

    for (const event of rawEvents) {
      if (event.closed || event.archived || event.active === false) continue;

      const question = String(event.title ?? "").trim();
      const slug = String(event.slug ?? event.id ?? "").trim();
      if (!question || !slug) continue;

      const deadline = toUnixSeconds(event.endDate);
      if (deadline > 0 && deadline <= now) continue; // skip expired

      const liquidity = toNumber(event.liquidity);
      const volume = toNumber(event.volume);
      const category = String(event.category ?? "Prediction Market");
      const resolutionSource = String(event.resolutionSource ?? "Polymarket event page");
      const marketUrl = `https://polymarket.com/event/${slug}`;

      // Derive implied probability from first child market
      const firstMarket = Array.isArray(event.markets) ? event.markets[0] : null;
      const impliedProbability = firstMarket
        ? getImpliedProbability(firstMarket.outcomes, firstMarket.outcomePrices)
        : 0;

      // Use conditionId from first market, or event id
      const externalMarketId = String(
        firstMarket?.conditionId ?? firstMarket?.id ?? event.id ?? slug,
      ).trim();
      if (!externalMarketId) continue;

      const metadataHash = keccak256(
        toUtf8Bytes(
          JSON.stringify({
            externalMarketId,
            platform: "Polymarket",
            question,
            category,
            resolutionSource,
            deadline,
            impliedProbability,
            liquidity,
            marketUrl,
          }),
        ),
      );

      markets.push({
        externalMarketId,
        platform: "Polymarket",
        question,
        category,
        resolutionSource,
        deadline: String(deadline),
        impliedProbability,
        liquidity,
        volume,
        marketUrl,
        metadataHash,
      });

      if (markets.length >= 20) break; // show up to 20, but keep fetching to ensure minimum 10
    }

    if (markets.length < 10) return null; // fall through to markets endpoint if we have fewer than 10

    return { status: "configured", source: "Polymarket", markets };
  } catch {
    return null; // fall through to markets endpoint
  }
}

// ── Markets endpoint (fallback) ───────────────────────────────────────────────

async function tryGetFromMarkets(): Promise<ExternalMarketState> {
  try {
    const url = new URL(`${GAMMA_BASE}/markets`);
    url.searchParams.set("active", "true");
    url.searchParams.set("closed", "false");
    url.searchParams.set("archived", "false");
    url.searchParams.set("limit", "100"); // fetch more to guarantee minimum 10 available
    url.searchParams.set("order", "startDate"); // newest markets first
    url.searchParams.set("ascending", "false");

    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        status: "error",
        message: "Live external market source unavailable.",
        detail: `Polymarket responded with HTTP ${res.status}`,
      };
    }

    const payload = (await res.json()) as unknown;
    const rawMarkets = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { markets?: unknown[] }).markets)
        ? (payload as { markets: unknown[] }).markets
        : [];

    const markets = (rawMarkets as PolymarketRawMarket[])
      .map(normalizePolymarketMarket)
      .filter((m): m is ExternalMarket => Boolean(m))
      .slice(0, 20);

    if (markets.length < 10) {
      return {
        status: "empty",
        source: "Polymarket",
        message: `Only ${markets.length} open Polymarket markets available. At least 10 markets needed for the Radar.`,
      };
    }

    return { status: "configured", source: "Polymarket", markets };
  } catch (error) {
    return {
      status: "error",
      message: "Live external market source unavailable.",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizePolymarketMarket(raw: PolymarketRawMarket): ExternalMarket | null {
  if (raw.closed || raw.archived || raw.active === false) return null;

  const question = String(raw.question ?? raw.title ?? "").trim();
  const externalMarketId = String(raw.conditionId ?? raw.id ?? "").trim();
  if (!question || !externalMarketId) return null;

  const slug = String(raw.slug ?? externalMarketId);
  const deadline = toUnixSeconds(raw.endDateIso ?? raw.endDate);
  if (deadline > 0 && deadline <= Math.floor(Date.now() / 1000)) return null; // expired

  const liquidity = toNumber(raw.liquidityNum ?? raw.liquidity);
  const volume = toNumber(raw.volumeNum ?? raw.volume);
  const category = String(raw.category ?? "Prediction Market");
  const resolutionSource = String(raw.resolutionSource ?? "Polymarket market page");
  const marketUrl = `https://polymarket.com/event/${slug}`;
  const impliedProbability = getImpliedProbability(raw.outcomes, raw.outcomePrices);
  const metadataHash = keccak256(
    toUtf8Bytes(
      JSON.stringify({
        externalMarketId,
        platform: "Polymarket",
        question,
        category,
        resolutionSource,
        deadline,
        impliedProbability,
        liquidity,
        marketUrl,
      }),
    ),
  );

  return {
    externalMarketId,
    platform: "Polymarket",
    question,
    category,
    resolutionSource,
    deadline: String(deadline),
    impliedProbability,
    liquidity,
    volume,
    marketUrl,
    metadataHash,
  };
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function toUnixSeconds(value: unknown): number {
  if (!value) return 0;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return 0;
  return Math.floor(date.getTime() / 1000);
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseMaybeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function getImpliedProbability(outcomes: unknown, prices: unknown): number {
  const parsedOutcomes = parseMaybeArray(outcomes);
  const parsedPrices = parseMaybeArray(prices).map(Number);
  if (parsedPrices.length === 0) return 0;

  const yesIndex = parsedOutcomes.findIndex((o) => o.toLowerCase() === "yes");
  const selectedPrice = parsedPrices[yesIndex >= 0 ? yesIndex : 0] ?? parsedPrices[0] ?? 0;
  return Math.round(Math.max(0, Math.min(1, selectedPrice)) * 100);
}
