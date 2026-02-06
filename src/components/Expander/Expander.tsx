import { useState } from "react";

export default function Expander({
    title,
    isExpanded,
    children
}: {
    title: React.ReactNode;
    isExpanded: boolean;
    children: React.ReactNode;
}) {

    const [isOpen, setIsOpen] = useState(isExpanded);

    return (
        <div className="border border-muted">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-background border-muted hover:bg-muted text-slate-200 font-medium py-2 px-4 focus:outline-none"
            >
                <span>{title}</span>
                <svg className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="p-4 bg-background border-t border-muted">
                    {children}
                </div>
            )}
        </div>
    );
}