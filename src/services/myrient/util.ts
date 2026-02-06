import { Region, REGION_PRIORITY } from "@/types";
import { CachedGame } from "./types";

/**
 * Normalize a game name for better matching
 * Removes special characters, extra spaces, and normalizes case
 * Also handles "The" prefix normalization
 */
export function normalizeGameName(name: string): string {
  let normalized = name
    .toLowerCase()
    .replace(/[™®©]/g, "") // Remove trademark symbols
    .replace(/[:\-–—]/g, " ") // Replace punctuation with spaces
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();

  // Handle "The" prefix - convert "The Game" to "game the"
  // This allows matching regardless of whether user types "The Game" or "Game"
  const theMatch = normalized.match(/^the\s+(.+)$/);
  if (theMatch) {
    normalized = `${theMatch[1]} the`;
  }

  return normalized;
}

/**
 * Parse the HTML directory listing from Myrient
 */
export function parseDirectoryListing(
  html: string,
  baseUrl: string,
): CachedGame[] {
  const games: CachedGame[] = [];

  // Myrient uses a simple directory listing format
  // Links are in format: <a href="filename">filename</a>
  const linkRegex =
    /<a href="([^"]+)"[^>]*>([^<]+)<\/a>\s*(\d{2}-\w{3}-\d{4}\s+\d{2}:\d{2})?\s*([0-9.]+[KMGT]?)?/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const [, href, name, , ,] = match;

    // Skip parent directory links and non-game files
    if (href === "../" || href === "/") continue;

    // Filter for common ROM/ISO extensions
    if (href.match(/\.(zip|7z|rar|iso|cue|bin|chd)$/i)) {
      try {
        // Clean up the name (remove HTML entities)
        const cleanName = decodeURIComponent(
          name
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .trim(),
        );

        games.push({
          name: decodeURIComponent(cleanName),
          url: `${baseUrl}${href}`,
          region:
            extractRegions(cleanName).length > 0
              ? (extractRegions(cleanName)[0] as Region)
              : "World",
        });
      } catch (e) {
        console.warn(`Failed to decode URL for ${name}, skipping.`);
      }
    }
  }

  return games;
}

/**
 * Extract region tags from game name
 * Common formats: (USA), (Europe), (Japan), (En), (World), etc.
 */
function extractRegions(gameName: string): string[] {
  const regions: string[] = [];
  const regionRegex = /\(([^)]+)\)/g;

  let match;
  while ((match = regionRegex.exec(gameName)) !== null) {
    regions.push(match[1]);
  }

  return regions;
}

/**
 * Calculate region priority score (lower is better)
 * Checks if the game matches preferred regions
 */
export function getRegionPriority(
  gameName: string,
  preferredRegions?: string[],
): number {
  const regions = extractRegions(gameName);

  // If no regions found, give it a neutral score (include World/DLC content)
  if (regions.length === 0) return 0;

  const regionsToCheck = preferredRegions || REGION_PRIORITY;

  // Check each region in priority order
  for (let i = 0; i < regionsToCheck.length; i++) {
    const preferredRegion = regionsToCheck[i];

    // Check if any region in the game name contains the preferred region
    for (const region of regions) {
      if (region.includes(preferredRegion)) {
        return i; // Return priority index (0 is highest priority)
      }
    }
  }

  // Special case: If World/DLC content, still include it
  for (const region of regions) {
    if (region.includes("World") || region.includes("DLC")) {
      return 0; // Highest priority for World/DLC
    }
  }

  // If specified regions don't match, deprioritize but don't exclude
  return preferredRegions ? 1000 : 100;
}

/**
 * Check if a game name contains all words from the search query
 * This is the primary matching logic
 */
export function matchesAllWords(
  searchQuery: string,
  gameName: string,
): boolean {
  /**
   * Check if two game names match when considering "The" variations
   * Handles: "The Darkness" vs "Darkness, The" vs "Darkness"
   */
  function namesMatchWithTheVariations(name1: string, name2: string): boolean {
    const norm1 = normalizeGameName(name1);
    const norm2 = normalizeGameName(name2);

    // Direct match after normalization
    if (norm1 === norm2) return true;

    // Check if one contains "the" and the other doesn't
    const name1WithoutThe = norm1
      .replace(/\bthe\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const name2WithoutThe = norm2
      .replace(/\bthe\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    return name1WithoutThe === name2WithoutThe;
  }

  const normalizedSearch = normalizeGameName(searchQuery);
  const normalizedGame = normalizeGameName(gameName);

  // First check for exact or "The" variant match
  if (namesMatchWithTheVariations(searchQuery, gameName)) return true;

  // Split search query into words
  const searchWords = normalizedSearch.split(/\s+/);

  // All search words must appear in the game name
  // But skip "the" as a required word since we handle it specially
  return searchWords
    .filter((word) => word !== "the")
    .every((word) => normalizedGame.includes(word));
}

/**
 * Calculate match quality score (lower is better)
 * This helps rank multiple matches
 */
export function getMatchScore(searchQuery: string, gameName: string): number {
  const normalizedSearch = normalizeGameName(searchQuery);
  const normalizedGame = normalizeGameName(gameName);

  // Exact match after normalization
  if (normalizedGame === normalizedSearch) return 0;

  // Game name starts with search query
  if (normalizedGame.startsWith(normalizedSearch)) return 1;

  // Search query appears as complete substring
  if (normalizedGame.includes(normalizedSearch)) return 2;

  // All words match (already verified by matchesAllWords)
  // Score based on length difference (shorter names ranked higher)
  return 10 + Math.abs(normalizedGame.length - normalizedSearch.length);
}
