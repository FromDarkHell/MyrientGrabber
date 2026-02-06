import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import GameListInput from '@/components/GameListInput/GameListInput';
import ResultsList from '@/components/ResultsList/ResultsList';
import { SearchResult, SearchProgress, GameConsole } from '@/types';
import { searchMyrient } from '@/services/myrient';

export default function App() {
    const [gameList, setGameList] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [progress, setProgress] = useState<SearchProgress>({ current: 0, total: 0 });

    const [gameConsole, setGameConsole] = useState<GameConsole | undefined>(undefined);

    const handleSearch = async () => {
        const games = gameList.split('\n').filter(g => g.trim());
        if (games.length === 0 || gameConsole === undefined) return;

        setIsSearching(true);
        setProgress({ current: 0, total: games.length });
        const searchResults: SearchResult[] = [];

        for (let i = 0; i < games.length; i++) {
            const result = await searchMyrient({ gameName: games[i].trim(), console: gameConsole });
            searchResults.push(...result.flat());
            setProgress({ current: i + 1, total: games.length });

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setResults(searchResults);
        setIsSearching(false);
    };

    const handleDownload = () => {
        const foundUrls = results
            .filter(r => r.status === 'found' && r.url)
            .filter(r => r.enabled)
            .map(r => r.url)
            .join('\n');

        const blob = new Blob([foundUrls], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'myrient-urls.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        const foundUrls = results
            .filter(r => r.status === 'found' && r.url)
            .filter(r => r.enabled)
            .map(r => r.url)
            .join('\n');

        window.electronAPI.copyToClipboard(foundUrls);
    };

    const handleClear = () => {
        setGameList('');
        setResults([]);
        setProgress({ current: 0, total: 0 });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="backdrop-blur p-8">
                    <Header />

                    <p className="text-highlight text-sm text-center mb-2 font-bold">Enter game names to search Myrient's Redump database, and generate download URLs</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GameListInput
                            gameList={gameList}
                            setGameList={setGameList}
                            gameConsole={gameConsole}
                            setGameConsole={setGameConsole}
                            onSearch={handleSearch}
                            onClear={handleClear}
                            isSearching={isSearching}
                        />

                        <ResultsList
                            results={results}
                            onDownload={handleDownload}
                            onCopy={handleCopy}
                            updateResult={(index: number, result: SearchResult) => {
                                results[index] = result;
                                setResults([...results]);
                            }}
                        />
                    </div>

                    <div className="mt-6 bg-background border border-muted p-4">
                        <h2 className="text-white gap-2 flex text-2xl">
                            <span className="text-highlight">&gt;&gt;</span>
                            <span className="font-semibold ">How It Works</span>
                        </h2>

                        <p className="text-white ml-5">
                            <ul className="list-disc marker:text-blue-500">
                                <li>Enter game names, one per line</li>
                                <li>Select the target console platform</li>
                                <li>Click "Search Myrient" to query the Redump Database</li>
                                <li>Copy or Save a file with all fo the direct download URLs, for use in a download manager</li>
                            </ul>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}