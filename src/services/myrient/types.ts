import { Region } from "@/types";

/**
 * Info about a currently cached game/game download (i.e. DLC/etc). This includes the name of the content, URL, and its region
 */
export interface CachedGame {
  name: string;
  url: string;
  region: Region;
}
