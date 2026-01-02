import { useGraphStore } from '../lib/store';

export default function NodeDetails() {
    const { selectedNode, setSelectedNode } = useGraphStore();

    if (!selectedNode) return null;

    const { title, category, content } = selectedNode.data;

    // Safety check for content structure
    const safeContent = typeof content === 'string' ? { description: content } : (content || {});

    return (
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-indigo-50 to-white">
                <div>
                    <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-md">
                        {category || 'Unknown Category'}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                        {title || 'Untitled Node'}
                    </h2>
                </div>
                <button
                    onClick={() => setSelectedNode(null)}
                    className="ml-4 p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 font-sans text-gray-700 space-y-4">

                {/* Description */}
                <div className="prose prose-sm prose-indigo">
                    <p className="text-base leading-relaxed">
                        {safeContent.description || "No description available."}
                    </p>
                </div>

                {/* Best Time to Visit */}
                {safeContent.bestTimeVisit && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">📅 Best Time to Visit</h4>
                        <p className="text-sm text-amber-900">{safeContent.bestTimeVisit}</p>
                    </div>
                )}

                {/* Tags */}
                {safeContent.tags && Array.isArray(safeContent.tags) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {safeContent.tags.map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md border border-gray-200 shadow-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Raw Content Debug (hidden unless dev) */}
                {/* <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-auto mt-4">
                    {JSON.stringify(content, null, 2)}
                </pre> */}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400 italic">
                AI Generated Content
            </div>
        </div>
    );
}
