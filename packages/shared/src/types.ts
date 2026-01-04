
export interface Discovery {
    id: string; // DISCOVERY#<uuid>
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
    photos?: string[];
    sections?: {
        id: string;
        title: string;
        items: { title: string; type: string; description: string; photo?: string }[];
    }[];
}

export interface Node {
    id: string; // NODE#<uuid>
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
    id: string; // SESSION#<uuid> (usually matches discovery id or generic session)
    discoveryId: string;
    currentNodeId: string;
    history: { nodeId: string; title: string, category: string }[];
    historyIndex: number;
    lastUpdatedAt: string;
}

export interface AICacheEntry {
    hash: string;
    type: string;
    category: string;
    content: any;
    model: string;
    createdAt: string;
    ttl: number;
}
