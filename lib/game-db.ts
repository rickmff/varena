import { createPool, type Pool } from "mysql2/promise";

const globalForGameDb = globalThis as unknown as {
  gameDbPool: Pool | undefined;
};

function createGamePool(): Pool {
  const url = process.env.GAME_DATABASE_URL;
  if (!url) {
    throw new Error("GAME_DATABASE_URL is not defined");
  }

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

export const gameDb =
  globalForGameDb.gameDbPool ?? createGamePool();

if (process.env.NODE_ENV !== "production") {
  globalForGameDb.gameDbPool = gameDb;
}
