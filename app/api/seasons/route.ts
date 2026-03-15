import { NextResponse } from "next/server";
import { getUtilsDb, isValidRegion } from "@/lib/game-db";
import type { RowDataPacket } from "mysql2";

interface TableRow extends RowDataPacket {
  TABLE_NAME: string;
}

// Discovers archived seasons by scanning the utils DB for tables matching
// S{N}_{REGION}_PlayerMatchmakingData. Returns season numbers sorted ascending.
export async function GET() {
  try {
    const db = getUtilsDb();

    const [rows] = await db.execute<TableRow[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME REGEXP '^S[0-9]+_(EU|NA|OCE|BR|SEA)_PlayerMatchmakingData$'`
    );

    const seasonNums = new Set<number>();
    for (const row of rows) {
      const m = row.TABLE_NAME.match(/^S(\d+)_/);
      if (m) seasonNums.add(parseInt(m[1]));
    }

    const seasons = Array.from(seasonNums).sort((a, b) => a - b);

    return NextResponse.json({ success: true, seasons });
  } catch (error: any) {
    console.error("Seasons API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch seasons",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
