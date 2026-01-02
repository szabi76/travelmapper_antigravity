
import { useState } from 'react';
import clsx from 'clsx';
import { createDiscovery } from '../lib/api';
import { useGraphStore, useSessionStore } from '../lib/store';

const Sidebar = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const { clearGraph } = useGraphStore();
    const { setSessionId, sessionId } = useSessionStore();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            const discovery = await createDiscovery(prompt);
            clearGraph();
            setSessionId(discovery.id);

            // Fetch root node? 
            // Usually discovery returns metadata. We need to fetch Root Node.
            // But my API createDiscovery returns discovery object which has rootNodeId.
            // I need to fetch the root node.

            // Actually, backend createDiscovery returns discovery with rootNodeId.
            // I should fetch root node.
            // Import getNode from api.
        } catch (error) {
            console.error(error);
            alert('Failed to create discovery');
        } finally {
            setLoading(false);
            setPrompt('');
        }
    };

    return (
        <div className={clsx(
            "flex flex-col border-r bg-white transition-all duration-300 shadow-xl",
            collapsed ? "w-16" : "w-80"
        )}>
            <div className="flex h-16 items-center justify-between px-4 border-b">
                {!collapsed && <h1 className="text-xl font-bold text-indigo-600 tracking-tight">TravelMapper</h1>}
                <button onClick={() => setCollapsed(!collapsed)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {!collapsed && (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h2 className="text-sm font-semibold text-indigo-900 mb-2">New Discovery</h2>
                            <form onSubmit={handleCreate}>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm resize-none"
                                    placeholder="Where do you want to go?"
                                    rows={3}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                <button
                                    disabled={loading}
                                    className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {loading ? 'Discovering...' : 'Start Journey'}
                                </button>
                            </form>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 mb-2">Current Session</h2>
                            <div className="text-xs text-gray-500">
                                {sessionId ? `ID: ${sessionId.substring(0, 15)}...` : 'No active session'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
