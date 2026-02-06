/**
 * Info and details about a specific game console, such as the name in the Redump DB, as well as the specific online/no-intro routes for the console
 */
export interface GameConsoleDetails {
  name: string;
  online_name: string[];
}

export const GAME_CONSOLES = [
  {
    name: "Microsoft - Xbox 360",
    online_name: ["Microsoft - Xbox 360 (Digital)"],
  },
  { name: "Microsoft - Xbox", online_name: [] },
  {
    name: "Sony - PlayStation 3",
    online_name: [
      "Sony - PlayStation 3 (PSN) (DLC)",
      "Sony - PlayStation 3 (PSN) (Content)",
      "Sony - PlayStation 3 (PSN) (Updates)",
    ],
  },
  { name: "Sony - PlayStation 2", online_name: [] },
  { name: "Sony - PlayStation", online_name: [] },
] as const;

export type GameConsole = (typeof GAME_CONSOLES)[number];

/**
 * Language/Region priority order
 */
export const REGION_PRIORITY = [
  "World",
  "USA",
  "En",
  "Europe",
  "Japan",
  "Ja",
] as const;

export type Region = (typeof REGION_PRIORITY)[number];

export interface GameSearchRequest {
  gameName: string;
  console?: GameConsole;
}

export interface SearchResult {
  name: string;
  contentName: string;
  url: string | null;
  region: Region | null;
  status: "found" | "error";

  enabled: boolean;
}

export interface SearchProgress {
  current: number;
  total: number;
}
