import { SearchResult } from '@/types';
import ResultItem from '@/components/ResultItem/ResultItem';
import { FcCancel, FcCheckmark, FcDownload, FcExport } from "react-icons/fc";
import Expander from '@/components/Expander/Expander';

interface ResultsListProps {
    results: SearchResult[];
    updateResult: (index: number, updatedResult: SearchResult) => void;

    onDownload: () => void;
    onCopy: () => void;
}

export default function ResultsList({ results, updateResult, onDownload, onCopy }: ResultsListProps) {
    const foundCount = results.filter(r => r.status === 'found').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const enabledCount = results.filter(r => r.enabled).length;

    const groupedResults = results.reduce((accumulator: { [key: string]: SearchResult[] }, current) => {
        const key = current.name;
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        accumulator[key].push(current);
        return accumulator;
    }, {});

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between min-h-9">
                <label className="block text-sm font-medium text-slate-300">
                    Results ({results.length})
                </label>
                {results.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCopy}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                            <FcExport size={20} />
                            Copy URLs
                        </button>

                        <button
                            onClick={onDownload}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                            <FcDownload size={20} />
                            Download URLs
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-background border border-muted rounded-lg h-96 overflow-y-auto">
                {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white">
                        <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>Results will appear here</p>
                    </div>

                ) : (
                    <div className="p-4 space-y-2">
                        {Object.entries(groupedResults).map(([name, group]) => (

                            <Expander key={name} title={
                                <div className="flex items-center justify-between gap-2">
                                    {group.find(r => r.status === "error") !== undefined ? (
                                        <FcCancel size={20} />
                                    ) : <FcCheckmark size={20} />}
                                    <span>{name} ({group.length} files)</span>
                                </div>
                            } isExpanded={false}>
                                <div className="space-y-2">
                                    {group?.map((result, idx) => (
                                        <ResultItem
                                            key={idx}
                                            result={result}
                                            onUpdate={(updatedResult) => updateResult(results.indexOf(result), updatedResult)}
                                        />
                                    ))}
                                </div>
                            </Expander>
                        ))}
                    </div>
                )}
            </div>



            {results.length > 0 && (
                <div className="bg-background border border-muted p-4 !mt-5">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-slate-400">Found:</span>
                            <span className="text-green-400 font-bold ml-2">{foundCount}</span>
                        </div>

                        <div>
                            <span className="text-slate-400">Enabled:</span>
                            <span className="text-blue-400 font-bold ml-2">{enabledCount}</span>
                        </div>

                        <div>
                            <span className="text-slate-400">Errors:</span>
                            <span className="text-red-400 font-bold ml-2">{errorCount}</span>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}