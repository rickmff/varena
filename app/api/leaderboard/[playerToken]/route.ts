import { NextResponse } from "next/server";
import { getRegionDb, getUtilsDb, isValidRegion, getSeasonTables } from "@/lib/game-db";
import { steamIdToToken, tokenMatchesSteamId } from "@/lib/steam-token";
import type { RowDataPacket } from "mysql2";

interface SteamIdRow extends RowDataPacket {
  SteamID: string;
}

interface MatchHistoryRow extends RowDataPacket {
  SteamID: string;
  MatchID: number;
  MatchmakingTeam: number;
  Build: string;
  MmrDiff: number;
  DamageDone: number;
  DamageReceived: number;
  Score: number;
  Kills: number;
  Deaths: number;
  MatchDate: string | null;
  MatchDuration: number | null;
}

async function resolveSteamId(
  playerToken: string,
  matchmakingTable: string,
  db: ReturnType<typeof getRegionDb>
): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]{16}$/.test(playerToken)) return null;

  const [rows] = await db.query<SteamIdRow[]>(
    `SELECT SteamID FROM ${matchmakingTable}`
  );
  for (const row of rows) {
    if (tokenMatchesSteamId(playerToken, row.SteamID)) return row.SteamID;
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerToken: string }> }
) {
  try {
    const { playerToken } = await params;
    const { searchParams } = new URL(request.url);
    const regionParam = searchParams.get("region") || "eu";
    const region = isValidRegion(regionParam) ? regionParam : "eu";
    const seasonParam = searchParams.get("season") || "current";
    const season = seasonParam === "current" ? "current" : parseInt(seasonParam);

    const tables = getSeasonTables(season, region);
    const db = season === "current" ? getRegionDb(region) : getUtilsDb();
    const liveDb = getRegionDb(region);

    const steamId = await resolveSteamId(playerToken, tables.matchmaking, db);
    if (!steamId) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    const [rows] = await db.query<MatchHistoryRow[]>(
      `SELECT p.SteamID, p.MatchID, p.MatchmakingTeam, p.Build, p.MmrDiff,
              p.DamageDone, p.DamageReceived, p.Score, p.Kills, p.Deaths,
              m.MatchDate, m.MatchDuration
       FROM ${tables.matchHistory} p
       LEFT JOIN ${tables.matchData} m ON p.MatchID = m.MatchID
       WHERE p.SteamID = CAST(? AS UNSIGNED)
       ORDER BY p.MatchID DESC`,
      [steamId]
    );

    const matchIds = rows.map((r) => Number(r.MatchID));

    const playerTeamByMatch = new Map<number, number>();
    for (const row of rows) {
      playerTeamByMatch.set(Number(row.MatchID), Number(row.MatchmakingTeam));
    }

    let opponentsByMatch = new Map<
      number,
      {
        playerToken: string;
        name: string | null;
        build: string;
        score: number;
        damageDone: number;
        damageReceived: number;
        mmr: number | null;
        mmrDiff: number;
      }[]
    >();

    if (matchIds.length > 0) {
      const placeholders = matchIds.map(() => "?").join(",");

      // For archived seasons, names and current MMR come from the live region DB
      let nameMap = new Map<string, string>();
      let mmrMap = new Map<string, number>();

      // Fetch opponents from the season's match history table
      const [opponentRows] = await db.query<(MatchHistoryRow)[]>(
        `SELECT p.SteamID, p.MatchID, p.MatchmakingTeam, p.Build, p.Score,
                p.DamageDone, p.DamageReceived, p.MmrDiff
         FROM ${tables.matchHistory} p
         WHERE p.MatchID IN (${placeholders})
           AND p.SteamID != CAST(? AS UNSIGNED)`,
        [...matchIds, steamId]
      );

      if (opponentRows.length > 0) {
        const oppSteamIds = [...new Set(opponentRows.map((r) => r.SteamID))];
        const namePlaceholders = oppSteamIds.map(() => "?").join(",");

        const [nameRows] = await liveDb.execute<(RowDataPacket & { SteamID: string; Name: string })[]>(
          `SELECT SteamID, Name FROM PlayerNamesData WHERE SteamID IN (${namePlaceholders})`,
          oppSteamIds
        );
        nameMap = new Map(nameRows.map((n) => [n.SteamID, n.Name]));

        // Current MMR from live DB (best-effort for archived seasons)
        const [mmrRows] = await liveDb.execute<(RowDataPacket & { SteamID: string; MMR: number })[]>(
          `SELECT SteamID, MMR FROM PlayerMatchmakingData WHERE SteamID IN (${namePlaceholders})`,
          oppSteamIds
        );
        mmrMap = new Map(mmrRows.map((r) => [r.SteamID, Number(r.MMR)]));
      }

      for (const opp of opponentRows) {
        const mId = Number(opp.MatchID);
        const oppTeam = Number(opp.MatchmakingTeam);
        const playerTeam = playerTeamByMatch.get(mId);

        if (playerTeam !== undefined && oppTeam !== playerTeam) {
          if (!opponentsByMatch.has(mId)) opponentsByMatch.set(mId, []);
          opponentsByMatch.get(mId)!.push({
            playerToken: steamIdToToken(opp.SteamID),
            name: nameMap.get(opp.SteamID) ?? null,
            build: opp.Build || "",
            score: Number(opp.Score),
            damageDone: Math.round(Number(opp.DamageDone)),
            damageReceived: Math.round(Number(opp.DamageReceived)),
            mmr: mmrMap.get(opp.SteamID) ?? null,
            mmrDiff: Number(opp.MmrDiff),
          });
        }
      }
    }

    const matches = rows.map((row) => ({
      matchId: Number(row.MatchID),
      team: Number(row.MatchmakingTeam),
      build: row.Build || "",
      mmrDiff: Number(row.MmrDiff),
      damageDone: Math.round(Number(row.DamageDone)),
      damageReceived: Math.round(Number(row.DamageReceived)),
      score: Number(row.Score),
      kills: Number(row.Kills),
      deaths: Number(row.Deaths),
      matchDate: row.MatchDate ?? null,
      matchDuration: row.MatchDuration ?? null,
      opponents: opponentsByMatch.get(Number(row.MatchID)) || [],
    }));

    return NextResponse.json({ success: true, matches });
  } catch (error: any) {
    console.error("Match history API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch match history",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
