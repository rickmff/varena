"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Clock, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertStringToBuild } from "@/components/machines/converter";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import "@/components/vbuilds/styles.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Opponent {
  playerToken: string;
  name: string | null;
  build: string;
  score: number;
  damageDone: number;
  damageReceived: number;
  mmr: number | null;
  mmrDiff: number;
}

interface Match {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIERS = [
  { name: "Bone",        minMmr: 0,    image: "/images/elos/Bone.png" },
  { name: "Copper",      minMmr: 1475, image: "/images/elos/Copper.png" },
  { name: "Iron",        minMmr: 1525, image: "/images/elos/Iron.png" },
  { name: "Dark Silver", minMmr: 1600, image: "/images/elos/DarkSilver.png" },
  { name: "Sanguine",    minMmr: 1700, image: "/images/elos/Sanguine.png" },
];
const DRACULA = { name: "Dracula", image: "/images/elos/Dracula.png" };

function getTierImage(mmr: number) {
  if (mmr >= 1700) return DRACULA.image;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (mmr >= TIERS[i].minMmr) return TIERS[i].image;
  }
  return TIERS[0].image;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 30) return `${Math.floor(d / 30)}mo ago`;
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

function formatDuration(s: number): string {
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

function formatNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function StatCol({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[36px]">
      <span className="text-xs font-semibold text-stone-300 tabular-nums leading-none">{value}</span>
      <span className="text-[9px] text-stone-600 uppercase tracking-wider leading-none mt-0.5">{label}</span>
    </div>
  );
}

function MiniTierIcon({ mmr }: { mmr: number }) {
  return <img src={getTierImage(mmr)} alt="" className="w-5 h-5 object-contain shrink-0" />;
}

function MatchIcons({ code, small, bloodFirst }: { code: string; small?: boolean; bloodFirst?: boolean }) {
  if (!code || code.length < 30) return null;
  let build;
  try { build = convertStringToBuild(code); } catch { return null; }

  const spells = build.spells;
  const spellImgs = [spells.dash?.img, spells.spell1?.img, spells.spell2?.img, spells.ultimate?.img];

  const primaryKey = build.blood?.primary as keyof typeof bloodData | undefined;
  const secondaryKey = build.blood?.secondary as keyof typeof bloodData | undefined;
  const bloods = [primaryKey, secondaryKey]
    .map((k) => (k ? bloodData[k] : null))
    .filter(Boolean) as (typeof bloodData)[keyof typeof bloodData][];

  const outer = small ? "w-6 h-6" : "w-8 h-8";
  const inner = small ? "w-5 h-5" : "w-7 h-7";

  const bloodEls = bloods.map((b, i) => (
    <div key={`b${i}`} className={`relative ${outer} rounded border border-red-900/40 flex items-center justify-center overflow-hidden`} title={b.name}>
      <img src={b.image} className={`${inner} object-contain`} alt={b.name} />
    </div>
  ));
  const spellEls = spellImgs.map((img, i) => (
    <div key={`s${i}`} className={`relative ${outer} bg-zinc-900/50 rounded border border-stone-700/50 flex items-center justify-center overflow-hidden`}>
      {img ? <img src={img} className={inner} alt="" /> : <div className={`${inner} bg-stone-800/50 rounded-sm`} />}
    </div>
  ));

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {bloodFirst ? [...bloodEls, ...spellEls] : [...spellEls, ...bloodEls]}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MatchHistoryListProps {
  playerToken: string;
  playerName: string | null;
  currentMmr: number;
  region: string;
}

const PAGE_SIZE = 8;
const MAX_RETRIES = 3;

export default function MatchHistoryList({ playerToken, playerName, currentMmr, region }: MatchHistoryListProps) {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Reset when region changes
  useEffect(() => {
    setAllMatches([]);
    setFetched(false);
    setVisibleCount(PAGE_SIZE);
    setRetryCount(0);
    setHasError(false);
  }, [region]);

  // Reconstruct MMR per match walking backwards from current MMR
  const matchesWithMmr = useMemo(() => {
    let mmr = currentMmr;
    return allMatches.map((match) => {
      const mmrAfter = mmr;
      mmr -= match.mmrDiff;
      return { ...match, mmrAfter };
    });
  }, [allMatches, currentMmr]);

  const visibleMatches = matchesWithMmr.slice(0, visibleCount);
  const hasMore = visibleCount < allMatches.length;

  useEffect(() => {
    if (fetched) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function fetch_() {
      setLoading(true);
      setHasError(false);
      try {
        const res = await fetch(`/api/leaderboard/${playerToken}?region=${region}`);
        const data = await res.json();
        if (data.success && data.matches.length > 0) {
          setAllMatches(data.matches);
          setFetched(true);
        } else if (data.success && data.matches.length === 0 && retryCount < MAX_RETRIES) {
          retryTimer = setTimeout(() => setRetryCount((c) => c + 1), 2000);
        } else if (data.success) {
          setFetched(true);
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch {
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

    fetch_();
    return () => { if (retryTimer) clearTimeout(retryTimer); };
  }, [fetched, region, playerToken, retryCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">
          {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : "Loading matches..."}
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-500">
        <span className="text-sm">Failed to load match history.</span>
        <button
          onClick={() => { setFetched(false); setRetryCount(0); setHasError(false); }}
          className="text-xs px-3 py-1 rounded border border-stone-700 hover:border-stone-500 hover:text-stone-300 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (fetched && allMatches.length === 0) {
    return (
      <p className="text-center py-10 text-sm text-stone-600">No match history found for this region.</p>
    );
  }

  return (
    <div className="space-y-1.5">
      <AnimatePresence>
        {visibleMatches.map((match, i) => {
          const won = match.score === 2 || (match.score === 0 && match.opponents[0]?.score === 0 && match.mmrDiff > 0);
          return (
            <motion.div
              key={`${match.matchId}-${match.team}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className={`relative flex rounded border overflow-hidden ${
                won
                  ? "bg-gradient-to-r from-emerald-950/40 via-emerald-950/20 to-stone-900/60 border-emerald-800/30 hover:border-emerald-700/40"
                  : "bg-gradient-to-r from-red-950/40 via-red-950/20 to-stone-900/60 border-red-800/30 hover:border-red-700/40"
              }`}
            >
              {/* Result col */}
              <div className="flex flex-col items-center justify-center text-center gap-1 px-3 md:px-4 shrink-0 border-r border-stone-800/50 min-w-[72px] self-stretch">
                <span className={`text-xs font-bold uppercase tracking-widest ${won ? "text-emerald-400" : "text-red-400"}`}>
                  {won ? "WIN" : "LOSS"}
                </span>
                <span className={`text-xs md:text-sm tabular-nums ${match.mmrDiff > 0 ? "text-emerald-400" : match.mmrDiff < 0 ? "text-red-400" : "text-stone-500"}`}>
                  {match.mmrDiff > 0 ? "+" : ""}{match.mmrDiff}
                </span>
              </div>

              {/* Content col */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Desktop */}
                <div className="hidden md:flex items-center">
                  <div className="flex items-center justify-end gap-3 px-4 py-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <StatCol value={formatNumber(match.damageReceived)} label="REC" />
                      <StatCol value={formatNumber(match.damageDone)} label="DMG" />
                      <StatCol value={match.mmrAfter - match.mmrDiff} label="MMR" />
                    </div>
                    <MatchIcons code={match.build} bloodFirst />
                    <div className="flex items-center gap-1.5 shrink-0 max-w-[120px]">
                      <MiniTierIcon mmr={match.mmrAfter - match.mmrDiff} />
                      <span className="text-sm font-medium text-white truncate">{playerName ?? `#${playerToken.slice(-6)}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-5 py-2.5 shrink-0 border-x border-stone-800/50">
                    <span className={`text-xl font-bold tabular-nums ${won ? "text-emerald-400" : "text-red-400"}`}>{match.score}</span>
                    <span className="text-stone-600 text-xs font-medium">vs</span>
                    {match.opponents[0] && (
                      <span className={`text-xl font-bold tabular-nums ${won ? "text-red-400" : "text-emerald-400"}`}>{match.opponents[0].score}</span>
                    )}
                  </div>

                  {match.opponents[0] && (
                    <div className="flex items-center gap-3 px-4 py-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0 max-w-[120px]">
                        {match.opponents[0].mmr != null && <MiniTierIcon mmr={match.opponents[0].mmr - match.opponents[0].mmrDiff} />}
                        <a
                          href={`/players/${match.opponents[0].playerToken}`}
                          className="text-sm font-medium text-white truncate hover:underline hover:text-red-300"
                        >
                          {match.opponents[0].name ?? `#${match.opponents[0].playerToken.slice(-6)}`}
                        </a>
                      </div>
                      <MatchIcons code={match.opponents[0].build} />
                      <div className="flex items-center gap-4">
                        {match.opponents[0].mmr != null && <StatCol value={match.opponents[0].mmr - match.opponents[0].mmrDiff} label="MMR" />}
                        <StatCol value={formatNumber(match.opponents[0].damageDone)} label="DMG" />
                        <StatCol value={formatNumber(match.opponents[0].damageReceived)} label="REC" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile */}
                <div className="flex md:hidden flex-col">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <MiniTierIcon mmr={match.mmrAfter - match.mmrDiff} />
                      <span className="text-sm font-medium text-white truncate">{playerName ?? `#${playerToken.slice(-6)}`}</span>
                    </div>
                    <MatchIcons code={match.build} small bloodFirst />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 border-y border-stone-800/30 bg-black/10">
                    <div className="flex-1 h-px bg-stone-800/40" />
                    <span className={`text-base font-bold tabular-nums ${won ? "text-emerald-400" : "text-red-400"}`}>{match.score}</span>
                    <span className="text-stone-600 text-xs font-medium">vs</span>
                    {match.opponents[0] && (
                      <span className={`text-base font-bold tabular-nums ${won ? "text-red-400" : "text-emerald-400"}`}>{match.opponents[0].score}</span>
                    )}
                    <div className="flex-1 h-px bg-stone-800/40" />
                  </div>
                  {match.opponents[0] && (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {match.opponents[0].mmr != null && <MiniTierIcon mmr={match.opponents[0].mmr - match.opponents[0].mmrDiff} />}
                        <a
                          href={`/players/${match.opponents[0].playerToken}`}
                          className="text-sm font-medium text-white truncate hover:underline hover:text-red-300"
                        >
                          {match.opponents[0].name ?? `#${match.opponents[0].playerToken.slice(-6)}`}
                        </a>
                      </div>
                      <MatchIcons code={match.opponents[0].build} small />
                    </div>
                  )}
                </div>

                {/* Bottom info */}
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
      </AnimatePresence>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleCount((p) => p + PAGE_SIZE)}
            className="text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 border border-stone-700/40 gap-1.5"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Load more ({allMatches.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
