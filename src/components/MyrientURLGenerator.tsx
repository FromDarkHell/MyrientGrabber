import React, { useState } from 'react';

export default function MyrientURLGenerator() {
    const [gameList, setGameList] = useState('');
    const [results, setResults] = useState<any[]>([]);

    const handleClear = () => {
        setGameList('');
        setResults([]);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-white mb-6">Myrient URL Generator</h1>
                </div>
            </div>
        </div>
    );
}