

interface LocationCandidate {
    id: string;
    name: string;
    context?: any[];
}

interface LocationModalProps {
    isOpen: boolean;
    query: string;
    candidates: LocationCandidate[];
    onSelect: (location: string) => void;
    onCancel: () => void;
}

export default function LocationModal({ isOpen, query, candidates, onSelect, onCancel }: LocationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-fade-in-up">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Where is "{query}"?</h3>
                        <p className="text-xs text-gray-500 mt-1">Found multiple matches. Please select one.</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {candidates.map((candidate) => (
                        <button
                            key={candidate.id}
                            onClick={() => onSelect(candidate.name)}
                            className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg group transition-colors border-b border-gray-50 last:border-0"
                        >
                            <div className="font-medium text-gray-800 group-hover:text-indigo-700">
                                {candidate.name}
                            </div>
                            {/* Parsing context if needed, but name is usually full address */}
                        </button>
                    ))}

                    {candidates.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No matches found.
                        </div>
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 text-right">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
