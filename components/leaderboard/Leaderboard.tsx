"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Search,
  ArrowUp,
  ArrowDown,
  Swords,
  Target,
  Clock,
} from "lucide-react";
import { EU, US, AU, BR, SG } from "country-flag-icons/react/3x2";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Player {
  playerToken: string;
  name: string | null;
  wins: number;
  losses: number;
  mmr: number;
  winRate: number;
  lastMatchDate: string;
  rank: number;
}


type SortOption = "mmr" | "wins" | "winrate";
type Region = "eu" | "na" | "br" | "oce" | "sea" | "test";
type Season = "current" | number;

const ALL_REGION_OPTIONS: { value: Region; label: string; Flag?: React.ComponentType<{ className?: string }>; devOnly?: boolean }[] = [
  { value: "eu",   label: "EU",   Flag: EU },
  { value: "na",   label: "NA",   Flag: US },
  { value: "br",   label: "BR",   Flag: BR },
  { value: "oce",  label: "OCE",  Flag: AU },
  { value: "sea",  label: "SEA",  Flag: SG },
  { value: "test", label: "TEST", devOnly: true },
];

const REGIONS = ALL_REGION_OPTIONS.filter(
  (r) => !r.devOnly || process.env.NODE_ENV === "development"
);


// ─── Rank Tiers ─────────────────────────────────────────────────────────────

interface TierConfig {
  name: string;
  image: string;
  textColor: string;
  glowColor: string;
  rowOpacity?: number;
}

const TIERS: (TierConfig & { minMmr: number })[] = [
  { name: "Bone",        minMmr: 0,    image: "/images/elos/Bone.png",        textColor: "text-orange-200/70", glowColor: "rgba(251,146,60,0.95)",   rowOpacity: 0.05   },
  { name: "Copper",      minMmr: 1475, image: "/images/elos/Copper.png",      textColor: "text-amber-500/70",  glowColor: "rgba(245,158,11,0.75)",   rowOpacity: 0.10   },
  { name: "Iron",        minMmr: 1525, image: "/images/elos/Iron.png",        textColor: "text-blue-200/70",   glowColor: "rgba(191,219,254,0.75)",   rowOpacity: 0.08  },
  { name: "Dark Silver", minMmr: 1600, image: "/images/elos/DarkSilver.png",  textColor: "text-violet-400/70", glowColor: "rgba(167,139,250,0.8)",   rowOpacity: 0.08   },
  { name: "Sanguine",    minMmr: 1700, image: "/images/elos/Sanguine.png",    textColor: "text-red-500/70",    glowColor: "rgba(239,68,68,0.85)",   rowOpacity: 0.10 },
]; 

const DRACULA_TIER: TierConfig = {
  name: "Dracula",
  image: "/images/elos/Dracula.png",
  textColor: "text-red-500",
  glowColor: "rgba(239,68,68,0.95)",
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
      <span className={`text-sm tabular-nums text-white/90`}>
        {mmr}
      </span>
    </div>
  );
}

// Set to true to use mock data for UI testing
const USE_MOCK_DATA = false;


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
  { rank: 1, playerToken: "mock_token_0001", name: "Skiiw",      wins: 98, losses: 18, mmr: 2480, winRate: 84.5, lastMatchDate: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { rank: 2, playerToken: "mock_token_0002", name: "SNK",         wins: 90, losses: 22, mmr: 2380, winRate: 80.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
  { rank: 3, playerToken: "mock_token_0003", name: "Isaiah",      wins: 82, losses: 26, mmr: 2290, winRate: 75.9, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { rank: 4, playerToken: "mock_token_0004", name: "Kurama",      wins: 75, losses: 30, mmr: 2210, winRate: 71.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
  { rank: 5, playerToken: "mock_token_0005", name: "sweets",      wins: 68, losses: 34, mmr: 2150, winRate: 66.7, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  // ── Dracula (rank 6+, mmr ≥ 2100) ────────────────────────────────────────
  { rank: 6, playerToken: "mock_token_0006", name: "Torlic",      wins: 60, losses: 40, mmr: 2110, winRate: 60.0, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
  // ── Dark Silver (1900–2099) ───────────────────────────────────────────────
  { rank: 7, playerToken: "mock_token_0007", name: "Kaelith",     wins: 45, losses: 48, mmr: 1980, winRate: 48.4, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString() },
  // ── Iron (1700–1899) ──────────────────────────────────────────────────────
  { rank: 8, playerToken: "mock_token_0008", name: "Velmira",     wins: 32, losses: 52, mmr: 1790, winRate: 38.1, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  // ── Copper (any mmr) ──────────────────────────────────────────────────────
  { rank: 9, playerToken: "mock_token_0009", name: "Noctavelle",  wins: 20, losses: 55, mmr: 1250, winRate: 26.7, lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [rawPlayers, setRawPlayers] = useState<Player[]>([]);
  const [totalMatches, setTotalMatches] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("mmr");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>("eu");
  const [season, setSeason] = useState<Season>("current");
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([]);

  const players = useMemo(() => {
    const dir = sortDir === "desc" ? 1 : -1;
    return [...rawPlayers].sort((a, b) => {
      if (sortBy === "wins") return dir * (b.wins - a.wins);
      if (sortBy === "winrate") return dir * (b.winRate - a.winRate);
      return dir * (b.mmr - a.mmr);
    });
  }, [rawPlayers, sortBy, sortDir]);

  const handleSort = useCallback((col: SortOption) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  }, [sortBy]);

  // Fetch available archived seasons once on mount
  useEffect(() => {
    fetch("/api/seasons")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAvailableSeasons(data.seasons);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      let filtered = [...MOCK_PLAYERS];
      if (search) filtered = filtered.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
      setRawPlayers(filtered);
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ region, season: String(season) });
        if (search) params.set("search", search);

        const res = await fetch(`/api/leaderboard?${params}`);
        const data = await res.json();

        if (data.success) {
          setRawPlayers(data.players);
          if (data.totalMatches != null) setTotalMatches(data.totalMatches);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search, region, season]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

        <div className="flex flex-col gap-2">
          {/* Season selector */}
          {availableSeasons.length > 0 && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
              <button
                onClick={() => setSeason("current")}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
                  season === "current"
                    ? "bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,0.06),0_-1px_0_rgba(0,0,0,0.3)]"
                    : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.04]"
                }`}
              >
                S{(availableSeasons[availableSeasons.length - 1] ?? 0) + 1}
              </button>
              {[...availableSeasons].reverse().map((s) => {
                const active = season === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
                      active
                        ? "bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,0.06),0_-1px_0_rgba(0,0,0,0.3)]"
                        : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    S{s}
                  </button>
                );
              })}
            </div>
          )}

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
                  {r.Flag && <r.Flag className={`w-4 h-auto rounded-[2px] transition-opacity duration-200 ${active ? "opacity-100" : "opacity-50"}`} />}
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

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

      {/* Stats Summary */}
      {!loading && players.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 text-xs text-gray-500"
        >
          <span>
            <span className="text-white font-semibold mr-1">{players.length}</span>
            players leaderboard
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
                <TableHead className="text-gray-400 w-20 text-center">Rank</TableHead>
                <TableHead className="text-gray-400">Player</TableHead>
                <TableHead className="text-gray-400 hidden sm:table-cell">Elo</TableHead>
                <TableHead
                  className={`text-center cursor-pointer select-none transition-colors ${sortBy === "winrate" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  onClick={() => handleSort("winrate")}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Win Rate
                    {sortBy === "winrate"
                      ? sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                      : <ArrowDown className="w-3 h-3 opacity-20" />}
                  </div>
                </TableHead>
                <TableHead
                  className={`text-center hidden sm:table-cell cursor-pointer select-none transition-colors ${sortBy === "wins" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  onClick={() => handleSort("wins")}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Swords className="w-3.5 h-3.5" />
                    W/L
                    {sortBy === "wins"
                      ? sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                      : <ArrowDown className="w-3 h-3 opacity-20" />}
                  </div>
                </TableHead>
                <TableHead
                  className={`cursor-pointer select-none transition-colors ${sortBy === "mmr" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  onClick={() => handleSort("mmr")}
                >
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    MMR
                    {sortBy === "mmr"
                      ? sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                      : <ArrowDown className="w-3 h-3 opacity-20" />}
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

                return (
                  <React.Fragment key={player.playerToken}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.05, 1),
                      }}
                      onMouseEnter={() => !isTop5 && setHoveredPlayer(player.playerToken)}
                      onMouseLeave={() => !isTop5 && setHoveredPlayer(null)}
                      style={!isTop5 ? {
                        background: `linear-gradient(to right, ${tier.glowColor.replace(/[\d.]+\)$/, `${hoveredPlayer === player.playerToken ? (tier.rowOpacity ?? 0.07) * 1.8 : tier.rowOpacity ?? 0.07})`)}, transparent 45%)`,
                      } : undefined}
                      className={`
                        border-white/20 border-t border-b
                        transition-all duration-200
                        ${
                          isTop5
                            ? `border-l-2 border-b ${isDracula ? "border-l-red-700/60 border-b-red-900/30 bg-gradient-to-r from-red-900/30 from-0% via-red-800/10 via-25% to-transparent to-50% hover:from-red-900/40 hover:via-red-800/15" : "border-l-yellow-500/50 border-b-yellow-800/20 bg-gradient-to-r from-yellow-800/25 from-0% via-yellow-700/8 via-25% to-transparent to-50% hover:from-yellow-800/35 hover:via-yellow-700/12"}`
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
                                Immortal King
                              </span>
                            )}
                            {player.name && isDracula && (
                              <a
                                href={`/players/${player.playerToken}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-base font-bold tracking-widest uppercase bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent hover:underline"
                                style={{ textShadow: "0 0 12px rgba(220,38,38,0.4)" }}
                              >
                                {player.name}
                              </a>
                            )}
                            {player.name && !isDracula && (
                              <a
                                href={`/players/${player.playerToken}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`font-semibold truncate tracking-[0.05em] w-full hover:underline ${
                                  isTop5 ? "text-sm text-yellow-300" : "text-sm text-white/90"
                                }`}
                              >
                                {player.name === "ChipSa" ? "Washed ChipSa" : player.name}
                              </a>
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
                          className={`text-sm tabular-nums ${
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
