
export interface Discovery {
    id: string;
    prompt: string;
    rootNodeId: string;
    createdAt: string;
    lastAccessedAt: string;
    status: 'active' | 'archived';
}

export type NodeCategory = 'Destination' | 'Activity' | 'Accommodation' | 'Food' | 'Transportation' | 'Culture';
export type NodeType = 'template' | 'discovery';

export interface NodeContent {
    [key: string]: any;
}

export interface Node {
    id: string;
    discoveryId: string;
    parentNodeId?: string;
    type: NodeType;
    category: NodeCategory;
    title: string;
    content: NodeContent;
    childrenLoaded: boolean;
    createdAt: string;
    contextHash?: string;
}

export interface Session {
    id: string;
    discoveryId: string;
    currentNodeId: string;
    history: { nodeId: string; title: string, category: string }[];
    historyIndex: number;
    lastUpdatedAt: string;
}
