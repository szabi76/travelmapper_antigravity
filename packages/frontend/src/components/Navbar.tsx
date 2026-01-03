
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { createDiscovery, listDiscoveries, getNode, enrichNode } from '../lib/api';
import { useGraphStore, useSessionStore, useLogStore } from '../lib/store';

const Navbar = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);

    const { clearGraph, addNodes, setSelectedNode } = useGraphStore();
    const { setSessionId, sessionId } = useSessionStore();
    const { addLog } = useLogStore();
    const historyRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
                setHistoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const list = await listDiscoveries();
            setDiscoveries(list);
        } catch (e) {
            console.error('Failed to load history', e);
            addLog(`Failed to load history: ${String(e)}`, 'error');
        }
    };

    const loadSession = async (discovery: any) => {
        setLoading(true);
        setHistoryOpen(false); // Close dropdown
        addLog(`Loading session: ${discovery.title || discovery.prompt}...`, 'info');
        try {
            clearGraph();
            setSessionId(discovery.id);

            // Load Root Node
            let rootNode = await getNode(discovery.rootNodeId);

            // Self-Healing
            const isFallback = !rootNode.content?.description ||
                !rootNode.content.location || // Missing location data
                rootNode.content.description.startsWith('Root node for:') ||
                rootNode.content.description.startsWith('Explore ');

            if (isFallback) {
                addLog('Enriching legacy content...', 'info');
                try {
                    const richNode = await enrichNode(rootNode.id);
                    rootNode = richNode;
                    addLog('Content enriched successfully!', 'success');
                } catch (err) {
                    console.error('Auto-enrichment failed', err);
                    addLog('Failed to enrich legacy content', 'error');
                }
            }

            // Format for ReactFlow
            const appNode = {
                id: rootNode.id,
                type: rootNode.type || 'template',
                position: { x: 0, y: 0 },
                data: {
                    ...rootNode,
                    label: rootNode.title
                }
            };

            addNodes([appNode]);

            setTimeout(() => {
                console.log('Selecting root node:', appNode.data.title);
                setSelectedNode(appNode);
            }, 100);

            addLog(`Session loaded: ${rootNode.title}`, 'success');

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

            await fetchHistory();
            await loadSession(discovery);
            setPrompt('');
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || String(error);
            addLog(`Failed to create discovery: ${msg}`, 'error');
            alert(`Failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm z-40">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">TravelMapper</h1>
            </div>

            {/* Central Search/Create */}
            <form onSubmit={handleCreate} className="flex-1 max-w-2xl mx-8 relative">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Where do you want to go next?"
                    className="w-full pl-4 pr-12 py-2 rounded-full border border-gray-300 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                    {loading ? (
                        <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    )}
                </button>
            </form>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
                {/* History Dropdown */}
                <div className="relative" ref={historyRef}>
                    <button
                        onClick={() => setHistoryOpen(!historyOpen)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <span>My Trips</span>
                        <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs">
                            {discoveries.length}
                        </span>
                    </button>

                    {historyOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 max-h-[80vh] overflow-y-auto">
                            <div className="px-4 py-2 border-b border-gray-50 mb-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Discoveries</h3>
                            </div>
                            {discoveries.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-400 italic text-center">No trips yet</div>
                            ) : (
                                discoveries.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => loadSession(d)}
                                        className={clsx(
                                            "w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex flex-col",
                                            sessionId === d.id && "bg-indigo-50 border-l-4 border-indigo-600"
                                        )}
                                    >
                                        <span className="font-medium text-gray-900 truncate w-full block">{d.title || d.prompt}</span>
                                        <span className="text-xs text-gray-400 mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* User/Avatar Placeholder */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-white cursor-pointer" />
            </div>
        </div>
    );
};

export default Navbar;
