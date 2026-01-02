
import { useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    addEdge,
} from 'reactflow';
import type {
    Connection,
    Edge,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { useGraphStore } from '../lib/store';

const nodeTypes = {
    template: CustomNode,
    discovery: CustomNode, // Reusing same component for now
};

const GraphCanvas = ({ onNodeClick }: { onNodeClick: (node: Node) => void }) => {
    // Use local state for ReactFlow to handle interaction smoothly, sync with Store if needed
    // Or bind Store directly. For MVP, linking local hooks to store actions.

    const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useGraphStore();

    const onConnect = useCallback((params: Connection | Edge) => {
        // Typically we don't manually connect in this app, but good to have.
        setEdges(addEdge(params, edges));
    }, [edges, setEdges]);

    return (
        <div className="h-full w-full bg-slate-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => onNodeClick(node)}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default GraphCanvas;
