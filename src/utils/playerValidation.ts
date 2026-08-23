/**
 * Validates whether a player name represents an authentic, real player
 * and filters out guest, dummy, bot, and placeholder designations.
 */

const BANNED_EXACT_NAMES = new Set([
  "cybersherlock",
  "agentcipher",
  "neohacker",
  "byteenigma",
  "agent phoenix",
  "anonymous",
  "anon",
  "admin",
  "administrator",
  "root",
  "test",
  "tester",
  "testing",
  "null",
  "undefined",
  "nan",
  "unknown",
  "someone",
  "nobody",
  "no name",
  "noname",
  "guest",
  "player",
  "user",
  "operative",
  "agent",
]);

// Regex patterns that match generated/default guest templates (e.g. Guest_1, Player 2, Operative 007)
const BANNED_PATTERNS = [
  /^guest(\s|_|-|\d)*$/i,
  /^player(\s|_|-|\d)*$/i,
  /^operative(\s|_|-|\d)*$/i,
  /^agent(\s|_|-|\d)*$/i,
  /^user(\s|_|-|\d)*$/i,
  /^(anon|anonymous)(\s|_|-|\d)*$/i,
  /^test(er|ing)?(\s|_|-|\d)*$/i,
  /^bot(\s|_|-|\d)*$/i,
];

export function isValidPlayerName(name: any): boolean {
  if (!name || typeof name !== "string") return false;
  const clean = name.trim().toLowerCase();

  // Must be at least 2 characters and not exceed 25
  if (clean.length < 2 || clean.length > 25) return false;

  // Must contain at least one letter or digit
  if (!/[a-z0-9]/i.test(clean)) return false;

  // Check exact blacklist
  if (BANNED_EXACT_NAMES.has(clean)) return false;

  // Check pattern blacklists
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(clean)) return false;
  }

  return true;
}

export function sanitizePlayerName(name: string): string {
  if (!name || typeof name !== "string") return "";
  return name.trim().slice(0, 25);
}
