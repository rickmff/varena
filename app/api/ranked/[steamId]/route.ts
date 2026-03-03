import { NextResponse } from "next/server";
import { getRegionDb, isValidRegion } from "@/lib/game-db";
import type { RowDataPacket } from "mysql2";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;

    if (!/^\d+$/.test(steamId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Steam ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const regionParam = searchParams.get("region") || "eu";
    const region = isValidRegion(regionParam) ? regionParam : "eu";

    const db = getRegionDb(region);

    const [rows] = await db.query<MatchHistoryRow[]>(
      `SELECT p.SteamID, p.MatchID, p.MatchmakingTeam, p.Build, p.MmrDiff,
              p.DamageDone, p.DamageReceived, p.Score, p.Kills, p.Deaths,
              m.MatchDate, m.MatchDuration
       FROM PlayerMatchHistoryData p
       LEFT JOIN MatchData m ON p.MatchID = m.MatchID
       WHERE p.SteamID = CAST(? AS UNSIGNED)
       ORDER BY p.MatchID DESC`,
      [steamId]
    );

    const matchIds = rows.map((r) => Number(r.MatchID));

    const playerTeamByMatch = new Map<number, number>();
    for (const row of rows) {
      playerTeamByMatch.set(Number(row.MatchID), Number(row.MatchmakingTeam));
    }

    let opponentsByMatch = new Map<number, { steamId: string; name: string | null; build: string; score: number; damageDone: number; damageReceived: number }[]>();

    if (matchIds.length > 0) {
      const placeholders = matchIds.map(() => "?").join(",");
      const [opponentRows] = await db.query<(MatchHistoryRow & { Name: string | null })[]>(
        `SELECT p.SteamID, p.MatchID, p.MatchmakingTeam, p.Build, p.Score, p.DamageDone, p.DamageReceived, n.Name
         FROM PlayerMatchHistoryData p
         LEFT JOIN PlayerNamesData n ON p.SteamID = n.SteamID
         WHERE p.MatchID IN (${placeholders})
           AND p.SteamID != CAST(? AS UNSIGNED)`,
        [...matchIds, steamId]
      );

      for (const opp of opponentRows) {
        const mId = Number(opp.MatchID);
        const oppTeam = Number(opp.MatchmakingTeam);
        const playerTeam = playerTeamByMatch.get(mId);

        if (playerTeam !== undefined && oppTeam !== playerTeam) {
          if (!opponentsByMatch.has(mId)) opponentsByMatch.set(mId, []);
          opponentsByMatch.get(mId)!.push({
            steamId: opp.SteamID,
            name: opp.Name ?? null,
            build: opp.Build || "",
            score: Number(opp.Score),
            damageDone: Math.round(Number(opp.DamageDone)),
            damageReceived: Math.round(Number(opp.DamageReceived)),
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
