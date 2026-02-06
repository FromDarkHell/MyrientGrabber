import React from 'react';
import { SearchResult } from '@/types';
import { FcCheckmark, FcCancel } from 'react-icons/fc';

interface ResultItemProps {
    result: SearchResult;
    onUpdate?: (updatedResult: SearchResult) => void;
}

export default function ResultItem({ result, onUpdate }: ResultItemProps) {
    return (
        <div className="bg-background border border-muted p-3 hover:border-slate-600 transition-colors">
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                    {result.status === 'found' ? (<FcCheckmark size={20} />) : (<FcCancel size={20} />)}

                    <input type="checkbox" className="mt-2 " checked={result.enabled} onChange={(e) => {
                        if (onUpdate) {
                            onUpdate({
                                ...result,
                                enabled: e.target.checked,
                            });
                        }
                    }} />
                </div>

                <div className="flex-1 min-w-0">

                    <div className="text-slate-200 font-bold mb-1 flex flex-wrap justify-between items-center">
                        <div className="text-slate-400 text-sm font-normal">
                            {result.contentName}
                        </div>
                    </div>

                    <div>
                        {result.region && (
                            <span className="inline-block text-slate-300 text-xs px-2 py-0.5 rounded mr-2 mb-2">
                                {result.region}
                            </span>
                        )}
                    </div>


                    {result.url && (
                        <div className="text-xs text-slate-500 font-mono break-all">
                            {result.url}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}