"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Search,
  ArrowUpDown,
  Swords,
  Target,
  Clock,
  ChevronDown,
  Loader2,
  Calendar,
} from "lucide-react";
import { convertStringToBuild } from "@/components/machines/converter";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import "@/components/vbuilds/styles.css";
import { EU, US, AU, BR, SG } from "country-flag-icons/react/3x2";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Player {
  steamId: string;
  name: string | null;
  wins: number;
  losses: number;
  mmr: number;
  winRate: number;
  lastMatchDate: string;
  rank: number;
}

interface Opponent {
  steamId: string;
  name: string | null;
  build: string;
  score: number;
  damageDone: number;
  damageReceived: number;
  mmr: number | null;
  mmrDiff: number;
}

interface MatchHistory {
  matchId: number;
  team: number;
  build: string;
  mmrDiff: number;
  damageDone: number;
  damageReceived: number;
  score: number;
  kills: number;
  deaths: number;
  matchDate: string | null;
  matchDuration: number | null;
  opponents: Opponent[];
}

type SortOption = "mmr" | "wins" | "winrate";
type Region = "eu" | "na" | "br" | "oce" | "sea";

const REGIONS: { value: Region; label: string; Flag: React.ComponentType<{ className?: string }> }[] = [
  { value: "eu",  label: "EU",  Flag: EU },
  { value: "na",  label: "NA",  Flag: US },
  { value: "br",  label: "BR",  Flag: BR },
  { value: "oce", label: "OCE", Flag: AU },
  { value: "sea", label: "SEA", Flag: SG },
];

const sortLabels: Record<SortOption, string> = {
  mmr: "MMR",
  wins: "Wins",
  winrate: "Win Rate",
};

// ─── Rank Tiers ─────────────────────────────────────────────────────────────

interface TierConfig {
  name: string;
  image: string;
  textColor: string;
  glowColor: string;
  rowOpacity?: number;
}

const TIERS: (TierConfig & { minMmr: number })[] = [
  { name: "Bone",        minMmr: 0,    image: "/images/elos/Bone.png",        textColor: "text-orange-200/70", glowColor: "rgba(251,146,60,0.75)"   },
  { name: "Copper",      minMmr: 1475, image: "/images/elos/Copper.png",      textColor: "text-amber-500/70",  glowColor: "rgba(203,213,225,0.7)"   },
  { name: "Iron",        minMmr: 1525, image: "/images/elos/Iron.png",        textColor: "text-blue-200/70",   glowColor: "rgba(216,180,254,0.75)"  },
  { name: "Dark Silver", minMmr: 1600, image: "/images/elos/DarkSilver.png",  textColor: "text-violet-400/70", glowColor: "rgba(251,191,36,0.8)"    },
  { name: "Sanguine",    minMmr: 1700, image: "/images/elos/Sanguine.png",    textColor: "text-red-500/70",    glowColor: "rgba(239,68,68,0.85)",   rowOpacity: 0.10 },
];

const DRACULA_TIER: TierConfig = {
  name: "Dracula",
  image: "/images/elos/Dracula.png",
  textColor: "text-red-500",
  glowColor: "rgba(185,28,28,0.95)",
};

function getRankTier(mmr: number, rank: number): TierConfig {
  if (rank === 1 && mmr >= 1700) return DRACULA_TIER;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (mmr >= TIERS[i].minMmr) return TIERS[i];
  }
  return TIERS[0];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ─── Build display helpers ───────────────────────────────────────────────────

// Combined blood + spell icons inside one clickable link.
// bloodFirst=true  → [blood][blood][spell][spell][spell][spell]  (player side)
// bloodFirst=false → [spell][spell][spell][spell][blood][blood]  (opponent side)
function MatchIcons({ code, small, bloodFirst }: { code: string; small?: boolean; bloodFirst?: boolean }) {
  if (!code || code.length < 30) return null;
  let build;
  try {
    build = convertStringToBuild(code);
  } catch {
    return null;
  }

  const spells = build.spells;
  const spellIcons = [spells.dash?.img, spells.spell1?.img, spells.spell2?.img, spells.ultimate?.img];

  const primaryKey = build.blood?.primary as keyof typeof bloodData | undefined;
  const secondaryKey = build.blood?.secondary as keyof typeof bloodData | undefined;
  const bloods = [primaryKey, secondaryKey]
    .map((k) => (k ? bloodData[k] : null))
    .filter(Boolean) as (typeof bloodData)[keyof typeof bloodData][];

  const outer = small ? "w-6 h-6" : "w-8 h-8";
  const inner = small ? "w-5 h-5" : "w-7 h-7";

  const bloodEls = bloods.map((blood, i) => (
    <div
      key={`b${i}`}
      className={`relative ${outer} rounded border border-red-900/40 flex items-center justify-center overflow-hidden`}
      title={blood.name}
    >
      <img src={blood.image} className={`${inner} object-contain`} alt={blood.name} />
    </div>
  ));

  const spellEls = spellIcons.map((img, i) => (
    <div
      key={`s${i}`}
      className={`relative ${outer} bg-zinc-900/50 rounded border border-stone-700/50 flex items-center justify-center overflow-hidden`}
    >
      {img ? <img src={img} className={inner} alt="" /> : <div className={`${inner} bg-stone-800/50 rounded-sm`} />}
    </div>
  ));

  return (
    <a
      href={`/builds/create?build=${encodeURIComponent(code)}`}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-0.5 hover:opacity-75 transition-opacity shrink-0"
      title="View build"
    >
      {bloodFirst ? [...bloodEls, ...spellEls] : [...spellEls, ...bloodEls]}
    </a>
  );
}

function MiniTierIcon({ mmr }: { mmr: number }) {
  const tier = getRankTier(mmr, 2); // rank=2 avoids Dracula special case
  return (
    <img
      src={tier.image}
      alt={tier.name}
      title={tier.name}
      className="w-5 h-5 object-contain shrink-0"
    />
  );
}

function StatCol({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[36px]">
      <span className="text-xs font-semibold text-stone-300 tabular-nums leading-none">{value}</span>
      <span className="text-[9px] text-stone-600 uppercase tracking-wider leading-none mt-0.5">{label}</span>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TierBadge({ mmr, rank }: { mmr: number; rank: number }) {
  const tier = getRankTier(mmr, rank);
  const isDracula = tier.name === "Dracula";
  const isTop5 = rank <= 5;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
      title={`${tier.name}${isDracula ? " (#1 Overall)" : isTop5 ? " (Top 5)" : ""}`}
      className={`relative flex items-center justify-center shrink-0 ${isDracula ? "w-12 h-12" : "w-10 h-10"}`}
    >
      <img
        src={tier.image}
        alt={tier.name}
        className={`relative object-contain ${isDracula ? "w-12 h-12 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "w-10 h-10"}`}
      />
    </motion.div>
  );
}

function MmrDisplay({ mmr, rank }: { mmr: number; rank: number }) {
  const tier = getRankTier(mmr, rank);

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-bold tabular-nums ${tier.textColor}`}>
        {mmr}
      </span>
    </div>
  );
}

// Set to true to use mock data for UI testing
const USE_MOCK_DATA = false;

const BUILD_A = "222222222bcaoif3462l3452412461c07B9b0B7900000000000000000000000000000041111643";
const BUILD_B = "622222222bcn8721367j1245523642d03824083200000000000000000000000000000014444751";
const BUILD_C = "822222222bc1k42136734563223565103E8n218700000000000000000000000000000052222751";
const BUILD_D = "722222222bcg9af3456g2456413656o6479n218700000000000000000000000000000033333961";
const BUILD_E = "522222222icbj6i1256r1246312458c08B7b07B8g628Ef028En379Dr528Ei64B9o128E41111623";

const MOCK_MATCHES: MatchHistory[] = [
  { matchId: 2010, team: 1, build: BUILD_A, mmrDiff: 28,  damageDone: 5200, damageReceived: 1900, score: 2, kills: 9,  deaths: 2, matchDate: new Date(Date.now() - 1000 * 60 * 20).toISOString(),           matchDuration: 680,  opponents: [{ steamId: "76561198000000002", name: "Hunter",       build: BUILD_B, score: 0, damageDone: 1900, damageReceived: 5200, mmr: 1850, mmrDiff: -28  }] },
  { matchId: 2009, team: 2, build: BUILD_C, mmrDiff: -22, damageDone: 3100, damageReceived: 4800, score: 1, kills: 3,  deaths: 7, matchDate: new Date(Date.now() - 1000 * 60 * 95).toISOString(),           matchDuration: 540,  opponents: [{ steamId: "76561198000000003", name: "Hunter",    build: BUILD_D, score: 2, damageDone: 4800, damageReceived: 3100, mmr: 2100, mmrDiff: 22   }] },
  { matchId: 2008, team: 1, build: BUILD_E, mmrDiff: 31,  damageDone: 6100, damageReceived: 2200, score: 2, kills: 11, deaths: 1, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),       matchDuration: 710,  opponents: [{ steamId: "76561198000000004", name: "Hunter",    build: BUILD_A, score: 0, damageDone: 2200, damageReceived: 6100, mmr: 1970, mmrDiff: -31  }] },
  { matchId: 2007, team: 2, build: BUILD_B, mmrDiff: -19, damageDone: 2900, damageReceived: 3600, score: 1, kills: 4,  deaths: 6, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),       matchDuration: 890,  opponents: [{ steamId: "76561198000000005", name: "Hunter",    build: BUILD_C, score: 2, damageDone: 3600, damageReceived: 2900, mmr: 2240, mmrDiff: 19   }] },
  { matchId: 2006, team: 1, build: BUILD_D, mmrDiff: 25,  damageDone: 4700, damageReceived: 2500, score: 2, kills: 8,  deaths: 3, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),      matchDuration: 620,  opponents: [{ steamId: "76561198000000006", name: "Hunter",    build: BUILD_E, score: 1, damageDone: 2500, damageReceived: 4700, mmr: 1730, mmrDiff: -25  }] },
  { matchId: 2005, team: 1, build: BUILD_A, mmrDiff: 20,  damageDone: 4300, damageReceived: 3000, score: 2, kills: 7,  deaths: 4, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),      matchDuration: 810,  opponents: [{ steamId: "76561198000000007", name: "Hunter",    build: BUILD_D, score: 0, damageDone: 3000, damageReceived: 4300, mmr: 1900, mmrDiff: -20  }] },
  { matchId: 2004, team: 2, build: BUILD_C, mmrDiff: -14, damageDone: 2600, damageReceived: 3300, score: 0, kills: 2,  deaths: 5, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString(),      matchDuration: 460,  opponents: [{ steamId: "76561198000000008", name: "Hunter",    build: BUILD_B, score: 2, damageDone: 3300, damageReceived: 2600, mmr: 2050, mmrDiff: 14   }] },
  { matchId: 2003, team: 1, build: BUILD_E, mmrDiff: 18,  damageDone: 3900, damageReceived: 2800, score: 2, kills: 6,  deaths: 3, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),  matchDuration: 590,  opponents: [{ steamId: "76561198000000009", name: "Hunter",    build: BUILD_A, score: 1, damageDone: 2800, damageReceived: 3900, mmr: 1780, mmrDiff: -18  }] },
  { matchId: 2002, team: 2, build: BUILD_B, mmrDiff: -10, damageDone: 2400, damageReceived: 2900, score: 1, kills: 3,  deaths: 4, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),  matchDuration: 505,  opponents: [{ steamId: "76561198000000010", name: "Hunter",    build: BUILD_C, score: 2, damageDone: 2900, damageReceived: 2400, mmr: 2160, mmrDiff: 10   }] },
  { matchId: 2001, team: 1, build: BUILD_D, mmrDiff: 15,  damageDone: 3500, damageReceived: 2100, score: 2, kills: 5,  deaths: 2, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),  matchDuration: 740,  opponents: [{ steamId: "76561198000000011", name: null,         build: BUILD_E, score: 0, damageDone: 2100, damageReceived: 3500, mmr: null,  mmrDiff: -15  }] },
];

function MatchHistoryPanel({
  steamId,
  playerName,
  isOpen,
  currentMmr,
  region,
}: {
  steamId: string;
  playerName: string | null;
  isOpen: boolean;
  currentMmr: number;
  region: Region;
}) {
  const PAGE_SIZE = 5;
  const MAX_RETRIES = 3;
  const [allMatches, setAllMatches] = useState<MatchHistory[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Reset when region changes so fresh data is fetched on next open
  const prevRegion = React.useRef(region);
  useEffect(() => {
    if (prevRegion.current !== region) {
      prevRegion.current = region;
      setAllMatches([]);
      setFetched(false);
      setVisibleCount(PAGE_SIZE);
      setRetryCount(0);
      setHasError(false);
    }
  }, [region]);

  // Reconstruct MMR at each match by walking backwards from current MMR
  const allMatchesWithMmr = React.useMemo(() => {
    let mmr = currentMmr;
    return allMatches.map((match) => {
      const mmrAfter = mmr;
      mmr -= match.mmrDiff;
      return { ...match, mmrAfter };
    });
  }, [allMatches, currentMmr]);

  const matches = allMatchesWithMmr.slice(0, visibleCount);
  const hasMore = visibleCount < allMatches.length;

  useEffect(() => {
    if (!isOpen || fetched) return;

    if (USE_MOCK_DATA) {
      setAllMatches(MOCK_MATCHES);
      setFetched(true);
      return;
    }

    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function fetchMatches() {
      setLoading(true);
      setHasError(false);
      try {
        const res = await fetch(`/api/ranked/${steamId}?region=${region}`);
        const data = await res.json();
        if (data.success && data.matches.length > 0) {
          setAllMatches(data.matches);
          setFetched(true);
        } else if (data.success && data.matches.length === 0 && retryCount < MAX_RETRIES) {
          // Empty response — retry in case the server wasn't ready
          retryTimer = setTimeout(() => setRetryCount((c) => c + 1), 2000);
        } else if (data.success) {
          // Still empty after all retries — accept it
          setFetched(true);
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (err) {
        console.error("Failed to fetch match history:", err);
        if (retryCount < MAX_RETRIES) {
          retryTimer = setTimeout(() => setRetryCount((c) => c + 1), 2000);
        } else {
          setHasError(true);
          setFetched(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
    return () => { if (retryTimer) clearTimeout(retryTimer); };
  }, [isOpen, steamId, fetched, region, retryCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.tr>
          <td colSpan={7} className="p-0">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 py-5 border-t border-stone-700/50 w-full">
                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-4">
                  Match History
                </h4>

                {loading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {retryCount > 0
                        ? `Retrying... (${retryCount}/${MAX_RETRIES})`
                        : "Loading matches..."}
                    </span>
                  </div>
                ) : hasError ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-stone-500">
                    <span className="text-sm">Failed to load match history.</span>
                    <button
                      onClick={() => { setFetched(false); setRetryCount(0); setHasError(false); }}
                      className="text-xs px-3 py-1 rounded border border-stone-700 hover:border-stone-500 hover:text-stone-300 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                ) : matches.length === 0 ? (
                  <p className="text-center py-6 text-sm text-stone-500">
                    No match history found
                  </p>
                ) : (
                  <div className="grid gap-1.5">
                    {matches.map((match, i) => {
                      const won = match.score === 2;


                      return (
                        <motion.div
                          key={`${match.matchId}-${match.team}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                          className={`relative flex rounded border transition-all duration-200 overflow-hidden ${
                            won
                              ? "bg-gradient-to-r from-emerald-950/40 via-emerald-950/20 to-stone-900/60 border-emerald-800/30 hover:border-emerald-700/40"
                              : "bg-gradient-to-r from-red-950/40 via-red-950/20 to-stone-900/60 border-red-800/30 hover:border-red-700/40"
                          }`}
                        >
                          {/* Result col — full height */}
                          <div className="flex flex-col items-center justify-center text-center gap-1 px-3 md:px-4 shrink-0 border-r border-stone-800/50 min-w-[80px] md:min-w-[80px] self-stretch">
                            <span className={`text-xs font-bold uppercase tracking-widest ${won ? "text-emerald-400" : "text-red-400"}`}>
                              {won ? "WIN" : "LOSS"}
                            </span>
                            <span className={`text-xs md:text-sm font-bold tabular-nums ${
                              match.mmrDiff > 0 ? "text-emerald-400" : match.mmrDiff < 0 ? "text-red-400" : "text-stone-500"
                            }`}>
                              {match.mmrDiff > 0 ? "+" : ""}{match.mmrDiff}
                            </span>
                          </div>

                          {/* Content col */}
                          <div className="flex flex-col flex-1 min-w-0">

                            {/* ── Desktop layout (md+): mirrored horizontal ── */}
                            <div className="hidden md:flex items-center">
                              {/* Player side: stats → blood → build → name */}
                              <div className="flex items-center justify-end gap-3 px-4 py-2.5 flex-1 min-w-0">
                                <div className="flex items-center gap-4">
                                  <StatCol value={formatNumber(match.damageReceived)} label="REC" />
                                  <StatCol value={formatNumber(match.damageDone)} label="DMG" />
                                  <StatCol value={match.mmrAfter - match.mmrDiff} label="MMR" />
                                </div>
                                <MatchIcons code={match.build} bloodFirst />
                                <div className="flex items-center gap-1.5 shrink-0 max-w-[120px]">
                                  <MiniTierIcon mmr={match.mmrAfter - match.mmrDiff} />
                                  <span className="text-sm font-medium text-white truncate">
                                    {playerName ?? steamId.slice(-8)}
                                  </span>
                                </div>
                              </div>

                              {/* Score */}
                              <div className="flex items-center gap-1.5 px-5 py-2.5 shrink-0 border-x border-stone-800/50">
                                <span className={`text-xl font-bold tabular-nums ${won ? "text-emerald-400" : "text-red-400"}`}>{match.score}</span>
                                <span className="text-stone-600 text-xs font-medium">vs</span>
                                {match.opponents.length > 0 && (
                                  <span className={`text-xl font-bold tabular-nums ${won ? "text-red-400" : "text-emerald-400"}`}>{match.opponents[0].score}</span>
                                )}
                              </div>

                              {/* Opponent side: name → build → blood → stats */}
                              {match.opponents.length > 0 && (
                                <div className="flex items-center gap-3 px-4 py-2.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 shrink-0 max-w-[120px]">
                                    {match.opponents[0].mmr != null && (
                                      <MiniTierIcon mmr={match.opponents[0].mmr - match.opponents[0].mmrDiff} />
                                    )}
                                    <span className="text-sm font-medium text-white truncate">
                                      {match.opponents[0].name ?? match.opponents[0].steamId.slice(-8)}
                                    </span>
                                  </div>
                                  <MatchIcons code={match.opponents[0].build} />
                                  <div className="flex items-center gap-4">
                                    {match.opponents[0].mmr != null && (
                                      <StatCol value={match.opponents[0].mmr - match.opponents[0].mmrDiff} label="MMR" />
                                    )}
                                    <StatCol value={formatNumber(match.opponents[0].damageDone)} label="DMG" />
                                    <StatCol value={formatNumber(match.opponents[0].damageReceived)} label="REC" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ── Mobile layout (<md): stacked ── */}
                            <div className="flex md:hidden flex-col">
                              {/* Player row */}
                              <div className="flex items-center gap-2 px-3 py-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <MiniTierIcon mmr={match.mmrAfter - match.mmrDiff} />
                                  <span className="text-sm font-medium text-white truncate">
                                    {playerName ?? steamId.slice(-8)}
                                  </span>
                                </div>
                                <MatchIcons code={match.build} small bloodFirst />
                              </div>

                              {/* Score divider */}
                              <div className="flex items-center gap-2 px-3 py-1 border-y border-stone-800/30 bg-black/10">
                                <div className="flex-1 h-px bg-stone-800/40" />
                                <span className={`text-base font-bold tabular-nums ${won ? "text-emerald-400" : "text-red-400"}`}>{match.score}</span>
                                <span className="text-stone-600 text-xs font-medium">vs</span>
                                {match.opponents.length > 0 && (
                                  <span className={`text-base font-bold tabular-nums ${won ? "text-red-400" : "text-emerald-400"}`}>{match.opponents[0].score}</span>
                                )}
                                <div className="flex-1 h-px bg-stone-800/40" />
                              </div>

                              {/* Opponent row */}
                              {match.opponents.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    {match.opponents[0].mmr != null && (
                                      <MiniTierIcon mmr={match.opponents[0].mmr - match.opponents[0].mmrDiff} />
                                    )}
                                    <span className="text-sm font-medium text-white truncate">
                                      {match.opponents[0].name ?? match.opponents[0].steamId.slice(-8)}
                                    </span>
                                  </div>
                                  <MatchIcons code={match.opponents[0].build} small />
                                </div>
                              )}
                            </div>

                            {/* Bottom info row */}
                            <div className="flex items-center justify-center gap-5 px-4 py-1 border-t border-stone-800/30 bg-black/15 text-xs">
                              {match.matchDuration != null && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-stone-600 shrink-0" />
                                  <span className="tabular-nums text-stone-500">{formatDuration(match.matchDuration)}</span>
                                </div>
                              )}
                              {match.matchDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-stone-600 shrink-0" />
                                  <span className="tabular-nums text-stone-500">{timeAgo(match.matchDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Load More */}
                    {hasMore && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center pt-2"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVisibleCount((prev) => prev + PAGE_SIZE);
                          }}
                          className="text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 border border-stone-700/40 gap-1.5"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          Load more ({allMatches.length - visibleCount} remaining)
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </td>
        </motion.tr>
      )}
    </AnimatePresence>
  );
}

const NAME_WIDTHS = [28, 20, 24, 16, 32, 18, 22, 26, 20, 14, 28, 18];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats summary skeleton */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-8" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
          <Skeleton className="h-3 w-10 shrink-0" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="hidden sm:block h-3 w-8" />
          <Skeleton className="h-3 w-14 ml-auto" />
          <Skeleton className="hidden sm:block h-3 w-8" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="hidden md:block h-3 w-18" />
        </div>

        {/* Body rows */}
        {Array.from({ length: 12 }).map((_, i) => {
          const nameW = NAME_WIDTHS[i % NAME_WIDTHS.length];
          const isTop3 = i < 3;
          return (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-white/5"
              style={{ opacity: 1 - i * 0.055 }}
            >
              {/* Rank — top 3 get a slightly taller badge shape */}
              {isTop3 ? (
                <Skeleton className="h-5 w-5 rounded shrink-0" />
              ) : (
                <Skeleton className="h-3.5 w-6 shrink-0" />
              )}

              {/* Player name */}
              <Skeleton className={`h-3.5 shrink-0`} style={{ width: `${nameW * 4}px` }} />

              {/* Elo badge + label */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Skeleton className="w-7 h-7 rounded shrink-0" />
                <Skeleton className="h-3 w-14" />
              </div>

              {/* Win Rate */}
              <Skeleton className="h-3.5 w-10 ml-auto shrink-0" />

              {/* W/L */}
              <Skeleton className="hidden sm:block h-3 w-12 shrink-0" />

              {/* MMR */}
              <Skeleton className="h-3.5 w-12 shrink-0" />

              {/* Last Match */}
              <Skeleton className="hidden md:block h-3 w-16 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MOCK_PLAYERS: Player[] = [
  // ── Legendary (ranks 1–5, any mmr) ──────────────────────────────────────
  { rank: 1, steamId: "76561198000000001", name: "Skiiw",      wins: 98, losses: 18, mmr: 2480, winRate: 84.5, lastMatchDate: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { rank: 2, steamId: "76561198000000002", name: "SNK",         wins: 90, losses: 22, mmr: 2380, winRate: 80.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
  { rank: 3, steamId: "76561198000000003", name: "Isaiah",      wins: 82, losses: 26, mmr: 2290, winRate: 75.9, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { rank: 4, steamId: "76561198000000004", name: "Kurama",      wins: 75, losses: 30, mmr: 2210, winRate: 71.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
  { rank: 5, steamId: "76561198000000005", name: "sweets",      wins: 68, losses: 34, mmr: 2150, winRate: 66.7, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  // ── Dracula (rank 6+, mmr ≥ 2100) ────────────────────────────────────────
  { rank: 6, steamId: "76561198000000006", name: "Torlic",      wins: 60, losses: 40, mmr: 2110, winRate: 60.0, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
  // ── Dark Silver (1900–2099) ───────────────────────────────────────────────
  { rank: 7, steamId: "76561198000000007", name: "Kaelith",     wins: 45, losses: 48, mmr: 1980, winRate: 48.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString() },
  // ── Iron (1700–1899) ──────────────────────────────────────────────────────
  { rank: 8, steamId: "76561198000000008", name: "Velmira",     wins: 32, losses: 52, mmr: 1790, winRate: 38.1, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  // ── Copper (any mmr) ──────────────────────────────────────────────────────
  { rank: 9, steamId: "76561198000000009", name: "Noctavelle",  wins: 20, losses: 55, mmr: 1250, winRate: 26.7, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RankedLeaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalMatches, setTotalMatches] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("mmr");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>("eu");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      let filtered = [...MOCK_PLAYERS];
      if (search) filtered = filtered.filter(p => p.steamId.includes(search));
      if (sortBy === "wins") filtered.sort((a, b) => b.wins - a.wins);
      else if (sortBy === "winrate") filtered.sort((a, b) => b.winRate - a.winRate);
      else filtered.sort((a, b) => b.mmr - a.mmr);
      setPlayers(filtered);
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sort: sortBy, region });
        if (search) params.set("search", search);

        const res = await fetch(`/api/ranked?${params}`);
        const data = await res.json();

        if (data.success) {
          setPlayers(data.players);
          if (data.totalMatches != null) setTotalMatches(data.totalMatches);
        }
      } catch (err) {
        console.error("Failed to fetch ranked data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [sortBy, search, region]);

  // Collapse any open panel when switching regions
  useEffect(() => {
    setExpandedPlayer(null);
  }, [region]);

  const toggleExpanded = useCallback((steamId: string) => {
    setExpandedPlayer((prev) => (prev === steamId ? null : steamId));
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

                {/* Region selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
          {REGIONS.map((r) => {
            const active = region === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setRegion(r.value)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
                  active
                    ? "bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,0.06),0_-1px_0_rgba(0,0,0,0.3)]"
                    : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.04]"
                }`}
              >
                <r.Flag className={`w-4 h-auto rounded-[2px] transition-opacity duration-200 ${active ? "opacity-100" : "opacity-50"}`} />
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Sort by
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 gap-2"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortLabels[sortBy]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-black border-white/10"
            >
              <DropdownMenuItem
                onClick={() => setSortBy("mmr")}
                className="text-white hover:bg-white/10 cursor-pointer gap-2"
              >
                <Trophy className="w-4 h-4 text-yellow-500" />
                MMR
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("wins")}
                className="text-white hover:bg-white/10 cursor-pointer gap-2"
              >
                <Swords className="w-4 h-4 text-emerald-500" />
                Wins
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("winrate")}
                className="text-white hover:bg-white/10 cursor-pointer gap-2"
              >
                <Target className="w-4 h-4 text-blue-500" />
                Win Rate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
                  <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by name or Steam ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-red-600/50 focus:ring-red-600/20"
          />
        </div>
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && players.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 text-xs text-gray-500"
        >
          <span>
            <span className="text-white font-semibold mr-1">{players.length}</span>
            players ranked
          </span>
          {totalMatches != null && (
            <span>
              <span className="text-white font-semibold mr-1">{totalMatches.toLocaleString()}</span>
              matches played
            </span>
          )}
        </motion.div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : players.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-500"
        >
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No players found</p>
          {search && (
            <p className="text-sm mt-1">Try a different search term</p>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400 w-20 text-center">
                  Rank
                </TableHead>
                <TableHead className="text-gray-400">Player</TableHead>
                <TableHead className="text-gray-400 hidden sm:table-cell">Elo</TableHead>
                <TableHead className="text-gray-400 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Win Rate
                  </div>
                </TableHead>
                <TableHead className="text-gray-400 text-center hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1.5">
                    <Swords className="w-3.5 h-3.5" />
                    W/L
                  </div>
                </TableHead>
                <TableHead className="text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    MMR
                  </div>
                </TableHead>
                <TableHead className="text-gray-400 text-right hidden md:table-cell">
                  <div className="flex items-center justify-end gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Last Match
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => {
                const rank = player.rank;
                const tier = getRankTier(player.mmr, rank);
                const isDracula = tier.name === "Dracula";
                const isTop5 = rank <= 5;
                const isExpanded = expandedPlayer === player.steamId;

                return (
                  <React.Fragment key={player.steamId}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.05, 1),
                      }}
                      onClick={() => toggleExpanded(player.steamId)}
                      onMouseEnter={() => !isTop5 && setHoveredPlayer(player.steamId)}
                      onMouseLeave={() => !isTop5 && setHoveredPlayer(null)}
                      style={!isTop5 ? {
                        background: `linear-gradient(to right, ${tier.glowColor.replace(/[\d.]+\)$/, `${hoveredPlayer === player.steamId ? (tier.rowOpacity ?? 0.07) * 1.8 : tier.rowOpacity ?? 0.07})`)}, transparent 45%)`,
                      } : undefined}
                      className={`
                        border-white/20 border-t border-b
                        transition-all duration-200 cursor-pointer select-none
                        ${
                          isTop5
                            ? `border-l-2 border-b ${isDracula ? "border-l-red-700/60 border-b-red-900/30" : "border-l-yellow-500/50 border-b-yellow-800/20"} bg-gradient-to-r from-yellow-800/25 from-0% via-yellow-700/8 via-25% to-transparent to-50% hover:from-yellow-800/35 hover:via-yellow-700/12`
                            : "border-white/5"
                        }
                      `}
                    >
                      <TableCell className="text-center">
                        <span className={`font-bold tabular-nums ${
                          isDracula ? "text-xl text-red-500" : isTop5 ? "text-lg text-yellow-400" : "text-sm text-gray-500"
                        }`}>
                          {rank}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col min-w-0">
                            {isDracula && (
                              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-red-600 mb-0.5">
                                Imortal King
                              </span>
                            )}
                            {player.name && isDracula && (
                              <span
                                className="text-base font-bold tracking-widest uppercase bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent"
                                style={{ textShadow: "0 0 12px rgba(220,38,38,0.4)" }}
                              >
                                {player.name}
                              </span>
                            )}
                            {player.name && !isDracula && (
                              <span className={`font-semibold truncate tracking-[0.05em] w-full ${
                                isTop5 ? "text-sm text-yellow-300" : "text-sm text-gray-400"
                              }`}>
                                {player.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <TierBadge mmr={player.mmr} rank={rank} />
                          <span className={`text-xs font-semibold uppercase tracking-wider ${tier.textColor}`}>
                            {tier.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            player.winRate >= 60
                              ? "text-emerald-400"
                              : player.winRate >= 50
                              ? "text-blue-400"
                              : player.winRate >= 40
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {player.winRate}%
                        </span>
                      </TableCell>

                      <TableCell className="text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-emerald-400 font-semibold tabular-nums">
                            {player.wins}
                          </span>
                          <span className="text-gray-600">/</span>
                          <span className="text-red-400 font-semibold tabular-nums">
                            {player.losses}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <MmrDisplay mmr={player.mmr} rank={rank} />
                      </TableCell>

                      <TableCell className="text-right hidden md:table-cell">
                        <span className="text-xs text-gray-500">
                          {timeAgo(player.lastMatchDate)}
                        </span>
                      </TableCell>
                    </motion.tr>

                    <MatchHistoryPanel
                      key={`history-${player.steamId}`}
                      steamId={player.steamId}
                      playerName={player.name}
                      isOpen={isExpanded}
                      currentMmr={player.mmr}
                      region={region}
                    />
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
