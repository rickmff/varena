import { notFound } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import prisma from "@/lib/prisma";
import { getRegionDb } from "@/lib/game-db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import PlayerProfileClient from "@/components/players/PlayerProfileClient";

type Region = "eu" | "na" | "br" | "oce" | "sea";
const ALL_REGIONS: Region[] = ["eu", "na", "br", "oce", "sea"];

interface Props {
  params: Promise<{ steamId: string }>;
  searchParams: Promise<{ region?: string }>;
}

interface PlayerRow extends RowDataPacket {
  SteamID: string;
  Wins: number;
  Losses: number;
  MMR: number;
  LastMatchDate: Date;
  Name: string | null;
  MmrRank: number;
}

async function fetchRegionStats(steamId: string, region: Region) {
  try {
    const db = getRegionDb(region);
    const [rows] = await db.query<PlayerRow[]>(
      `SELECT p.SteamID, p.Wins, p.Losses, p.MMR, p.LastMatchDate,
              n.Name,
              RANK() OVER (ORDER BY p.MMR DESC) AS MmrRank
       FROM PlayerMatchmakingData p
       LEFT JOIN PlayerNamesData n ON p.SteamID = n.SteamID
       WHERE p.SteamID = CAST(? AS UNSIGNED)
       LIMIT 1`,
      [steamId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      name: r.Name ?? null,
      wins: Number(r.Wins),
      losses: Number(r.Losses),
      mmr: Number(r.MMR),
      rank: Number(r.MmrRank),
      lastMatchDate: r.LastMatchDate instanceof Date ? r.LastMatchDate.toISOString() : String(r.LastMatchDate),
    };
  } catch {
    return null;
  }
}

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

export default async function PlayerProfilePage({ params, searchParams }: Props) {
  const { steamId } = await params;
  const { region: regionParam = "eu" } = await searchParams;
  const initialRegion = (ALL_REGIONS.includes(regionParam as Region) ? regionParam : "eu") as Region;

  if (!/^\d+$/.test(steamId)) notFound();

  const [appUser, ...regionResults] = await Promise.all([
    prisma.user.findUnique({
      where: { steamId },
      select: {
        name: true,
        profilePublic: true,
        badge: { select: { badgeType: true, description: true } },
        builds: {
          where: { isPublic: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, code: true, upvotes: true, downvotes: true },
          take: 12,
        },
        spellTierLists: {
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, upvotes: true, downvotes: true },
          take: 20,
        },
      },
    }),
    ...ALL_REGIONS.map((r) => fetchRegionStats(steamId, r)),
  ]);

  const regionStats = ALL_REGIONS.map((r, i) => ({ region: r, stats: regionResults[i] }));
  const anyStats = regionResults.some(Boolean);

  if (!anyStats && !appUser) notFound();

  if (appUser && !appUser.profilePublic) {
    return (
      <div className="min-h-screen bg-[#080808] text-white">
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <Lock className="h-12 w-12 text-gray-700" />
          <h1 className="text-xl font-semibold text-white/60">This profile is private</h1>
          <p className="text-gray-600 text-sm">The player has chosen to keep their profile hidden.</p>
          <Link href="/leaderboard" className="text-[#8B0000] hover:underline text-sm mt-2">Back to Leaderboard</Link>
        </div>
      </div>
    );
  }

  const bestStats = regionResults.filter(Boolean).sort((a, b) => (b?.mmr ?? 0) - (a?.mmr ?? 0))[0] ?? null;
  const displayName = appUser?.name ?? bestStats?.name ?? `Player ${steamId.slice(-6)}`;
  const tier = bestStats ? getRankTier(bestStats.mmr, bestStats.rank) : null;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <NavBar />

      {/* Banner */}
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0820] via-[#0a0a1a] to-[#050510]" />
        <div className="absolute top-[-60px] right-[10%] w-72 h-72 rounded-full bg-[#8B0000]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(139,0,0,0.15) 40px, rgba(139,0,0,0.15) 41px)` }}
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Profile header */}
        <div className="relative -mt-12 mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#8B0000]/40 blur-md scale-110" />
            <div className="relative rounded-full p-[3px] bg-gradient-to-br from-[#8B0000] via-[#3d0000] to-[#8B0000]">
              <Avatar className="h-24 w-24 rounded-full border-2 border-[#080808]">
                <AvatarFallback className="bg-[#0f0614] text-white text-2xl font-bold rounded-full">
                  {displayName[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              {appUser?.badge && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-800/50">
                  {appUser.badge.badgeType}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {tier && bestStats && (
                <>
                  <div className="flex items-center gap-1.5">
                    <img src={tier.image} alt={tier.name} className="w-4 h-4 object-contain" />
                    <span className={`text-xs ${tier.color}`}>{tier.name}</span>
                  </div>
                  <span className="text-gray-600 text-xs">#{bestStats.rank} · {bestStats.mmr} MMR</span>
                </>
              )}
              <a
                href={`https://steamcommunity.com/profiles/${steamId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1"
              >
                <img src="https://store.steampowered.com/favicon.ico" alt="Steam" className="h-3 w-3" />
                Steam
              </a>
            </div>
          </div>

          <Link href="/leaderboard" className="pb-1 text-[11px] text-gray-700 hover:text-gray-500 transition-colors shrink-0">
            ← Leaderboard
          </Link>
        </div>

        {/* Tabs + content */}
        <div className="pb-20">
          <PlayerProfileClient
            steamId={steamId}
            displayName={displayName}
            initialRegion={initialRegion}
            regionStats={regionStats}
            builds={appUser?.builds ?? []}
            tierLists={appUser?.spellTierLists ?? []}
          />
        </div>
      </div>
    </div>
  );
}
