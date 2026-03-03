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
  Flame,
  Shield,
  Loader2,
} from "lucide-react";
import { convertStringToBuild } from "@/components/machines/converter";
import "@/components/vbuilds/styles.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Player {
  steamId: string;
  name: string | null;
  wins: number;
  losses: number;
  mmr: number;
  winRate: number;
  lastMatchDate: string;
}

interface Opponent {
  steamId: string;
  name: string | null;
  build: string;
  score: number;
  damageDone: number;
  damageReceived: number;
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
}

const TIERS: (TierConfig & { minMmr: number })[] = [
  { name: "Copper",      minMmr: 0,    image: "/images/elos/t1.png", textColor: "text-orange-400", glowColor: "rgba(251,146,60,0.75)"   },
  { name: "Iron",        minMmr: 1700, image: "/images/elos/t3.png", textColor: "text-slate-300",  glowColor: "rgba(203,213,225,0.7)"  },
  { name: "Dark Silver", minMmr: 1900, image: "/images/elos/t4.png", textColor: "text-violet-300", glowColor: "rgba(216,180,254,0.75)"  },
  { name: "Legendary",   minMmr: 2100, image: "/images/elos/t4.png", textColor: "text-amber-400",  glowColor: "rgba(251,191,36,0.8)"    },
];

const DRACULA_TIER: TierConfig = {
  name: "Dracula",
  image: "/images/elos/t5.png",
  textColor: "text-red-500",
  glowColor: "rgba(185,28,28,0.95)",
};

function getRankTier(mmr: number, rank: number): TierConfig {
  if (rank === 1) return DRACULA_TIER;
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

function findMostFrequentSpellSchool(words: (string | undefined)[]): string {
  const valid = words.filter((w): w is string => w !== undefined);
  if (valid.length === 0) return "empty";
  const freq: Record<string, number> = {};
  for (const w of valid) freq[w] = (freq[w] || 0) + 1;
  let best = "";
  let max = 0;
  for (const w in freq) {
    if (freq[w] > max) { best = w; max = freq[w]; }
  }
  return best;
}

const spellBorderVariants: Record<string, string> = {
  empty: "border-spellSchool-empty/30",
  storm: "border-spellSchool-storm/30",
  blood: "border-spellSchool-blood/30",
  chaos: "border-spellSchool-chaos/30",
  arcane: "border-spellSchool-unholy/30",
  frost: "border-spellSchool-frost/30",
  illusion: "border-spellSchool-illusion/30",
};

function MatchBuildIcons({ code }: { code: string }) {
  if (!code || code.length < 30) return null;

  let build;
  try {
    build = convertStringToBuild(code);
  } catch {
    return null;
  }

  const spells = build.spells;
  const school = findMostFrequentSpellSchool([
    spells.dash?.spellSchool,
    spells.spell1?.spellSchool,
    spells.spell2?.spellSchool,
    spells.ultimate?.spellSchool,
  ]);
  const border = spellBorderVariants[school] || spellBorderVariants.empty;

  const spellIcons = [
    spells.dash?.img,
    spells.spell1?.img,
    spells.spell2?.img,
    spells.ultimate?.img,
  ];

  return (
    <div className="flex items-center gap-0.5">
      {spellIcons.map((img, i) => (
        <div
          key={i}
          className={`relative w-8 h-8 bg-zinc-900/50 rounded border ${border} flex items-center justify-center overflow-hidden`}
        >
          {img ? (
            <img src={img} className="w-7 h-7" alt="" />
          ) : (
            <div className="w-7 h-7 bg-stone-800/50 rounded-sm" />
          )}
        </div>
      ))}
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
      {/* glow behind the image */}
      <div
        className={`absolute inset-0 rounded-full ${isDracula ? "blur-lg animate-pulse" : isTop5 ? "blur-md animate-pulse" : "blur-md"}`}
        style={{ background: tier.glowColor, animationDuration: isDracula ? "3.5s" : "4s" }}
      />
      {isDracula && (
        <div
          className="absolute inset-0 rounded-full blur-xl animate-pulse opacity-60"
          style={{ background: "rgba(220,38,38,0.5)", transform: "scale(1.4)", animationDuration: "3.5s" }}
        />
      )}
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
      <span className="text-[10px] text-gray-500 uppercase tracking-wider hidden lg:inline">
        {tier.name}
      </span>
    </div>
  );
}

// Set to true to use mock data for UI testing
const USE_MOCK_DATA = true;

const BUILD_A = "222222222bcaoif3462l3452412461c07B9b0B7900000000000000000000000000000041111643";
const BUILD_B = "622222222bcn8721367j1245523642d03824083200000000000000000000000000000014444751";
const BUILD_C = "822222222bc1k42136734563223565103E8n218700000000000000000000000000000052222751";
const BUILD_D = "722222222bcg9af3456g2456413656o6479n218700000000000000000000000000000033333961";
const BUILD_E = "522222222icbj6i1256r1246312458c08B7b07B8g628Ef028En379Dr528Ei64B9o128E41111623";

const MOCK_MATCHES: MatchHistory[] = [
  { matchId: 2010, team: 1, build: BUILD_A, mmrDiff: 28,  damageDone: 5200, damageReceived: 1900, score: 2, kills: 9,  deaths: 2, matchDate: new Date(Date.now() - 1000 * 60 * 20).toISOString(),           matchDuration: 680,  opponents: [{ steamId: "76561198000000002", name: "Hunter",       build: BUILD_B, score: 0, damageDone: 1900, damageReceived: 5200 }] },
  { matchId: 2009, team: 2, build: BUILD_C, mmrDiff: -22, damageDone: 3100, damageReceived: 4800, score: 1, kills: 3,  deaths: 7, matchDate: new Date(Date.now() - 1000 * 60 * 95).toISOString(),           matchDuration: 540,  opponents: [{ steamId: "76561198000000003", name: "Hunter",    build: BUILD_D, score: 2, damageDone: 4800, damageReceived: 3100 }] },
  { matchId: 2008, team: 1, build: BUILD_E, mmrDiff: 31,  damageDone: 6100, damageReceived: 2200, score: 2, kills: 11, deaths: 1, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),       matchDuration: 710,  opponents: [{ steamId: "76561198000000004", name: "Hunter",    build: BUILD_A, score: 0, damageDone: 2200, damageReceived: 6100 }] },
  { matchId: 2007, team: 2, build: BUILD_B, mmrDiff: -19, damageDone: 2900, damageReceived: 3600, score: 1, kills: 4,  deaths: 6, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),       matchDuration: 890,  opponents: [{ steamId: "76561198000000005", name: "Hunter",    build: BUILD_C, score: 2, damageDone: 3600, damageReceived: 2900 }] },
  { matchId: 2006, team: 1, build: BUILD_D, mmrDiff: 25,  damageDone: 4700, damageReceived: 2500, score: 2, kills: 8,  deaths: 3, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),      matchDuration: 620,  opponents: [{ steamId: "76561198000000006", name: "Hunter",    build: BUILD_E, score: 1, damageDone: 2500, damageReceived: 4700 }] },
  { matchId: 2005, team: 1, build: BUILD_A, mmrDiff: 20,  damageDone: 4300, damageReceived: 3000, score: 2, kills: 7,  deaths: 4, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),      matchDuration: 810,  opponents: [{ steamId: "76561198000000007", name: "Hunter",    build: BUILD_D, score: 0, damageDone: 3000, damageReceived: 4300 }] },
  { matchId: 2004, team: 2, build: BUILD_C, mmrDiff: -14, damageDone: 2600, damageReceived: 3300, score: 0, kills: 2,  deaths: 5, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString(),      matchDuration: 460,  opponents: [{ steamId: "76561198000000008", name: "Hunter", build: BUILD_B, score: 2, damageDone: 3300, damageReceived: 2600 }] },
  { matchId: 2003, team: 1, build: BUILD_E, mmrDiff: 18,  damageDone: 3900, damageReceived: 2800, score: 2, kills: 6,  deaths: 3, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),  matchDuration: 590,  opponents: [{ steamId: "76561198000000009", name: "Hunter", build: BUILD_A, score: 1, damageDone: 2800, damageReceived: 3900 }] },
  { matchId: 2002, team: 2, build: BUILD_B, mmrDiff: -10, damageDone: 2400, damageReceived: 2900, score: 1, kills: 3,  deaths: 4, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),  matchDuration: 505,  opponents: [{ steamId: "76561198000000010", name: "Hunter",     build: BUILD_C, score: 2, damageDone: 2900, damageReceived: 2400 }] },
  { matchId: 2001, team: 1, build: BUILD_D, mmrDiff: 15,  damageDone: 3500, damageReceived: 2100, score: 2, kills: 5,  deaths: 2, matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),  matchDuration: 740,  opponents: [{ steamId: "76561198000000011", name: null,        build: BUILD_E, score: 0, damageDone: 2100, damageReceived: 3500 }] },
];

function MatchHistoryPanel({
  steamId,
  playerName,
  isOpen,
  currentMmr,
}: {
  steamId: string;
  playerName: string | null;
  isOpen: boolean;
  currentMmr: number;
}) {
  const PAGE_SIZE = 5;
  const [allMatches, setAllMatches] = useState<MatchHistory[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

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

    async function fetchMatches() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ranked/${steamId}`);
        const data = await res.json();
        if (data.success) {
          setAllMatches(data.matches);
        }
      } catch (err) {
        console.error("Failed to fetch match history:", err);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    }
    fetchMatches();
  }, [isOpen, steamId, fetched]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.tr>
          <td colSpan={6} className="p-0">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 py-5 border-t border-stone-700/50">
                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-4">
                  Match History
                </h4>

                {loading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading matches...</span>
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
                          className={`relative flex items-stretch rounded border transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.3)] ${
                            won
                              ? "bg-gradient-to-r from-emerald-950/40 via-emerald-950/20 to-stone-900/60 border-emerald-800/30 hover:border-emerald-700/40"
                              : "bg-gradient-to-r from-red-950/40 via-red-950/20 to-stone-900/60 border-red-800/30 hover:border-red-700/40"
                          }`}
                        >
                          {/* Column 1: Result */}
                          <div className="flex flex-col items-center justify-center gap-0.5 px-3 py-3 shrink-0 border-r border-stone-800/50 min-w-[62px]">
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${won ? "text-emerald-400" : "text-red-400"}`}>
                              {won ? "WIN" : "LOSS"}
                            </span>
                            <span className={`text-sm font-bold tabular-nums ${
                              match.mmrDiff > 0 ? "text-emerald-400" : match.mmrDiff < 0 ? "text-red-400" : "text-stone-500"
                            }`}>
                              {match.mmrDiff > 0 ? "+" : ""}{match.mmrDiff}
                            </span>
                            {match.matchDuration !== null && (
                              <span className="text-[10px] text-stone-500 tabular-nums mt-0.5">{formatDuration(match.matchDuration)}</span>
                            )}
                          </div>

                          {/* Player side */}
                          <div className="flex items-center justify-end gap-3 px-3 py-3 flex-1 min-w-0">
                            <div className="flex flex-col gap-1 items-end min-w-0">
                              <span className="text-sm font-semibold text-stone-300 tracking-wide truncate max-w-[110px]">
                                {playerName ?? steamId.slice(-8)}
                              </span>
                              <MatchBuildIcons code={match.build} />
                            </div>
                          </div>

                          {/* Center: Score + time */}
                          <div className="flex flex-col items-center justify-center px-4 py-3 shrink-0 border-x border-stone-800/50">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-lg font-bold tabular-nums ${won ? "text-emerald-500" : "text-red-500"}`}>{match.score}</span>
                              <span className="text-stone-600 text-xs font-medium">vs</span>
                              {match.opponents.length > 0 && (
                                <span className={`text-lg font-bold tabular-nums ${won ? "text-red-500" : "text-emerald-500"}`}>{match.opponents[0].score}</span>
                              )}
                            </div>
                            {match.matchDate && (
                              <span className="text-[10px] text-stone-500 mt-0.5 tabular-nums">{timeAgo(match.matchDate)}</span>
                            )}
                          </div>

                          {/* Opponent side */}
                          {match.opponents.length > 0 && (
                            <div className="flex items-center gap-3 px-3 py-3 flex-1 min-w-0 justify-start">
                              <div className="flex flex-col gap-1 items-start min-w-0">
                              <span className="text-sm font-semibold text-stone-300 tracking-wide truncate max-w-[110px]">
                                  {match.opponents[0].name ?? match.opponents[0].steamId.slice(-8)}
                                </span>
                                <MatchBuildIcons code={match.opponents[0].build} />
                              </div>
                            </div>
                          )}
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

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

const MOCK_PLAYERS: Player[] = [
  // ── Legendary (ranks 1–5, any mmr) ──────────────────────────────────────
  { steamId: "76561198000000001", name: "Skiiw",      wins: 98, losses: 18, mmr: 2480, winRate: 84.5, lastMatchDate: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { steamId: "76561198000000002", name: "SNK",         wins: 90, losses: 22, mmr: 2380, winRate: 80.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
  { steamId: "76561198000000003", name: "Isaiah",      wins: 82, losses: 26, mmr: 2290, winRate: 75.9, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { steamId: "76561198000000004", name: "Kurama",      wins: 75, losses: 30, mmr: 2210, winRate: 71.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
  { steamId: "76561198000000005", name: "sweets",      wins: 68, losses: 34, mmr: 2150, winRate: 66.7, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  // ── Dracula (rank 6+, mmr ≥ 2100) ────────────────────────────────────────
  { steamId: "76561198000000006", name: "Torlic",      wins: 60, losses: 40, mmr: 2110, winRate: 60.0, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
  // ── Dark Silver (1900–2099) ───────────────────────────────────────────────
  { steamId: "76561198000000007", name: "Kaelith",     wins: 45, losses: 48, mmr: 1980, winRate: 48.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString() },
  // ── Iron (1700–1899) ──────────────────────────────────────────────────────
  { steamId: "76561198000000008", name: "Velmira",     wins: 32, losses: 52, mmr: 1790, winRate: 38.1, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  // ── Copper (any mmr) ──────────────────────────────────────────────────────
  { steamId: "76561198000000009", name: "Noctavelle",  wins: 20, losses: 55, mmr: 1250, winRate: 26.7, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RankedLeaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("mmr");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

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
        const params = new URLSearchParams({ sort: sortBy });
        if (search) params.set("search", search);

        const res = await fetch(`/api/ranked?${params}`);
        const data = await res.json();

        if (data.success) {
          setPlayers(data.players);
        }
      } catch (err) {
        console.error("Failed to fetch ranked data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [sortBy, search]);

  const toggleExpanded = useCallback((steamId: string) => {
    setExpandedPlayer((prev) => (prev === steamId ? null : steamId));
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by name or Steam ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-red-600/50 focus:ring-red-600/20"
          />
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
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400 w-20 text-center">
                  Rank
                </TableHead>
                <TableHead className="text-gray-400">Player</TableHead>
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
                const rank = index + 1;
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
                      className={`
                        transition-colors duration-200 cursor-pointer select-none
                        ${
                          isDracula
                            ? "border-l-2 border-l-red-700/60 border-b border-red-900/30 bg-gradient-to-r from-red-950/50 via-red-900/20 to-transparent hover:from-red-950/60 hover:via-red-900/25"
                            : isTop5
                            ? "border-l-2 border-l-amber-700/30 border-b border-amber-900/20 bg-gradient-to-r from-amber-950/20 via-yellow-950/10 to-transparent hover:from-amber-950/35 hover:via-yellow-950/25"
                            : "border-white/5 hover:bg-white/[0.03]"
                        }
                        ${isExpanded ? "bg-white/[0.04]" : ""}
                      `}
                    >
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <TierBadge mmr={player.mmr} rank={rank} />
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col min-w-0">
                            {isDracula && (
                              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-red-800 mb-0.5">
                                Dracula
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
                              <span className={`font-semibold truncate ${
                                isTop5 ? "text-sm text-amber-200" : "text-sm text-gray-400"
                              }`}>
                                {player.name}
                              </span>
                            )}
                          </div>
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
                    />
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
