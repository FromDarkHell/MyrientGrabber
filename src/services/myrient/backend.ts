import { GameConsole } from "@/types";
import { CachedGame } from "./types";
import { parseDirectoryListing } from "./util";

/**
 * An interface for the cache for the specific console info (all respective games + when it was cached)
 */
interface ConsoleCache {
  games: CachedGame[];
  lastFetched: number;
}

const consoleCache: Map<GameConsole, ConsoleCache> = new Map();

/**
 * Fetch all games for a specific console from Myrient
 */
export async function fetchConsoleGames(
  gameConsole: GameConsole,
): Promise<CachedGame[]> {
  // Check cache first
  const cached = consoleCache.get(gameConsole);
  if (cached) {
    console.log(`Returning stale cache for ${gameConsole}`);
    return cached.games;
  }

  console.log(`Fetching games for ${gameConsole}...`);

  try {
    const baseUrl = "https://myrient.erista.me/files";

    // Use Electron's IPC to fetch from main process
    if (!window.electronAPI) {
      throw new Error("Electron API not available");
    }

    const links = [
      ["/Redump/", gameConsole.name],
      ...gameConsole.online_name.map((name) => ["/No-Intro/", name]),
    ];

    const games = await Promise.all(
      links.map((link) => {
        const [folder, consoleName] = link;
        const contentURL = `${baseUrl}${folder}${encodeURIComponent(consoleName)}/`;

        return window.electronAPI
          .fetchMyrientDirectory(contentURL)
          .then((results) => parseDirectoryListing(results, contentURL));
      }),
    ).then((results) => results.flat());

    console.log(`Game #0 for ${gameConsole}: `, games[0]);

    // Cache the results
    consoleCache.set(gameConsole, {
      games,
      lastFetched: Date.now(),
    });

    console.log(`Cached ${games.length} games for ${gameConsole}`);
    return games;
  } catch (error) {
    console.error(`Error fetching games for ${gameConsole}:`, error);

    throw error;
  }
}
