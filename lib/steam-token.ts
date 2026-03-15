import { createHmac } from "crypto";

const SECRET = process.env.STEAM_ID_SECRET || "dev-fallback-secret";

/**
 * Converts a raw Steam ID (numeric string) to a short opaque token.
 * The token is URL-safe and deterministic for a given Steam ID + secret.
 */
export function steamIdToToken(steamId: string): string {
  return createHmac("sha256", SECRET).update(steamId).digest("base64url").slice(0, 16);
}

/** Returns true if the given token matches the given steamId. */
export function tokenMatchesSteamId(token: string, steamId: string): boolean {
  return steamIdToToken(steamId) === token;
}
