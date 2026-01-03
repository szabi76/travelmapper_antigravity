
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { createDiscovery, listDiscoveries, getNode } from '../lib/api';
import { useGraphStore, useSessionStore, useLogStore } from '../lib/store';

const Sidebar = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const { clearGraph, addNodes, setSelectedNode } = useGraphStore();
    const { setSessionId, sessionId } = useSessionStore();
    const { addLog } = useLogStore();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const list = await listDiscoveries();
            setDiscoveries(list);
            addLog(`Loaded ${list.length} past trips`, 'info');
        } catch (e) {
            console.error('Failed to load history', e);
            addLog(`Failed to load history: ${String(e)}`, 'error');
        }
    };

    const loadSession = async (discovery: any) => {
        setLoading(true);
        addLog(`Loading session: ${discovery.title || discovery.prompt}...`, 'info');
        try {
            clearGraph();
            setSessionId(discovery.id);

            // Load Root Node
            const rootNode = await getNode(discovery.rootNodeId);

            // Format for ReactFlow
            const appNode = {
                id: rootNode.id,
                type: rootNode.type || 'template',
                position: { x: 0, y: 0 }, // Center
                data: {
                    ...rootNode,
                    label: rootNode.title
                }
            };

            addNodes([appNode]);

            // Small delay to allow graph to render before selection
            setTimeout(() => {
                console.log('Selecting root node:', appNode.data.title);
                setSelectedNode(appNode);
            }, 100);

            addLog(`Session loaded: ${rootNode.title}`, 'success');

            // Check for backend-reported AI errors
            if (rootNode.content?._debugError) {
                addLog(`AI Warning: ${rootNode.content._debugError}`, 'error');
            }
        } catch (e) {
            console.error('Failed to load session', e);
            addLog(`Failed to load session: ${String(e)}`, 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        addLog(`Starting new journey: ${prompt}`, 'info');

        try {
            const discovery = await createDiscovery(prompt);
            addLog('Discovery created. Fetching details...', 'success');

            await fetchHistory(); // Refresh list
            await loadSession(discovery); // Use same logic to load the new session
            setPrompt('');
        } catch (error: any) {
            console.error(error);
            // Extract detailed error message if possible
            const msg = error.response?.data?.message || error.message || String(error);
            addLog(`Failed to create discovery: ${msg}`, 'error');
            alert(`Failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={clsx(
            "flex flex-col border-r bg-white transition-all duration-300 shadow-xl z-10",
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
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">My Trips 🌍</h2>
                            <div className="space-y-2">
                                {discoveries.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">No trips yet.</p>
                                )}
                                {discoveries.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => loadSession(d)}
                                        className={clsx(
                                            "w-full text-left p-3 rounded-lg text-sm transition-colors border",
                                            sessionId === d.id
                                                ? "bg-indigo-100 border-indigo-200 text-indigo-900"
                                                : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="font-medium truncate">{d.prompt}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(d.createdAt).toLocaleDateString()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
