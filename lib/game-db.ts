import { createPool, type Pool } from "mysql2/promise";

export type Region = "eu" | "na" | "oce" | "br" | "sea";

export const REGIONS: { value: Region; label: string }[] = [
  { value: "eu",  label: "EU"  },
  { value: "na",  label: "NA"  },
  { value: "oce", label: "OCE" },
  { value: "br",  label: "BR"  },
  { value: "sea", label: "SEA" },
];

export function isValidRegion(r: unknown): r is Region {
  return typeof r === "string" && ["eu", "na", "oce", "br", "sea"].includes(r);
}

// "current" means the live region DB; a number means an archived season in the utils DB
export type Season = "current" | number;

const globalForDbs = globalThis as unknown as {
  regionPools: Partial<Record<Region, Pool>>;
  utilsPool: Pool | undefined;
};

if (!globalForDbs.regionPools) {
  globalForDbs.regionPools = {};
}

function createRegionPool(region: Region): Pool {
  const envKey = `GAME_DATABASE_URL_${region.toUpperCase()}`;
  const url = process.env[envKey];
  if (!url) throw new Error(`${envKey} is not defined`);

  const parsed = new URL(url);

  return createPool({
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    connectionLimit: 5,
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
}

export function getRegionDb(region: Region): Pool {
  if (!globalForDbs.regionPools[region]) {
    globalForDbs.regionPools[region] = createRegionPool(region);
  }
  return globalForDbs.regionPools[region]!;
}

export function getUtilsDb(): Pool {
  if (!globalForDbs.utilsPool) {
    const url = process.env.GAME_DATABASE_URL_UTILS;
    if (!url) throw new Error("GAME_DATABASE_URL_UTILS is not defined");
    const parsed = new URL(url);
    globalForDbs.utilsPool = createPool({
      host: parsed.hostname,
      port: parseInt(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1),
      connectionLimit: 5,
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });
  }
  return globalForDbs.utilsPool!;
}

/**
 * Returns table names for a given season + region.
 * Current season: tables live in the region DB (no prefix).
 * Archived season N: tables live in the utils DB as S{N}_{REGION_UPPER}_TableName.
 */
export function getSeasonTables(season: Season, region: Region) {
  if (season === "current") {
    return {
      matchmaking: "PlayerMatchmakingData",
      matchData: "MatchData",
      matchHistory: "PlayerMatchHistoryData",
      names: "PlayerNamesData",
    };
  }
  const prefix = `S${season}_${region.toUpperCase()}`;
  return {
    matchmaking: `${prefix}_PlayerMatchmakingData`,
    matchData: `${prefix}_MatchData`,
    matchHistory: `${prefix}_PlayerMatchHistoryData`,
    // names still fetched from live region DB
    names: "PlayerNamesData",
  };
}
