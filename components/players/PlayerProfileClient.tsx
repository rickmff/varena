"use client";

import { useState } from "react";
import { Calendar, Trophy, Sword, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import MatchHistoryList from "./MatchHistoryList";
import PlayerBuildsGrid from "@/components/builds/PlayerBuildsGrid";
import Link from "next/link";

type Region = "eu" | "na" | "br" | "oce" | "sea";
type MainTab = "ranked" | "builds" | "tierlists";

interface PlayerStats {
  name: string | null;
  wins: number;
  losses: number;
  mmr: number;
  rank: number;
  lastMatchDate: string;
}

interface RegionStats {
  region: Region;
  stats: PlayerStats | null;
}

interface Build {
  id: string;
  name: string;
  code: string;
  upvotes: number;
  downvotes: number;
}

interface TierList {
  id: string;
  name: string;
  upvotes: number;
  downvotes: number;
}

interface PlayerProfileClientProps {
  steamId: string;
  displayName: string;
  initialRegion: Region;
  regionStats: RegionStats[];
  builds: Build[];
  tierLists: TierList[];
}

const REGIONS: { value: Region; label: string }[] = [
  { value: "eu",  label: "EU"  },
  { value: "na",  label: "NA"  },
  { value: "br",  label: "BR"  },
  { value: "oce", label: "OCE" },
  { value: "sea", label: "SEA" },
];

const TIERS = [
  { name: "Bone",        minMmr: 0,    image: "/images/elos/Bone.png",        color: "text-orange-200/70" },
  { name: "Copper",      minMmr: 1475, image: "/images/elos/Copper.png",      color: "text-amber-500/70"  },
  { name: "Iron",        minMmr: 1525, image: "/images/elos/Iron.png",        color: "text-blue-200/70"   },
  { name: "Dark Silver", minMmr: 1600, image: "/images/elos/DarkSilver.png",  color: "text-violet-400/70" },
  { name: "Sanguine",    minMmr: 1700, image: "/images/elos/Sanguine.png",    color: "text-red-500/70"    },
];
const DRACULA_TIER = { name: "Dracula", image: "/images/elos/Dracula.png", color: "text-red-500" };

function getRankTier(mmr: number, rank: number) {
  if (rank === 1 && mmr >= 1700) return DRACULA_TIER;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (mmr >= TIERS[i].minMmr) return TIERS[i];
  }
  return TIERS[0];
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="px-3 py-3 rounded-sm bg-white/[0.03] border border-white/5 text-center">
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-4 py-10 rounded-sm bg-white/[0.02] border border-white/5 text-center text-gray-700 text-sm">
      {text}
    </div>
  );
}

export default function PlayerProfileClient({
  steamId,
  displayName,
  initialRegion,
  regionStats,
  builds,
  tierLists,
}: PlayerProfileClientProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("ranked");
  const [activeRegion, setActiveRegion] = useState<Region>(initialRegion);

  const current = regionStats.find((r) => r.region === activeRegion);
  const stats = current?.stats ?? null;

  const total = stats ? stats.wins + stats.losses : 0;
  const winRate = total > 0 ? Math.round((stats!.wins / total) * 1000) / 10 : 0;
  const tier = stats ? getRankTier(stats.mmr, stats.rank) : null;

  const MAIN_TABS: { id: MainTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "ranked",    label: "Ranked",     icon: <Trophy className="h-3.5 w-3.5" /> },
    { id: "builds",    label: "Builds",     icon: <Sword className="h-3.5 w-3.5" />,    count: builds.length || undefined },
    { id: "tierlists", label: "Tier Lists", icon: <BookOpen className="h-3.5 w-3.5" />, count: tierLists.length || undefined },
  ];

  return (
    <div className="space-y-0">
      {/* Main tabs */}
      <div className="flex border-b border-white/5">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[#8B0000] text-white"
                : "border-transparent text-gray-600 hover:text-gray-400"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-600">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="pt-6">
        {/* ── Ranked Tab ── */}
        {activeTab === "ranked" && (
          <div className="space-y-5">
            {/* Region tabs */}
            <div className="flex gap-1 p-1 rounded-sm bg-white/[0.03] border border-white/5 w-fit">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setActiveRegion(r.value)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-widest font-semibold rounded-sm transition-all ${
                    activeRegion === r.value
                      ? "bg-[#8B0000]/50 text-red-300 border border-[#8B0000]/50"
                      : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {stats ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatCard label="Wins" value={stats.wins} color="text-green-400" />
                  <StatCard label="Losses" value={stats.losses} color="text-red-400" />
                  <StatCard label="Win Rate" value={`${winRate}%`} color={winRate >= 50 ? "text-green-400" : "text-red-400"} />
                  <div className="px-3 py-3 rounded-sm bg-white/[0.03] border border-white/5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {tier && <img src={tier.image} alt={tier.name} className="w-4 h-4 object-contain" />}
                      <p className={`text-lg font-bold tabular-nums ${tier?.color ?? "text-violet-300"}`}>{stats.mmr}</p>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-600 mt-0.5">{tier?.name ?? "MMR"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last match {formatDate(stats.lastMatchDate)}
                  </span>
                  <span>Rank #{stats.rank}</span>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gray-600 mb-3">
                    Match History · {activeRegion.toUpperCase()}
                  </p>
                  <MatchHistoryList
                    steamId={steamId}
                    playerName={displayName}
                    currentMmr={stats.mmr}
                    region={activeRegion}
                  />
                </div>
              </>
            ) : (
              <EmptyState text={`No ranked data found for ${activeRegion.toUpperCase()}`} />
            )}
          </div>
        )}

        {/* ── Builds Tab ── */}
        {activeTab === "builds" && (
          builds.length ? (
            <PlayerBuildsGrid builds={builds} />
          ) : (
            <EmptyState text="No public builds" />
          )
        )}

        {/* ── Tier Lists Tab ── */}
        {activeTab === "tierlists" && (
          tierLists.length ? (
            <div className="space-y-2">
              {tierLists.map((tl) => (
                <Link
                  key={tl.id}
                  href={`/tier-list/${tl.id}`}
                  className="group flex items-center justify-between px-4 py-3 rounded-sm bg-white/[0.03] hover:bg-[#8B0000]/10 border border-white/5 hover:border-[#8B0000]/30 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="h-3.5 w-3.5 text-[#8B0000] shrink-0" />
                    <span className="text-sm text-white/80 group-hover:text-white truncate">{tl.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2 text-xs">
                    <span className="flex items-center gap-1 text-green-700">
                      <ThumbsUp className="h-3 w-3" />{tl.upvotes}
                    </span>
                    <span className="flex items-center gap-1 text-red-900">
                      <ThumbsDown className="h-3 w-3" />{tl.downvotes}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState text="No public tier lists" />
          )
        )}
      </div>
    </div>
  );
}
