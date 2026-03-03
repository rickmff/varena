import { NextResponse } from "next/server";
import { getRegionDb, isValidRegion } from "@/lib/game-db";
import type { RowDataPacket } from "mysql2";

interface PlayerMatchmakingRow extends RowDataPacket {
  SteamID: string;
  Wins: number;
  Losses: number;
  MMR: number;
  LastMatchDate: Date;
  Name: string | null;
}

function serializePlayer(row: PlayerMatchmakingRow) {
  const wins = Number(row.Wins);
  const losses = Number(row.Losses);
  const total = wins + losses;
  return {
    steamId: row.SteamID,
    name: row.Name ?? null,
    wins,
    losses,
    mmr: Number(row.MMR),
    winRate: total > 0 ? Math.round((wins / total) * 1000) / 10 : 0,
    lastMatchDate:
      row.LastMatchDate instanceof Date
        ? row.LastMatchDate.toISOString()
        : String(row.LastMatchDate),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort") || "mmr";
    const search = searchParams.get("search") || "";
    const regionParam = searchParams.get("region") || "eu";
    const region = isValidRegion(regionParam) ? regionParam : "eu";

    const db = getRegionDb(region);

    let orderClause: string;
    switch (sortBy) {
      case "wins":
        orderClause = "Wins DESC, MMR DESC";
        break;
      case "winrate":
        orderClause = "(Wins / GREATEST(Wins + Losses, 1)) DESC, MMR DESC";
        break;
      case "mmr":
      default:
        orderClause = "MMR DESC, Wins DESC";
        break;
    }

    let rows: PlayerMatchmakingRow[];

    if (search.trim()) {
      const [results] = await db.execute<PlayerMatchmakingRow[]>(
        `SELECT p.SteamID, p.Wins, p.Losses, p.MMR, p.LastMatchDate, n.Name
         FROM PlayerMatchmakingData p
         LEFT JOIN PlayerNamesData n ON p.SteamID = n.SteamID
         WHERE CAST(p.SteamID AS CHAR) LIKE ? OR n.Name LIKE ?
         ORDER BY ${orderClause}`,
        [`%${search.trim()}%`, `%${search.trim()}%`]
      );
      rows = results;
    } else {
      const [results] = await db.execute<PlayerMatchmakingRow[]>(
        `SELECT p.SteamID, p.Wins, p.Losses, p.MMR, p.LastMatchDate, n.Name
         FROM PlayerMatchmakingData p
         LEFT JOIN PlayerNamesData n ON p.SteamID = n.SteamID
         ORDER BY ${orderClause}`
      );
      rows = results;
    }

    const players = rows.map(serializePlayer);

    return NextResponse.json({ success: true, players });
  } catch (error: any) {
    console.error("Ranked API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch ranked data",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
