import { create } from 'zustand';
import type { Node as ReactFlowNode, Edge as ReactFlowEdge, OnNodesChange, OnEdgesChange } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';


// Define basic types here to avoid circular dep if types.ts isn't shared yet
// Ideally we share types, but monorepo linking might be complex for MVP. Copy-paste or specialized frontend types.
export interface AppNode extends ReactFlowNode {
    data: {
        title: string;
        category: string;
        type: string;
        onExpand?: () => void;
        [key: string]: any;
    }
}

interface GraphState {
    nodes: AppNode[];
    edges: ReactFlowEdge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    setNodes: (nodes: AppNode[]) => void;
    setEdges: (edges: ReactFlowEdge[]) => void;
    addNodes: (nodes: AppNode[]) => void;
    addEdges: (edges: ReactFlowEdge[]) => void;
    clearGraph: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) as AppNode[] }),
    onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    addNodes: (newNodes) => set({ nodes: [...get().nodes, ...newNodes] }),
    addEdges: (newEdges) => set({ edges: [...get().edges, ...newEdges] }),
    clearGraph: () => set({ nodes: [], edges: [] }),
}));

interface SessionState {
    sessionId: string | null;
    history: string[]; // Node IDs
    setSessionId: (id: string) => void;
    addToHistory: (nodeId: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    sessionId: null,
    history: [],
    setSessionId: (id) => set({ sessionId: id }),
    addToHistory: (nodeId) => set((state) => ({ history: [...state.history, nodeId] })),
}));
