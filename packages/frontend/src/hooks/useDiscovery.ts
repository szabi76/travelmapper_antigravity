import { useState } from 'react';
import { createDiscovery, listDiscoveries, getNode, enrichNode, searchLocation } from '../lib/api';
import { useGraphStore, useSessionStore, useLogStore } from '../lib/store';
import type { Discovery } from '@travelmapper/shared';

export const useDiscovery = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);

    // Modal State
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

    const { clearGraph, addNodes, setSelectedNode } = useGraphStore();
    const { setSessionId, sessionId } = useSessionStore();
    const { addLog } = useLogStore();

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

            // DEBUG: Check for photos
            addLog(`Node loaded. Photos: ${rootNode.content?.photos?.length || 0}`, rootNode.content?.photos?.length ? 'success' : 'error');

            // Unpack Granular Debug Metadata
            const debug = rootNode.content?._debug;
            if (debug) {
                if (debug.env) {
                    addLog(`🔧 ENV: PhotoKey=${debug.env.photoKey} | MapboxToken=${debug.env.mapboxToken}`, 'info');
                }
                if (debug.photo) {
                    addLog(`📸 PHOTO: Query="${debug.photo.query}" | Status=${debug.photo.status} | Found=${debug.photo.totalFound || 0} | Returned=${debug.photo.returned || 0}`, debug.photo.error ? 'error' : 'info');
                    if (debug.photo.response) {
                        console.log('[DEBUG] Unsplash Response:', debug.photo.response);
                        // Truncate logs for UI to prevent crashing, but give enough info
                        addLog(`📸 PAYLOAD: ${JSON.stringify(debug.photo.response).substring(0, 500)}... (See DevTools for full)`, 'info');
                    }
                    if (debug.photo.error) addLog(`📸 PHOTO ERR: ${debug.photo.error}`, 'error');
                }
                if (debug.geo) {
                    addLog(`🌍 GEO: Query="${debug.geo.query}" | Found=${debug.geo.geoFound} | Alt=${debug.geo.altitude}m`, debug.geo.error ? 'error' : 'info');
                    if (debug.geo.response) {
                        console.log('[DEBUG] Mapbox Response:', debug.geo.response);
                        addLog(`🌍 PAYLOAD: ${JSON.stringify(debug.geo.response).substring(0, 500)}... (See DevTools for full)`, 'info');
                    }
                }
            } else {
                // Fallback for old API versions
                if (rootNode.content?._debugPhotoError) {
                    addLog(`PHOTO ERROR: ${rootNode.content._debugPhotoError}`, 'error');
                }
            }

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
    };

    const performCreation = async (currentPrompt: string, context?: string) => {
        setLoading(true);
        addLog(`Starting new journey: ${currentPrompt}${context ? ` (${context})` : ''}`, 'info');

        try {
            const discovery = await createDiscovery(currentPrompt, context);
            addLog('Discovery created. Fetching details...', 'success');

            await fetchHistory();
            await loadSession(discovery);
            setPrompt('');
            setPendingPrompt(null);
            setLocationModalOpen(false);
            setCandidates([]);
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || String(error);
            addLog(`Failed to create discovery: ${msg}`, 'error');
            alert(`Failed: ${msg}`);
            setLoading(false); // Only unset loading on fail, otherwise let loadSession handle it
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        // 1. Analyze for ambiguity
        setLoading(true);
        addLog('Checking location...', 'info');
        try {
            const results = await searchLocation(prompt);

            if (results && results.length > 1) {
                // Ambiguous! Open modal
                addLog(`Found ${results.length} locations. Please select one.`, 'info');
                setCandidates(results);
                setPendingPrompt(prompt);
                setLocationModalOpen(true);
                setLoading(false); // Pause loading while user selects
                return;
            } else if (results && results.length === 1) {
                // Exact match, use it contextually
                await performCreation(prompt, results[0].name);
                return;
            }

            // 0 results or failure, proceed with just prompt (AI handles it)
            await performCreation(prompt);

        } catch (e) {
            console.error('Search failed, falling back to AI', e);
            await performCreation(prompt);
        }
    };

    const confirmLocation = (location: string) => {
        if (!pendingPrompt) return;
        performCreation(pendingPrompt, location);
    };

    const cancelLocation = () => {
        setLocationModalOpen(false);
        setPendingPrompt(null);
        setCandidates([]);
        addLog('Creation cancelled selected.', 'info');
    };

    return {
        prompt,
        setPrompt,
        loading,
        discoveries,
        historyOpen,
        setHistoryOpen,
        sessionId,
        fetchHistory,
        loadSession,
        handleCreate,
        // Modal State
        locationModalOpen,
        candidates,
        confirmLocation,
        cancelLocation
    };
};
