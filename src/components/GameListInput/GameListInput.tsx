import { GameConsole, GAME_CONSOLES } from '@/types';
import { FcSearch } from 'react-icons/fc';

interface GameListInputProps {
    gameList: string;
    setGameList: (value: string) => void;

    gameConsole?: GameConsole;
    setGameConsole: (value: GameConsole) => void;

    onSearch: () => void;
    onClear: () => void;

    isSearching: boolean;
}

export default function GameListInput({
    gameList,
    setGameList,
    gameConsole,
    setGameConsole,
    onSearch,
    onClear,
    isSearching
}: GameListInputProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-white mb-4 mt-2">
                    Game List (one per line)
                </label>
                <textarea
                    value={gameList}
                    onChange={(e) => setGameList(e.target.value)}
                    placeholder="Enter game names, one per line...&#10;Example:&#10;Super Mario 64&#10;The Legend of Zelda - Ocarina of Time&#10;Final Fantasy VII"
                    className="w-full h-96 bg-background border border-muted rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-highlight font-mono text-sm"
                    disabled={isSearching}
                />
            </div>


            <div>
                <select
                    value={gameConsole?.name}
                    onChange={(e) => setGameConsole(GAME_CONSOLES.find(c => c.name === e.target.value)!)}
                    className="bg-background hover:bg-background-600 hover:bg-muted disabled:bg-background-600 disabled:cursor-not-allowed text-white font-medium py-3 px-2 border border-muted transition-colors w-full">
                    <option value="">Select Console</option>
                    {GAME_CONSOLES.map((console) => (
                        <option key={console.name} value={console.name}>
                            {console.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onSearch}
                    disabled={isSearching || !gameList.trim()}
                    className="flex-1 bg-background border border-muted hover:bg-muted disabled:cursor-not-allowed text-white font-medium py-3 px-6 flex items-center justify-center gap-2 transition-colors"
                >
                    <FcSearch size={20} />
                    {isSearching ? 'Searching...' : 'Search Myrient'}
                </button>
                <button
                    onClick={onClear}
                    disabled={isSearching}
                    className="bg-background border border-muted hover:bg-muted disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 transition-colors"
                >
                    Clear
                </button>
            </div>

        </div>
    );
}