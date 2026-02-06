import { GameSearchRequest, SearchResult } from "@/types";

import { fetchConsoleGames } from "./backend";
import {
  getMatchScore,
  getRegionPriority,
  matchesAllWords,
  normalizeGameName,
} from "./util";

/**
 * Searches the currently cached Myrient 'database' to find any matching game info
 * @param searchRequest A specific search request to return search results for
 * @returns
 */
export async function searchMyrient(
  searchRequest: GameSearchRequest,
): Promise<SearchResult[]> {
  const { gameName, console: gameConsole } = searchRequest;

  const consoleGames = await fetchConsoleGames(gameConsole!);

  try {
    // Check if user specified a region in their query
    const queryRegionMatch = gameName.match(
      /\b(World|USA|US|Europe|EU|PAL|Japan|JP|En|Ja)\b/i,
    );
    let preferredRegions: string[] | undefined;

    let cleanGameName = gameName;
    if (queryRegionMatch) {
      const specifiedRegion = queryRegionMatch[1];
      // Map common abbreviations to full region names
      const regionMap: Record<string, string[]> = {
        US: ["USA", "En"],
        USA: ["USA", "En"],
        EU: ["Europe", "En"],
        Europe: ["Europe", "En"],
        PAL: ["Europe", "En"],
        JP: ["Japan", "Ja"],
        Japan: ["Japan", "Ja"],
        World: ["World"],
        En: ["En", "USA", "Europe"],
        Ja: ["Ja", "Japan"],
      };

      preferredRegions = regionMap[specifiedRegion] || [specifiedRegion];

      // Remove region from game name for better matching
      cleanGameName = gameName
        .replace(/\([^)]*\)/g, "")
        .trim()
        .trim();
    }

    // First pass: Find all games that match the name
    const nameMatches = consoleGames.filter((game) => {
      // Remove region tags for name matching
      const gameNameWithoutRegion = game.name.replace(/\([^)]*\)/g, "").trim();
      return matchesAllWords(cleanGameName, gameNameWithoutRegion);
    });

    if (nameMatches.length === 0) {
      return [
        {
          name: cleanGameName,
          contentName: gameName,
          url: null,
          region: null,
          status: "error",
          enabled: false,
        },
      ];
    }
    // Second pass: Score and filter by region
    const scoredMatches = nameMatches.map((game) => {
      const gameNameWithoutRegion = game.name.replace(/\([^)]*\)/g, "").trim();
      const matchScore = Math.min(
        getMatchScore(cleanGameName, gameNameWithoutRegion),
        getMatchScore(
          normalizeGameName(cleanGameName),
          normalizeGameName(gameNameWithoutRegion),
        ),
      );
      const regionScore = getRegionPriority(game.name, preferredRegions);

      return {
        game,
        matchScore,
        regionScore,
        combinedScore: regionScore * 10000 + matchScore, // Region priority is more important
      };
    });

    // Filter out non-matching regions if region was specified
    // Keep matches that either match the region OR are World/DLC content
    let filteredMatches = scoredMatches.filter(
      ({ combinedScore, regionScore, matchScore }) =>
        combinedScore < 20_000 && matchScore < 15,
    );

    if (filteredMatches.length === 0) {
      return [
        {
          name: cleanGameName,
          contentName: gameName,
          url: null,
          region: null,
          status: "error",
          enabled: false,
        },
      ];
    }

    // Sort by combined score (best matches first)
    filteredMatches.sort((a, b) => a.combinedScore - b.combinedScore);

    // Log for debugging
    console.log(`Search: "${gameName}" (cleaned: "${cleanGameName}")`);
    console.log(`Found ${filteredMatches.length} matches:`);
    filteredMatches.forEach(
      ({ game, matchScore, regionScore, combinedScore }) => {
        console.log(`  - ${game.name}`);
        console.log(
          `    Match: ${matchScore}, Region: ${regionScore}, Combined: ${combinedScore}`,
        );
      },
    );

    // Return all filtered matches
    return filteredMatches.map(({ game }) => ({
      name: gameName,
      contentName: game.name,
      url: game.url,
      region: game.region,
      status: "found" as const,
      enabled: true,
    }));
  } catch (error) {
    return [
      {
        name: gameName,
        contentName: gameName,
        url: null,
        region: null,
        status: "error",
        enabled: false,
      },
    ];
  }
}
